import {style} from '../spectrum-theme';
import {mergeStyles} from '../runtime';

describe('mergeStyles', () => {
  it('should merge styles', () => {
    let a = style({backgroundColor: 'red-1000', color: 'pink-100'});
    let b = style({fontSize: 'body-xs', backgroundColor: 'gray-50'});
    let expected = style({backgroundColor: 'gray-50', color: 'pink-100', fontSize: 'body-xs'});
    let merged = mergeStyles(a, b);
    expect(merged).toBe(expected);
  });

  it('should merge with arbitrary values', () => {
    let a = style({backgroundColor: 'red-1000', color: '[hotpink]'});
    let b = style({fontSize: '[15px]', backgroundColor: 'gray-50'});
    let expected = style({backgroundColor: 'gray-50', color: '[hotpink]', fontSize: '[15px]'});
    let merged = mergeStyles(a, b);
    expect(merged).toBe(expected);
  });
});
