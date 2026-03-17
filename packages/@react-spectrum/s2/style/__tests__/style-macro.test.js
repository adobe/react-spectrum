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
  .Jbs12:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv12:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-a9a4ic {
        --macro-data-a9a4ic: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot('" Jbs12 Jbpv12 -macro-static-a9a4ic"');
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
  ._kc12 {
    border-top-width: 2px;
  }


  .hc12 {
    border-bottom-width: 2px;
  }


  .mCPFGYc12 {
    border-inline-start-width: var(--m);
  }


  .lc12 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc12 {
    padding-inline-start: var(--S);
  }


  .Rv12 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd12 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc12 {
    --m: 2px;
  }


  .-S_-Sv12 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-K2u2od {
        --macro-data-K2u2od: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot('" _kc12 hc12 mCPFGYc12 lc12 SMBFGYc12 Rv12 ZjUQgKd12 -m_-mc12 -S_-Sv12 -macro-static-K2u2od"');
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

    expect(js()).toMatchInlineSnapshot('"  gw12 pg12 -macro-dynamic-4ucsx6"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb12 pHJ3AUd12 -macro-static-kcgSLc"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb12 pg12 -macro-dynamic-tuhvna"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B12 __Ya12 -macro-dynamic-czb8u3"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D12 __Ya12 -macro-static-3ZdUX"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D12 __Ya12 -macro-dynamic-1dkyr5p"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk12 Qk12 Sk12 Rk12 -macro-dynamic-wnhub5"');
    expect(overrides).toMatchInlineSnapshot('" Tm12 Qm12 Sm12 Rm12 -macro-static-VnXYtc"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm12 Qm12 Sm12 Rm12 -macro-dynamic-1jhfsp"');
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

    expect(js()).toMatchInlineSnapshot('"  -_6BNtrc-woabcc12 vx12 -macro-dynamic-y6spui"');
    expect(overrides).toMatchInlineSnapshot('" -_6BNtrc-a12 vx12 -macro-static-uYVOMc"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_6BNtrc-a12 vx12 -macro-dynamic-ls4ioc"');
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

    expect(js()).toMatchInlineSnapshot('"  gE12 -macro-dynamic-1fo9npa"');
    expect(overrides).toMatchInlineSnapshot('" Nk12 -macro-static-zdsIUb"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk12 gE12 -macro-dynamic-384ibe"');
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
  .gH12 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF12 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE12 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt12 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po12 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm12 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  gH12 pt12 -macro-dynamic-1y322w8"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF12 po12 -macro-dynamic-194mta9"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE12 pm12 -macro-dynamic-b757r2"');
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
  .gH12 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF12 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h12 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g312 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot('"  gH12 -macro-dynamic-1t0tza9"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF12 -macro-dynamic-8rpq8v"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h12 -macro-dynamic-r8ty3k"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot('"  g312 -macro-dynamic-16lzs6k"');
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY12 -macro-dynamic-19yjqaa"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe12 -macro-dynamic-19kakuk"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw12 -macro-dynamic-11dyu5s"');
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
    .plb12 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple12 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  plb12 -macro-dynamic-1owjb9s"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple12 -macro-dynamic-37zkvn"');
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot('"  plb12 -macro-dynamic-1owjb9s"');
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot('"  ple12 -macro-dynamic-37zkvn"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th12 Qh12 Sh12 Rh12 -macro-static-1ohgA"');
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th12 {
    padding-top: 24px;
  }


  .Qh12 {
    padding-bottom: 24px;
  }


  .Sh12 {
    padding-inline-start: 24px;
  }


  .Rh12 {
    padding-inline-end: 24px;
  }
}

.-macro-static-1ohgA {
        --macro-data-1ohgA: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb12 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-Ukgglb {
        --macro-data-Ukgglb: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE12 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-mL70N {
        --macro-data-mL70N: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
