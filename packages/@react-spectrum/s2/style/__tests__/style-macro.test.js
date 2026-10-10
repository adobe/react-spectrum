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
  .Jbs181:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv181:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-k3W3fd {
        --macro-data-k3W3fd: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs181 Jbpv181 -macro-static-k3W3fd"`);
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
  ._kc181 {
    border-top-width: 2px;
  }


  .hc181 {
    border-bottom-width: 2px;
  }


  .mCPFGYc181 {
    border-inline-start-width: var(--m);
  }


  .lc181 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc181 {
    padding-inline-start: var(--S);
  }


  .Rv181 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd181 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc181 {
    --m: 2px;
  }


  .-S_-Sv181 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-1b73cb {
        --macro-data-1b73cb: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc181 hc181 mCPFGYc181 lc181 SMBFGYc181 Rv181 ZjUQgKd181 -m_-mc181 -S_-Sv181 -macro-static-1b73cb"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw181 pg181 -macro-dynamic-1h8noyg"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb181 pHJ3AUd181 -macro-static-GECTtc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb181 pg181 -macro-dynamic-6my2as"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B181 __Ya181 -macro-dynamic-1od5ond"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D181 __Ya181 -macro-static-VgWx6"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_7PloMd-D181 __Ya181 -macro-dynamic-3rf"`);
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

    expect(js()).toMatchInlineSnapshot(`"  Tk181 Qk181 Sk181 Rk181 -macro-dynamic-yaeigd"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm181 Qm181 Sm181 Rm181 -macro-static-Ho2L0c"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm181 Qm181 Sm181 Rm181 -macro-dynamic-1pu5iph"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc181 vx181 -macro-dynamic-1txlay0"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a181 vx181 -macro-static-EKTuZ"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_6BNtrc-a181 vx181 -macro-dynamic-1dyyspm"`
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

    expect(js()).toMatchInlineSnapshot(`"  gE181 -macro-dynamic-1or0zkl"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk181 -macro-static-q9JiY"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk181 gE181 -macro-dynamic-o2d3ns"`);
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
  .gH181 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF181 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE181 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt181 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po181 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm181 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH181 pt181 -macro-dynamic-11ae2e"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF181 po181 -macro-dynamic-bktsfj"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE181 pm181 -macro-dynamic-j8l7cc"`);
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
  .gH181 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF181 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h181 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3181 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH181 -macro-dynamic-41v7yw"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF181 -macro-dynamic-1tj0f12"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h181 -macro-dynamic-zxv4dz"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g3181 -macro-dynamic-19sfbb7"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY181 -macro-dynamic-e8hgrt"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe181 -macro-dynamic-163hcz"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw181 -macro-dynamic-fhs8jr"`);
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
    .plb181 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple181 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb181 -macro-dynamic-a6bbhj"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple181 -macro-dynamic-oi9luy"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb181 -macro-dynamic-a6bbhj"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple181 -macro-dynamic-oi9luy"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th181 Qh181 Sh181 Rh181 -macro-static-7DghO"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .Th181 {
    padding-top: 24px;
  }


  .Qh181 {
    padding-bottom: 24px;
  }


  .Sh181 {
    padding-inline-start: 24px;
  }


  .Rh181 {
    padding-inline-end: 24px;
  }
}

.-macro-static-7DghO {
        --macro-data-7DghO: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb181 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-RPoXQ {
        --macro-data-RPoXQ: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE181 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-1GOyUb {
        --macro-data-1GOyUb: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
