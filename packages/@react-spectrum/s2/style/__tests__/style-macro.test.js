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
  .Jbs131:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv131:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-MypNfe {
        --macro-data-MypNfe: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot('" Jbs131 Jbpv131 -macro-static-MypNfe"');
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
  ._kc131 {
    border-top-width: 2px;
  }


  .hc131 {
    border-bottom-width: 2px;
  }


  .mCPFGYc131 {
    border-inline-start-width: var(--m);
  }


  .lc131 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc131 {
    padding-inline-start: var(--S);
  }


  .Rv131 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd131 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc131 {
    --m: 2px;
  }


  .-S_-Sv131 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-uhFF5b {
        --macro-data-uhFF5b: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      '" _kc131 hc131 mCPFGYc131 lc131 SMBFGYc131 Rv131 ZjUQgKd131 -m_-mc131 -S_-Sv131 -macro-static-uhFF5b"'
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

    expect(js()).toMatchInlineSnapshot('"  gw131 pg131 -macro-dynamic-mu4yby"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb131 pHJ3AUd131 -macro-static-CvspF"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb131 pg131 -macro-dynamic-1b9jdne"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B131 __Ya131 -macro-dynamic-4f51mn"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D131 __Ya131 -macro-static-nMoh6b"');
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  -_7PloMd-D131 __Ya131 -macro-dynamic-f33ipt"'
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

    expect(js()).toMatchInlineSnapshot('"  Tk131 Qk131 Sk131 Rk131 -macro-dynamic-efgw2h"');
    expect(overrides).toMatchInlineSnapshot('" Tm131 Qm131 Sm131 Rm131 -macro-static-9GxvHb"');
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  Tm131 Qm131 Sm131 Rm131 -macro-dynamic-15z7wbl"'
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

    expect(js()).toMatchInlineSnapshot('"  -_6BNtrc-woabcc131 vx131 -macro-dynamic-zj2kbi"');
    expect(overrides).toMatchInlineSnapshot('" -_6BNtrc-a131 vx131 -macro-static-EPvKFd"');
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  -_6BNtrc-a131 vx131 -macro-dynamic-jkg234"'
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

    expect(js()).toMatchInlineSnapshot('"  gE131 -macro-dynamic-1osl3dc"');
    expect(overrides).toMatchInlineSnapshot('" Nk131 -macro-static-J7ItY"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk131 gE131 -macro-dynamic-1soyf0e"');
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
  .gH131 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF131 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE131 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt131 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po131 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm131 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  gH131 pt131 -macro-dynamic-15nvpf0"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF131 po131 -macro-dynamic-1g7f3s5"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE131 pm131 -macro-dynamic-1nv6ioy"');
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
  .gH131 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF131 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h131 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3131 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot('"  gH131 -macro-dynamic-43fbrn"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF131 -macro-dynamic-1tkkitt"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h131 -macro-dynamic-zzf86q"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  g3131 -macro-dynamic-19tzf3y"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY131 -macro-dynamic-ea1kkk"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe131 -macro-dynamic-17nl5q"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw131 -macro-dynamic-fjccci"');
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
    .plb131 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple131 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  plb131 -macro-dynamic-a7vfaa"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple131 -macro-dynamic-ojtpnp"');
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot('"  plb131 -macro-dynamic-a7vfaa"');
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      '"  ple131 -macro-dynamic-ojtpnp"'
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th131 Qh131 Sh131 Rh131 -macro-static-D80Fbe"');
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th131 {
    padding-top: 24px;
  }


  .Qh131 {
    padding-bottom: 24px;
  }


  .Sh131 {
    padding-inline-start: 24px;
  }


  .Rh131 {
    padding-inline-end: 24px;
  }
}

.-macro-static-D80Fbe {
        --macro-data-D80Fbe: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb131 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-aOn8Q {
        --macro-data-aOn8Q: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE131 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-kFNJUb {
        --macro-data-kFNJUb: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
