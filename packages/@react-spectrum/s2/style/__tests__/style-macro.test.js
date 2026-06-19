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
  .Jbs151:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv151:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-OZFeNe {
        --macro-data-OZFeNe: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs151 Jbpv151 -macro-static-OZFeNe"`);
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
  ._kc151 {
    border-top-width: 2px;
  }


  .hc151 {
    border-bottom-width: 2px;
  }


  .mCPFGYc151 {
    border-inline-start-width: var(--m);
  }


  .lc151 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc151 {
    padding-inline-start: var(--S);
  }


  .Rv151 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd151 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc151 {
    --m: 2px;
  }


  .-S_-Sv151 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-6DrPJb {
        --macro-data-6DrPJb: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc151 hc151 mCPFGYc151 lc151 SMBFGYc151 Rv151 ZjUQgKd151 -m_-mc151 -S_-Sv151 -macro-static-6DrPJb"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw151 pg151 -macro-dynamic-ksiu6q"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb151 pHJ3AUd151 -macro-static-4DCFgd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb151 pg151 -macro-dynamic-197x9i6"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B151 __Ya151 -macro-dynamic-clboub"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D151 __Ya151 -macro-static-pdFIDc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D151 __Ya151 -macro-dynamic-n9a5xh"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk151 Qk151 Sk151 Rk151 -macro-dynamic-1esad0h"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm151 Qm151 Sm151 Rm151 -macro-static-Nfrh6d"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm151 Qm151 Sm151 Rm151 -macro-dynamic-7axbah"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc151 vx151 -macro-dynamic-xhgg6a"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a151 vx151 -macro-static-grInxd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_6BNtrc-a151 vx151 -macro-dynamic-hitxxw"`
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

    expect(js()).toMatchInlineSnapshot(`"  gE151 -macro-dynamic-wd489e"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk151 -macro-static-f34NMd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk151 gE151 -macro-dynamic-1qncav6"`);
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
  .gH151 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF151 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE151 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt151 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po151 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm151 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH151 pt151 -macro-dynamic-13m9l9s"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF151 po151 -macro-dynamic-1e5szmx"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE151 pm151 -macro-dynamic-1ltkejq"`);
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
  .gH151 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF151 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h151 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3151 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH151 -macro-dynamic-1ap2imt"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF151 -macro-dynamic-1153npv"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h151 -macro-dynamic-7jyd2s"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g3151 -macro-dynamic-heik00"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY151 -macro-dynamic-1kvorfq"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe151 -macro-dynamic-17tas0w"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw151 -macro-dynamic-1m4zj7o"`);
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
    .plb151 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple151 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb151 -macro-dynamic-1gtim5g"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple151 -macro-dynamic-1v5gwiv"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb151 -macro-dynamic-1gtim5g"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple151 -macro-dynamic-1v5gwiv"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th151 Qh151 Sh151 Rh151 -macro-static-dvFMTb"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th151 {
    padding-top: 24px;
  }


  .Qh151 {
    padding-bottom: 24px;
  }


  .Sh151 {
    padding-inline-start: 24px;
  }


  .Rh151 {
    padding-inline-end: 24px;
  }
}

.-macro-static-dvFMTb {
        --macro-data-dvFMTb: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb151 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-GJJsFd {
        --macro-data-GJJsFd: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE151 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-QA93Ie {
        --macro-data-QA93Ie: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
