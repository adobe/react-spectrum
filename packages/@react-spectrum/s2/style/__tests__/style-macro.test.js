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
  .Jbs182:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv182:first-child {
      margin-top: 0.5rem;
    }
  }
}

.-macro-static-ko6Cke {
        --macro-data-ko6Cke: {"style":{"marginTop":{":first-child":{"default":4,"lg":8}}},"loc":"undefined:undefined:undefined"};
      }

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs182 Jbpv182 -macro-static-ko6Cke"`);
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
  ._kc182 {
    border-top-width: 2px;
  }


  .hc182 {
    border-bottom-width: 2px;
  }


  .mCPFGYc182 {
    border-inline-start-width: var(--m);
  }


  .lc182 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc182 {
    padding-inline-start: var(--S);
  }


  .Rv182 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd182 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc182 {
    --m: 2px;
  }


  .-S_-Sv182 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

.-macro-static-0MmhLd {
        --macro-data-0MmhLd: {"style":{"borderWidth":2,"paddingX":"edge-to-text","width":"calc(200px - self(borderStartWidth) - self(paddingStart))"},"loc":"undefined:undefined:undefined"};
      }

"
`);

    expect(js).toMatchInlineSnapshot(
      `" _kc182 hc182 mCPFGYc182 lc182 SMBFGYc182 Rv182 ZjUQgKd182 -m_-mc182 -S_-Sv182 -macro-static-0MmhLd"`
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

    expect(js()).toMatchInlineSnapshot(`"  gw182 pg182 -macro-dynamic-qaxtlm"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb182 pHJ3AUd182 -macro-static-WN1rX"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb182 pg182 -macro-dynamic-1eqc8x2"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B182 __Ya182 -macro-dynamic-5lnxaj"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D182 __Ya182 -macro-static-VB56ac"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_7PloMd-D182 __Ya182 -macro-dynamic-g9medp"`
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

    expect(js()).toMatchInlineSnapshot(`"  Tk182 Qk182 Sk182 Rk182 -macro-dynamic-sdroj5"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm182 Qm182 Sm182 Rm182 -macro-static-LYuBCc"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  Tm182 Qm182 Sm182 Rm182 -macro-dynamic-1jxios9"`
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

    expect(js()).toMatchInlineSnapshot(`"  -_6BNtrc-woabcc182 vx182 -macro-dynamic-12zvfl6"`);
    expect(overrides).toMatchInlineSnapshot(`" -_6BNtrc-a182 vx182 -macro-static-In3VTd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(
      `"  -_6BNtrc-a182 vx182 -macro-dynamic-n18xcs"`
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

    expect(js()).toMatchInlineSnapshot(`"  gE182 -macro-dynamic-wc6852"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk182 -macro-static-blqHMd"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk182 gE182 -macro-dynamic-1w5raa2"`);
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
  .gH182 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF182 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE182 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt182 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po182 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm182 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH182 pt182 -macro-dynamic-194okoo"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF182 po182 -macro-dynamic-1jo7z1t"`);
    expect(js({isPressed: true})).toMatchInlineSnapshot(`"  gE182 pm182 -macro-dynamic-1rbzdym"`);
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
  .gH182 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF182 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h182 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3182 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH182 -macro-dynamic-1ao4iih"`);
    expect(js({isHovered: true})).toMatchInlineSnapshot(`"  gF182 -macro-dynamic-1145nlj"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  g_h182 -macro-dynamic-7j0cyg"`);
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      `"  g3182 -macro-dynamic-hdkjvo"`
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(`"  gY182 -macro-dynamic-1kuqrbe"`);
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(`"  gjQquMe182 -macro-dynamic-17scrwk"`);
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(`"  gw182 -macro-dynamic-1m41j3c"`);
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
    .plb182 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple182 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb182 -macro-dynamic-1gskm14"`);
    expect(js({isSelected: true})).toMatchInlineSnapshot(`"  ple182 -macro-dynamic-1v4iwej"`);
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
    expect(js({variant: 'highlight'})).toMatchInlineSnapshot(`"  plb182 -macro-dynamic-1gskm14"`);
    expect(js({variant: 'highlight', isSelected: true})).toMatchInlineSnapshot(
      `"  ple182 -macro-dynamic-1v4iwej"`
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th182 Qh182 Sh182 Rh182 -macro-static-beJ6p"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.prose, _.a;

@layer _.a {
  .Th182 {
    padding-top: 24px;
  }


  .Qh182 {
    padding-bottom: 24px;
  }


  .Sh182 {
    padding-inline-start: 24px;
  }


  .Rh182 {
    padding-inline-end: 24px;
  }
}

.-macro-static-beJ6p {
        --macro-data-beJ6p: {"style":{"padding":24},"loc":"undefined:undefined:undefined"};
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
  .gpQzfVb182 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
}

.-macro-static-C14lFd {
        --macro-data-C14lFd: {"style":{"backgroundColor":"blue-1000/50"},"loc":"undefined:undefined:undefined"};
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
  .-FUeYm-gE182 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

.-macro-static-MSuXIe {
        --macro-data-MSuXIe: {"style":{"--foo":{"type":"backgroundColor","value":"gray-300"}},"loc":"undefined:undefined:undefined"};
      }

"
`);
  });
});
