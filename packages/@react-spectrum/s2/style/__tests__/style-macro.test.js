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
  .Jbs111:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv111:first-child {
      margin-top: 0.5rem;
    }
  }
}

"
`);
    expect(js).toMatchInlineSnapshot(`" Jbs111 Jbpv111"`);
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
  ._kc111 {
    border-top-width: 2px;
  }


  .hc111 {
    border-bottom-width: 2px;
  }


  .mCPFGYc111 {
    border-inline-start-width: var(--m);
  }


  .lc111 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc111 {
    padding-inline-start: var(--S);
  }


  .Rv111 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd111 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc111 {
    --m: 2px;
  }


  .-S_-Sv111 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

"
`);

    expect(js).toMatchInlineSnapshot(`" _kc111 hc111 mCPFGYc111 lc111 SMBFGYc111 Rv111 ZjUQgKd111 -m_-mc111 -S_-Sv111"`);
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

    expect(js()).toMatchInlineSnapshot(`"  gw111 pg111"`);
    expect(overrides).toMatchInlineSnapshot(`" g8tmWqb111 pHJ3AUd111"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  g8tmWqb111 pg111"`);
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

    expect(js()).toMatchInlineSnapshot(`"  -_7PloMd-B111 __Ya111"`);
    expect(overrides).toMatchInlineSnapshot(`" -_7PloMd-D111 __Ya111"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  -_7PloMd-D111 __Ya111"`);
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

    expect(js()).toMatchInlineSnapshot(`"  Tk111 Qk111 Sk111 Rk111"`);
    expect(overrides).toMatchInlineSnapshot(`" Tm111 Qm111 Sm111 Rm111"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Tm111 Qm111 Sm111 Rm111"`);
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

    expect(js()).toMatchInlineSnapshot(`"  gE111"`);
    expect(overrides).toMatchInlineSnapshot(`" Nk111"`);
    expect(js({}, overrides)).toMatchInlineSnapshot(`"  Nk111 gE111"`);
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
  .gH111 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF111 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE111 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt111 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po111 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm111 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  gH111 pt111"`);
    expect(js({ isHovered: true })).toMatchInlineSnapshot(`"  gF111 po111"`);
    expect(js({ isPressed: true })).toMatchInlineSnapshot(`"  gE111 pm111"`);
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
  .gH111 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF111 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h111 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g3111 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot(`"  gH111"`);
    expect(js({ isHovered: true })).toMatchInlineSnapshot(`"  gF111"`);
    expect(js({ isSelected: true })).toMatchInlineSnapshot(`"  g_h111"`);
    expect(js({ isSelected: true, isHovered: true })).toMatchInlineSnapshot(`"  g3111"`);
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

    expect(js({ variant: 'accent' })).toMatchInlineSnapshot(`"  gY111"`);
    expect(js({ variant: 'primary' })).toMatchInlineSnapshot(`"  gjQquMe111"`);
    expect(js({ variant: 'secondary' })).toMatchInlineSnapshot(`"  gw111"`);
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
    .plb111 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple111 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot(`"  plb111"`);
    expect(js({ isSelected: true })).toMatchInlineSnapshot(`"  ple111"`);
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot(`" Th111 Qh111 Sh111 Rh111"`);
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th111 {
    padding-top: 24px;
  }


  .Qh111 {
    padding-bottom: 24px;
  }


  .Sh111 {
    padding-inline-start: 24px;
  }


  .Rh111 {
    padding-inline-end: 24px;
  }
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
  .gpQzfVb111 {
    background-color: rgb(from light-dark(rgb(39, 77, 234), rgb(105, 149, 254)) r g b / 50%);
  }
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
  .-FUeYm-gE111 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

"
`);
  });
});
