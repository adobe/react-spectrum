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
  .Jbs16:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv16:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-k4lBYc {
        --macro-data-k4lBYc: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs16 Jbpv16 -macro-static-k4lBYc"`);
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
  ._kc16 {
    border-top-width: 2px;
  }


  .hc16 {
    border-bottom-width: 2px;
  }


  .mCPFGYc16 {
    border-inline-start-width: var(--m);
  }


  .lc16 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc16 {
    padding-inline-start: var(--S);
  }


  .Rv16 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd16 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc16 {
    --m: 2px;
  }


  .-S_-Sv16 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-Mb83Ob {
        --macro-data-Mb83Ob: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc16 hc16 mCPFGYc16 lc16 SMBFGYc16 Rv16 ZjUQgKd16 -m_-mc16 -S_-Sv16 -macro-static-Mb83Ob"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw16 pg16 -macro-dynamic-va45iq"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb16 pHJ3AUd16 -macro-static-mluMGe"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb16 pg16 -macro-dynamic-1ka988u"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B16 __Ya16 -macro-dynamic-n4pr0j"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D16 __Ya16 -macro-static-dVorDb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D16 __Ya16 -macro-dynamic-1nqd9c5"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk16 Qk16 Sk16 Rk16 -macro-dynamic-145tku9"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm16 Qm16 Sm16 Rm16 -macro-static-XW4HYc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm16 Qm16 Sm16 Rm16 -macro-dynamic-91t6bt"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc16 vx16 -macro-dynamic-1omk2g2"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a16 vx16 -macro-static-Yts0we"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_6BNtrc-a16 vx16 -macro-dynamic-1c7vv9w"`);
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

    expect(js()).toMatchInlineSnapshot(`"  gE16 -macro-dynamic-91ynya"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk16 -macro-static-tAGYMd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk16 gE16 -macro-dynamic-tnvuwy"`);
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
  .gH16 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF16 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE16 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt16 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po16 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm16 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH16 pt16 -macro-dynamic-phpdio"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF16 po16 -macro-dynamic-ja3wp"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE16 pm16 -macro-dynamic-11mwkcm"`);
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
  .gH16 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF16 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h16 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g316 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH16 -macro-dynamic-meizj9"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF16 -macro-dynamic-116isgz"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h16 -macro-dynamic-1jnn0bo"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g316 -macro-dynamic-1z0sueo"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY16 -macro-dynamic-3c8qja"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe16 -macro-dynamic-2xzl3k"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw16 -macro-dynamic-1tsrwdw"`);
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
    .plb16 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple16 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb16 -macro-dynamic-ia8bis"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple16 -macro-dynamic-vmsn3r"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb16 -macro-dynamic-ia8bis"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple16 -macro-dynamic-vmsn3r"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th16 Qh16 Sh16 Rh16 -macro-static-3XoZ4"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .Th16 {
    padding-top: 24px;
  }


  .Qh16 {
    padding-bottom: 24px;
  }


  .Sh16 {
    padding-inline-start: 24px;
  }


  .Rh16 {
    padding-inline-end: 24px;
  }
}

.-macro-static-3XoZ4 {
        --macro-data-3XoZ4: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb16 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-OHuwdd {
        --macro-data-OHuwdd: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE16 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-g8lhGc {
        --macro-data-g8lhGc: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
