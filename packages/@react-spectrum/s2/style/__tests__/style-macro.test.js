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
        .Jbs:first-child {
          margin-top: 0.25rem;
        }
      }

      @layer _.c.p {
        @media (min-width: 64rem) {
          .Jbpv:first-child {
            margin-top: 0.5rem;
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" Jbs Jbpv"');
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
        ._kc {
          border-top-width: 2px;
        }


        .hc {
          border-bottom-width: 2px;
        }


        .mCPFGYc {
          border-inline-start-width: var(--m);
        }


        .lc {
          border-inline-end-width: 2px;
        }


        .SMBFGYc {
          padding-inline-start: var(--S);
        }


        .Rv {
          padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
        }


        .ZjUQgKd {
          width: calc(200px - var(--m) - var(--S));
        }


        .-m_-mc {
          --m: 2px;
        }


        .-S_-Sv {
          --S: calc(var(--F, var(--M)) * 3 / 8);
        }
      }

      "
    `);

    expect(js).toMatchInlineSnapshot(
      '" _kc hc mCPFGYc lc SMBFGYc Rv ZjUQgKd -m_-mc -S_-Sv"'
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

    expect(js()).toMatchInlineSnapshot('"  gw pg"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb pHJ3AUd"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb pg"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B __Ya"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D __Ya"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D __Ya"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk Qk Sk Rk"');
    expect(overrides).toMatchInlineSnapshot('" Tm Qm Sm Rm"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm Qm Sm Rm"');
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

    expect(js()).toMatchInlineSnapshot('"  gE"');
    expect(overrides).toMatchInlineSnapshot('" Nk"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk gE"');
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
        .gH {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .gE {
          background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }


        .pt {
          color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
        }


        .po {
          color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
        }


        .pm {
          color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  gH pt"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF po"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE pm"');
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
        .gH {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .g_h {
          background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
        }


        .g3 {
          background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
        }
      }

      "
    `);
    expect(js({})).toMatchInlineSnapshot('"  gH"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  g3"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw"');
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
          .plb {
            color: ButtonText;
          }
        }


        @media (forced-colors: active) {
          .ple {
            color: HighlightText;
          }
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  plb"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th Qh Sh Rh"');
    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        .Th {
          padding-top: 24px;
        }


        .Qh {
          padding-bottom: 24px;
        }


        .Sh {
          padding-inline-start: 24px;
        }


        .Rh {
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
        .gpQzfVb {
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
        .-FUeYm-gE {
          --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }
      }

      "
    `);
  });
});
