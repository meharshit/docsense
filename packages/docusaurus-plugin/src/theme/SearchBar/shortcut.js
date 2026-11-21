function isApplePlatform() {
  if (typeof navigator === 'undefined') {
    return false;
  }
  return /Mac|iPhone|iPad/.test(navigator.platform || '');
}

/**
 * Parse shortcut strings like "mod+k", "ctrl+shift+k", "/".
 * "mod" = Meta on macOS, Ctrl elsewhere.
 */
export function matchesShortcut(event, shortcut) {
  const parts = String(shortcut || 'mod+k')
    .toLowerCase()
    .split('+')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return false;
  }

  const key = parts[parts.length - 1];
  const wantsMod = parts.includes('mod');
  const wantsCtrl = parts.includes('ctrl') || parts.includes('control');
  const wantsMeta = parts.includes('meta') || parts.includes('cmd') || parts.includes('command');
  const wantsAlt = parts.includes('alt') || parts.includes('option');
  const wantsShift = parts.includes('shift');

  const isMac = isApplePlatform();

  let ctrlOk = true;
  let metaOk = true;

  if (wantsMod) {
    if (isMac) {
      metaOk = event.metaKey;
      ctrlOk = !event.ctrlKey;
    } else {
      ctrlOk = event.ctrlKey;
      metaOk = !event.metaKey;
    }
  } else {
    if (wantsCtrl) {
      ctrlOk = event.ctrlKey;
    } else {
      ctrlOk = !event.ctrlKey;
    }
    if (wantsMeta) {
      metaOk = event.metaKey;
    } else {
      metaOk = !event.metaKey;
    }
  }

  const altOk = wantsAlt ? event.altKey : !event.altKey;
  const shiftOk = wantsShift ? event.shiftKey : !event.shiftKey;
  const keyOk = event.key.toLowerCase() === key;

  return keyOk && ctrlOk && metaOk && altOk && shiftOk;
}

/** Human-readable hint for the trigger button. */
export function shortcutHint(shortcut) {
  const raw = String(shortcut || 'mod+k').toLowerCase();
  const isMac = isApplePlatform();

  return raw
    .split('+')
    .map((part) => {
      const p = part.trim();
      if (p === 'mod') {
        return isMac ? '⌘' : 'Ctrl';
      }
      if (p === 'meta' || p === 'cmd' || p === 'command') {
        return '⌘';
      }
      if (p === 'ctrl' || p === 'control') {
        return 'Ctrl';
      }
      if (p === 'alt' || p === 'option') {
        return isMac ? '⌥' : 'Alt';
      }
      if (p === 'shift') {
        return '⇧';
      }
      return p.length === 1 ? p.toUpperCase() : p;
    })
    .join(isMac ? '' : '+');
}
