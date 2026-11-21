import { cpSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fromTheme = join(root, 'src', 'theme');
const toTheme = join(root, 'dist', 'theme');
const fromClient = join(root, 'src', 'client');
const toClient = join(root, 'dist', 'client');

mkdirSync(toTheme, { recursive: true });
cpSync(fromTheme, toTheme, { recursive: true });

mkdirSync(toClient, { recursive: true });
cpSync(fromClient, toClient, { recursive: true });

console.log('Copied theme → dist/theme');
console.log('Copied client → dist/client');
