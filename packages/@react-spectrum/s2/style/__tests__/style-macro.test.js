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
"@layer _.a, _.b, _.c;

@layer _.b {
  .Jbs13:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv13:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-YFh7Dd {
        --macro-data-YFh7Dd: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot('" Jbs13 Jbpv13 -macro-static-YFh7Dd"');
  });

  it('should support self references', () => {
    let {css, js} = testStyle({
      borderWidth: 2,
      paddingX: 'edge-to-text',
      width: 'calc(200px - self(borderStartWidth) - self(paddingStart))'
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  ._kc13 {
    border-top-width: 2px;
  }


  .hc13 {
    border-bottom-width: 2px;
  }


  .mCPFGYc13 {
    border-inline-start-width: var(--m);
  }


  .lc13 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc13 {
    padding-inline-start: var(--S);
  }


  .Rv13 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd13 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc13 {
    --m: 2px;
  }


  .-S_-Sv13 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-1Cddbe {
        --macro-data-1Cddbe: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot('" _kc13 hc13 mCPFGYc13 lc13 SMBFGYc13 Rv13 ZjUQgKd13 -m_-mc13 -S_-Sv13 -macro-static-1Cddbe"');
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

    expect(js()).toMatchInlineSnapshot('"  gw13 pg13 -macro-dynamic-1sq4ojw"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb13 pHJ3AUd13 -macro-static-y8GgU"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb13 pg13 -macro-dynamic-ip5paw"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B13 __Ya13 -macro-dynamic-x9xvvh"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D13 __Ya13 -macro-static-RwkXic"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D13 __Ya13 -macro-dynamic-1xvle73"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk13 Qk13 Sk13 Rk13 -macro-dynamic-1y1msxh"');
    expect(overrides).toMatchInlineSnapshot('" Tm13 Qm13 Sm13 Rm13 -macro-static-9aCkg"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm13 Qm13 Sm13 Rm13 -macro-dynamic-12xmef1"');
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

    expect(js()).toMatchInlineSnapshot('"  -_6BNtrc-woabcc13 vx13 -macro-dynamic-n1gji4"');
    expect(overrides).toMatchInlineSnapshot('" -_6BNtrc-a13 vx13 -macro-static-Qivc3b"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_6BNtrc-a13 vx13 -macro-dynamic-amscby"');
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

    expect(js()).toMatchInlineSnapshot('"  gE13 -macro-dynamic-n9ew9r"');
    expect(overrides).toMatchInlineSnapshot('" Nk13 -macro-static-kp86Ie"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk13 gE13 -macro-dynamic-1r3wdy4"');
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
"@layer _.a;

@layer _.a {
  .gH13 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF13 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE13 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt13 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po13 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm13 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  gH13 pt13 -macro-dynamic-1mxpwju"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF13 po13 -macro-dynamic-xzamxv"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE13 pm13 -macro-dynamic-1t1eo"');
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
"@layer _.a;

@layer _.a {
  .gH13 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF13 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h13 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g313 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot('"  gH13 -macro-dynamic-10lz7uq"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF13 -macro-dynamic-1fdz0sg"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h13 -macro-dynamic-1xv38n5"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot('"  g313 -macro-dynamic-e750r1"');
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY13 -macro-dynamic-hjoyur"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe13 -macro-dynamic-h5ftf1"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw13 -macro-dynamic-8z42q9"');
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
"@layer _.a, _.b;

@layer _.b.l {
  @media (forced-colors: active) {
    .plb13 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple13 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  plb13 -macro-dynamic-whoju9"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple13 -macro-dynamic-19u8vf8"');
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot('"  plb13 -macro-dynamic-whoju9"');
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot('"  ple13 -macro-dynamic-19u8vf8"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th13 Qh13 Sh13 Rh13 -macro-static-jobh3c"');
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th13 {
    padding-top: 24px;
  }


  .Qh13 {
    padding-bottom: 24px;
  }


  .Sh13 {
    padding-inline-start: 24px;
  }


  .Rh13 {
    padding-inline-end: 24px;
  }
}

.-macro-static-jobh3c {
        --macro-data-jobh3c: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });

  it('should support colors with opacity', () => {
    let {css} = testStyle({
      backgroundColor: 'blue-1000/50'
    });

    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .gpQzfVb13 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-FwWE9d {
        --macro-data-FwWE9d: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
"@layer _.a;

@layer _.a {
  .-FUeYm-gE13 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-7WNpCd {
        --macro-data-7WNpCd: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
