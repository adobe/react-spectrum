import {resolveStyleProps} from './styleProps';
import {defaultTheme} from '../theme';

describe('resolveStyleProps', () => {
  it('resolves numeric width/height directly', () => {
    let style = resolveStyleProps({width: 100, height: 50});
    expect(style.width).toBe(100);
    expect(style.height).toBe(50);
  });

  it('resolves spacing token key for margin', () => {
    let style = resolveStyleProps({margin: '400'});
    expect(style.margin).toBe(defaultTheme.spacing['400']);
  });

  it('resolves marginX to left+right', () => {
    let style = resolveStyleProps({marginX: 16});
    expect(style.marginLeft).toBe(16);
    expect(style.marginRight).toBe(16);
  });

  it('resolves paddingY to top+bottom', () => {
    let style = resolveStyleProps({paddingY: 8});
    expect(style.paddingTop).toBe(8);
    expect(style.paddingBottom).toBe(8);
  });

  it('RTL: marginStart maps to marginRight', () => {
    let style = resolveStyleProps({marginStart: 12}, {direction: 'rtl'});
    expect(style.marginRight).toBe(12);
    expect(style.marginLeft).toBeUndefined();
  });

  it('LTR: marginStart maps to marginLeft', () => {
    let style = resolveStyleProps({marginStart: 12}, {direction: 'ltr'});
    expect(style.marginLeft).toBe(12);
    expect(style.marginRight).toBeUndefined();
  });

  it('RTL: paddingEnd maps to paddingLeft', () => {
    let style = resolveStyleProps({paddingEnd: 8}, {direction: 'rtl'});
    expect(style.paddingLeft).toBe(8);
  });

  it('resolves color token key', () => {
    let style = resolveStyleProps({backgroundColor: 'accent'});
    expect(style.backgroundColor).toBe(defaultTheme.colors.accent);
  });

  it('passes raw hex color through unchanged', () => {
    let style = resolveStyleProps({backgroundColor: '#ff0000'});
    expect(style.backgroundColor).toBe('#ff0000');
  });

  it('isHidden sets display none', () => {
    let style = resolveStyleProps({isHidden: true});
    expect(style.display).toBe('none');
  });

  it('returns empty object when no props', () => {
    let style = resolveStyleProps({});
    expect(Object.keys(style).length).toBe(0);
  });
});
