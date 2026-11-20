export interface ParsedFrontmatter {
  readonly attributes: Record<string, unknown>;
  readonly body: string;
}

/**
 * Minimal YAML-ish frontmatter parser for docs.
 * Supports `key: value`, `key: "quoted"`, and simple arrays `[a, b]`.
 * Intentionally small — no full YAML dependency in MVP.
 */
export function parseFrontmatter(source: string): ParsedFrontmatter {
  if (!source.startsWith('---')) {
    return { attributes: {}, body: source };
  }

  const end = source.indexOf('\n---', 3);
  if (end === -1) {
    return { attributes: {}, body: source };
  }

  const raw = source.slice(4, end).trim();
  const body = source.slice(end + 4).replace(/^\s*\n/, '');
  const attributes: Record<string, unknown> = {};

  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const sep = trimmed.indexOf(':');
    if (sep === -1) {
      continue;
    }
    const key = trimmed.slice(0, sep).trim();
    const valueRaw = trimmed.slice(sep + 1).trim();
    attributes[key] = parseScalar(valueRaw);
  }

  return { attributes, body };
}

function parseScalar(value: string): unknown {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  if (value.startsWith('[') && value.endsWith(']')) {
    return value
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  return value;
}

export function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function asStringArray(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }
  return undefined;
}
