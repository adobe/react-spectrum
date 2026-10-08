/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {style} from '../spectrum-theme';

function testStyle(...args) {
  let css;
  let js = style.apply(
    {
      addAsset({content}) {
        css = content;
      }
    },
    args
  );
  return {css, js};
}

describe('style-macro', () => {
  it('should handle nested css conditions', () => {
    let {css, js} = testStyle({
      marginTop: {
        ':first-child': {
          default: 4,
          lg: 8
        }
      }
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a, _.b, _.c;

@layer _.b {
  .Jbs18:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv18:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-SVj2X {
        --macro-data-SVj2X: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs18 Jbpv18 -macro-static-SVj2X"`);
  });

  it('should support self references', () => {
    let {css, js} = testStyle({
      borderWidth: 2,
      paddingX: 'edge-to-text',
      width: 'calc(200px - self(borderStartWidth) - self(paddingStart))'
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  ._kc18 {
    border-top-width: 2px;
  }


  .hc18 {
    border-bottom-width: 2px;
  }


  .mCPFGYc18 {
    border-inline-start-width: var(--m);
  }


  .lc18 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc18 {
    padding-inline-start: var(--S);
  }


  .Rv18 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd18 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc18 {
    --m: 2px;
  }


  .-S_-Sv18 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-kmzpnd {
        --macro-data-kmzpnd: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc18 hc18 mCPFGYc18 lc18 SMBFGYc18 Rv18 ZjUQgKd18 -m_-mc18 -S_-Sv18 -macro-static-kmzpnd"`
    );
  });

  it('should support allowed overrides', () => {
    let {js} = testStyle(
      {
        backgroundColor: 'gray-400',
        color: 'black'
      },
      ['backgroundColor']
    );

    let {js: overrides} = testStyle({
      backgroundColor: 'red-400',
      color: 'green-400'
    });

    expect(js()).toMatchInlineSnapshot(`"  gw18 pg18 -macro-dynamic-8zfsty"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb18 pHJ3AUd18 -macro-static-OdmzX"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb18 pg18 -macro-dynamic-xzkvk2"`);
  });

  it('should support allowed overrides for properties that expand into multiple', () => {
    let {js} = testStyle(
      {
        translateX: 32
      },
      ['translateX']
    );

    let {js: overrides} = testStyle({
      translateX: 40
    });

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B18 __Ya18 -macro-dynamic-1rpz13b"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D18 __Ya18 -macro-static-PYBxje"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D18 __Ya18 -macro-dynamic-taihft"`
    );
  });

  it('should support allowed overrides for shorthands', () => {
    let {js} = testStyle(
      {
        padding: 32
      },
      ['padding']
    );

    let {js: overrides} = testStyle({
      padding: 40
    });

    expect(js()).toMatchInlineSnapshot(`"  Tk18 Qk18 Sk18 Rk18 -macro-dynamic-17wzg3t"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm18 Qm18 Sm18 Rm18 -macro-static-tJD4dd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm18 Qm18 Sm18 Rm18 -macro-dynamic-csz1ld"`
    );
  });

  it('should support allowed overrides for fontSize', () => {
    let {js} = testStyle(
      {
        fontSize: 'heading-3xl'
      },
      ['fontSize']
    );

    let {js: overrides} = testStyle({
      fontSize: 'ui-xs'
    });

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc18 vx18 -macro-dynamic-12bvpra"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a18 vx18 -macro-static-G8AL3c"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_6BNtrc-a18 vx18 -macro-dynamic-px7il4"`);
  });

  it("should support allowed overrides for values that aren't defined", () => {
    let {js} = testStyle(
      {
        backgroundColor: 'gray-300'
      },
      ['minWidth']
    );

    let {js: overrides} = testStyle({
      minWidth: 32
    });

    expect(js()).toMatchInlineSnapshot(`"  gE18 -macro-dynamic-n9d72c"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk18 -macro-static-VLN6Ie"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk18 gE18 -macro-dynamic-7d7i86"`);
  });

  it('should support runtime conditions', () => {
    let {js, css} = testStyle({
      backgroundColor: {
        default: 'gray-100',
        isHovered: 'gray-200',
        isPressed: 'gray-300'
      },
      color: {
        default: 'gray-800',
        isHovered: 'gray-900',
        isPressed: 'gray-1000'
      }
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .gH18 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF18 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE18 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt18 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po18 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm18 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH18 pt18 -macro-dynamic-3710tw"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF18 po18 -macro-dynamic-1d9pt71"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE18 pm18 -macro-dynamic-fc87nu"`);
  });

  it('should support nested runtime conditions', () => {
    let {js, css} = testStyle({
      backgroundColor: {
        default: 'gray-100',
        isHovered: 'gray-200',
        isSelected: {
          default: 'blue-800',
          isHovered: 'blue-900'
        }
      }
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .gH18 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF18 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h18 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g318 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH18 -macro-dynamic-10lxinb"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF18 -macro-dynamic-1fdxbl1"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h18 -macro-dynamic-1xv1jfq"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g318 -macro-dynamic-e73bjm"`
    );
  });

  it('should support variant runtime conditions', () => {
    let {js} = testStyle({
      backgroundColor: {
        variant: {
          accent: 'accent-1000',
          primary: 'gray-1000',
          secondary: 'gray-400'
        }
      }
    });

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY18 -macro-dynamic-hjn9nc"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe18 -macro-dynamic-h5e47m"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw18 -macro-dynamic-8z2diu"`);
  });

  it('supports runtime conditions nested inside css conditions', () => {
    let {css, js} = testStyle({
      color: {
        forcedColors: {
          default: 'ButtonText',
          isSelected: 'HighlightText'
        }
      }
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a, _.b;

@layer _.b.l {
  @media (forced-colors: active) {
    .plb18 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple18 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb18 -macro-dynamic-whmumu"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple18 -macro-dynamic-19u767t"`);
  });

  it('inherits parent default when nested branch has no default key', () => {
    let {css, js} = testStyle({
      color: {
        forcedColors: {
          default: 'ButtonText',
          variant: {
            highlight: {isSelected: 'HighlightText'}
          }
        }
      }
    });
    // forcedColors.default should apply when variant=highlight but !isSelected
    expect(css).toContain('ButtonText');
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb18 -macro-dynamic-whmumu"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple18 -macro-dynamic-19u767t"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th18 Qh18 Sh18 Rh18 -macro-static-zKXlkb"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .Th18 {
    padding-top: 24px;
  }


  .Qh18 {
    padding-bottom: 24px;
  }


  .Sh18 {
    padding-inline-start: 24px;
  }


  .Rh18 {
    padding-inline-end: 24px;
  }
}

.-macro-static-zKXlkb {
        --macro-data-zKXlkb: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });

  it('should support colors with opacity', () => {
    let {css} = testStyle({
      backgroundColor: 'blue-1000/50'
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .gpQzfVb18 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-gTBE9d {
        --macro-data-gTBE9d: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });

  it('should support setting css variables', () => {
    let {css} = testStyle({
      '--foo': {
        type: 'backgroundColor',
        value: 'gray-300'
      }
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .-FUeYm-gE18 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-IjtpCd {
        --macro-data-IjtpCd: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
