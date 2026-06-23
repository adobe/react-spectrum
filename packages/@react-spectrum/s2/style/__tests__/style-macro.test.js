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
  .Jbs15:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv15:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-wxfyDb {
        --macro-data-wxfyDb: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs15 Jbpv15 -macro-static-wxfyDb"`);
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
  ._kc15 {
    border-top-width: 2px;
  }


  .hc15 {
    border-bottom-width: 2px;
  }


  .mCPFGYc15 {
    border-inline-start-width: var(--m);
  }


  .lc15 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc15 {
    padding-inline-start: var(--S);
  }


  .Rv15 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd15 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc15 {
    --m: 2px;
  }


  .-S_-Sv15 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-vBpT2 {
        --macro-data-vBpT2: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc15 hc15 mCPFGYc15 lc15 SMBFGYc15 Rv15 ZjUQgKd15 -m_-mc15 -S_-Sv15 -macro-static-vBpT2"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw15 pg15 -macro-dynamic-16fgbv4"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb15 pHJ3AUd15 -macro-static-4cOIRb"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb15 pg15 -macro-dynamic-1vflel8"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B15 __Ya15 -macro-dynamic-2u33z5"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D15 __Ya15 -macro-static-poioi"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D15 __Ya15 -macro-dynamic-13fqmar"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk15 Qk15 Sk15 Rk15 -macro-dynamic-2rom7x"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm15 Qm15 Sm15 Rm15 -macro-static-FXaHv"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm15 Qm15 Sm15 Rm15 -macro-dynamic-16os9ol"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc15 vx15 -macro-dynamic-qs6tc"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a15 vx15 -macro-static-yXDXz"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_6BNtrc-a15 vx15 -macro-dynamic-1nd81ma"`);
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

    expect(js()).toMatchInlineSnapshot(`"  gE15 -macro-dynamic-11gtfdt"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk15 -macro-static-Io0zY"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk15 gE15 -macro-dynamic-14t819c"`);
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
  .gH15 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF15 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE15 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt15 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po15 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm15 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH15 pt15 -macro-dynamic-10n1jv2"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF15 po15 -macro-dynamic-boma93"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE15 pm15 -macro-dynamic-1cs8qp0"`);
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
  .gH15 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF15 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h15 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g315 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH15 -macro-dynamic-1etdqys"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF15 -macro-dynamic-1tldjwi"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h15 -macro-dynamic-d1dps3"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g315 -macro-dynamic-sejjv3"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY15 -macro-dynamic-vr3hyt"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe15 -macro-dynamic-vcucj3"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw15 -macro-dynamic-n6ilub"`);
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
    .plb15 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple15 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb15 -macro-dynamic-1ap32yb"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple15 -macro-dynamic-1o1neja"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb15 -macro-dynamic-1ap32yb"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple15 -macro-dynamic-1o1neja"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th15 Qh15 Sh15 Rh15 -macro-static-PaKDid"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th15 {
    padding-top: 24px;
  }


  .Qh15 {
    padding-bottom: 24px;
  }


  .Sh15 {
    padding-inline-start: 24px;
  }


  .Rh15 {
    padding-inline-end: 24px;
  }
}

.-macro-static-PaKDid {
        --macro-data-PaKDid: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb15 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-3vO7o {
        --macro-data-3vO7o: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE15 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-z8Uxye {
        --macro-data-z8Uxye: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
