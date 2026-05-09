import {defaultTheme} from './tokens';
import {resolveToken} from './resolveToken';

describe('resolveToken', () => {
  it('resolves top-level token', () => {
    expect(resolveToken('colors.accent')).toBe(defaultTheme.colors.accent);
  });

  it('resolves nested path', () => {
    expect(resolveToken('spacing.100')).toBe(defaultTheme.spacing['100']);
  });

  it('returns undefined for unknown path', () => {
    expect(resolveToken('nonexistent.path' as any)).toBeUndefined();
  });

  it('uses custom theme when provided', () => {
    let customTheme = {...defaultTheme, colors: {...defaultTheme.colors, accent: '#ff0000'}};
    expect(resolveToken('colors.accent', customTheme)).toBe('#ff0000');
  });

  it('partial path returns sub-object', () => {
    let result = resolveToken('colors' as any);
    expect(typeof result).toBe('object');
  });
});
