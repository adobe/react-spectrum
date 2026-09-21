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
  .Jbs171:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv171:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-MeH0D {
        --macro-data-MeH0D: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs171 Jbpv171 -macro-static-MeH0D"`);
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
  ._kc171 {
    border-top-width: 2px;
  }


  .hc171 {
    border-bottom-width: 2px;
  }


  .mCPFGYc171 {
    border-inline-start-width: var(--m);
  }


  .lc171 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc171 {
    padding-inline-start: var(--S);
  }


  .Rv171 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd171 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc171 {
    --m: 2px;
  }


  .-S_-Sv171 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-I0dZnb {
        --macro-data-I0dZnb: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc171 hc171 mCPFGYc171 lc171 SMBFGYc171 Rv171 ZjUQgKd171 -m_-mc171 -S_-Sv171 -macro-static-I0dZnb"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw171 pg171 -macro-dynamic-iqwq1i"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb171 pHJ3AUd171 -macro-static-sAxgbb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb171 pg171 -macro-dynamic-176b5cy"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B171 __Ya171 -macro-dynamic-kric1z"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D171 __Ya171 -macro-static-rEV9ad"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D171 __Ya171 -macro-dynamic-vfgt55"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk171 Qk171 Sk171 Rk171 -macro-dynamic-g3zrzd"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm171 Qm171 Sm171 Rm171 -macro-static-nC5nOb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm171 Qm171 Sm171 Rm171 -macro-dynamic-17nqs8h"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc171 vx171 -macro-dynamic-vfuc12"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a171 vx171 -macro-static-S2U0od"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_6BNtrc-a171 vx171 -macro-dynamic-fh7tso"`
    );
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

    expect(js()).toMatchInlineSnapshot(`"  gE171 -macro-dynamic-3xnd5g"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk171 -macro-static-HMbtUb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk171 gE171 -macro-dynamic-1olq6py"`);
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
  .gH171 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF171 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE171 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt171 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po171 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm171 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH171 pt171 -macro-dynamic-11knh4k"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF171 po171 -macro-dynamic-1c46vhp"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE171 pm171 -macro-dynamic-1jryaei"`);
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
  .gH171 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF171 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h171 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3171 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH171 -macro-dynamic-i9lniv"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF171 -macro-dynamic-8pmslx"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h171 -macro-dynamic-1e5ljxy"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g3171 -macro-dynamic-1o05qv6"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY171 -macro-dynamic-sg7wbs"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe171 -macro-dynamic-fdtwwy"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw171 -macro-dynamic-tpio3q"`);
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
    .plb171 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple171 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb171 -macro-dynamic-oe1r1i"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple171 -macro-dynamic-12q01ex"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb171 -macro-dynamic-oe1r1i"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple171 -macro-dynamic-12q01ex"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th171 Qh171 Sh171 Rh171 -macro-static-R3yyie"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .Th171 {
    padding-top: 24px;
  }


  .Qh171 {
    padding-bottom: 24px;
  }


  .Sh171 {
    padding-inline-start: 24px;
  }


  .Rh171 {
    padding-inline-end: 24px;
  }
}

.-macro-static-R3yyie {
        --macro-data-R3yyie: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb171 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-8sQ7Mb {
        --macro-data-8sQ7Mb: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE171 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-ikgJQc {
        --macro-data-ikgJQc: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
