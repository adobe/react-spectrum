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
  .Jbs14:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv14:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-I08ui {
        --macro-data-I08ui: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs14 Jbpv14 -macro-static-I08ui"`);
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
  ._kc14 {
    border-top-width: 2px;
  }


  .hc14 {
    border-bottom-width: 2px;
  }


  .mCPFGYc14 {
    border-inline-start-width: var(--m);
  }


  .lc14 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc14 {
    padding-inline-start: var(--S);
  }


  .Rv14 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd14 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc14 {
    --m: 2px;
  }


  .-S_-Sv14 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-e1GIg {
        --macro-data-e1GIg: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc14 hc14 mCPFGYc14 lc14 SMBFGYc14 Rv14 ZjUQgKd14 -m_-mc14 -S_-Sv14 -macro-static-e1GIg"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw14 pg14 -macro-dynamic-1hksi7i"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb14 pHJ3AUd14 -macro-static-QgnkJd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb14 pg14 -macro-dynamic-7jtiyi"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B14 __Ya14 -macro-dynamic-1hkkiwv"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D14 __Ya14 -macro-static-F3q0Dd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D14 __Ya14 -macro-dynamic-j53z9d"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk14 Qk14 Sk14 Rk14 -macro-dynamic-10enpkp"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm14 Qm14 Sm14 Rm14 -macro-static-rawlJc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm14 Qm14 Sm14 Rm14 -macro-dynamic-5anb29"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc14 vx14 -macro-dynamic-bw4d5q"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a14 vx14 -macro-static-cD4zjb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_6BNtrc-a14 vx14 -macro-dynamic-1yik7yo"`);
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

    expect(js()).toMatchInlineSnapshot(`"  gE14 -macro-dynamic-1tvo6tc"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk14 -macro-static-1ozQQc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk14 gE14 -macro-dynamic-1fyk7lq"`);
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
  .gH14 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF14 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE14 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt14 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po14 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm14 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH14 pt14 -macro-dynamic-1bsdq7g"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF14 po14 -macro-dynamic-mtyglh"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE14 pm14 -macro-dynamic-1nxkx1e"`);
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
  .gH14 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF14 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h14 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g314 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH14 -macro-dynamic-874gf7"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF14 -macro-dynamic-mz49cx"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h14 -macro-dynamic-15g8h7m"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g314 -macro-dynamic-1ktebam"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY14 -macro-dynamic-1o5y9ec"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe14 -macro-dynamic-1nrp3ym"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw14 -macro-dynamic-1fldd9u"`);
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
    .plb14 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple14 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb14 -macro-dynamic-42tseq"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple14 -macro-dynamic-hfe3zp"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb14 -macro-dynamic-42tseq"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple14 -macro-dynamic-hfe3zp"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th14 Qh14 Sh14 Rh14 -macro-static-xbQCP"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th14 {
    padding-top: 24px;
  }


  .Qh14 {
    padding-bottom: 24px;
  }


  .Sh14 {
    padding-inline-start: 24px;
  }


  .Rh14 {
    padding-inline-end: 24px;
  }
}

.-macro-static-xbQCP {
        --macro-data-xbQCP: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb14 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-mwnohc {
        --macro-data-mwnohc: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE14 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-OWe9Jb {
        --macro-data-OWe9Jb: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
