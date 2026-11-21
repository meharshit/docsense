import { describe, expect, it, vi } from 'vitest';
import { matchesShortcut, shortcutHint } from '../theme/SearchBar/shortcut';

function keyEvent(partial: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
}): KeyboardEvent {
  return partial as KeyboardEvent;
}

describe('matchesShortcut', () => {
  it('matches ctrl+k when mod is requested on non-mac', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    expect(
      matchesShortcut(
        keyEvent({ key: 'k', ctrlKey: true, metaKey: false, altKey: false, shiftKey: false }),
        'mod+k',
      ),
    ).toBe(true);
    vi.unstubAllGlobals();
  });

  it('matches a bare slash shortcut', () => {
    expect(
      matchesShortcut(
        keyEvent({ key: '/', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false }),
        '/',
      ),
    ).toBe(true);
  });
});

describe('shortcutHint', () => {
  it('formats ctrl shortcuts', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    expect(shortcutHint('mod+k')).toContain('Ctrl');
    expect(shortcutHint('mod+k')).toContain('K');
    vi.unstubAllGlobals();
  });
});
