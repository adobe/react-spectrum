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
        .Jbs91:first-child {
          margin-top: 0.25rem;
        }
      }

      @layer _.c.p {
        @media (min-width: 64rem) {
          .Jbpv91:first-child {
            margin-top: 0.5rem;
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" Jbs91 Jbpv91"');
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
        ._kc91 {
          border-top-width: 2px;
        }


        .hc91 {
          border-bottom-width: 2px;
        }


        .mCPFGYc91 {
          border-inline-start-width: var(--m);
        }


        .lc91 {
          border-inline-end-width: 2px;
        }


        .SMBFGYc91 {
          padding-inline-start: var(--S);
        }


        .Rv91 {
          padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
        }


        .ZjUQgKd91 {
          width: calc(200px - var(--m) - var(--S));
        }


        .-m_-mc91 {
          --m: 2px;
        }


        .-S_-Sv91 {
          --S: calc(var(--F, var(--M)) * 3 / 8);
        }
      }

      "
    `);

    expect(js).toMatchInlineSnapshot(
      '" _kc91 hc91 mCPFGYc91 lc91 SMBFGYc91 Rv91 ZjUQgKd91 -m_-mc91 -S_-Sv91"'
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

    expect(js()).toMatchInlineSnapshot('"  gw91 pg91"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb91 pHJ3AUd91"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb91 pg91"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B91 __Ya91"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D91 __Ya91"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D91 __Ya91"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk91 Qk91 Sk91 Rk91"');
    expect(overrides).toMatchInlineSnapshot('" Tm91 Qm91 Sm91 Rm91"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm91 Qm91 Sm91 Rm91"');
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

    expect(js()).toMatchInlineSnapshot('"  gE91"');
    expect(overrides).toMatchInlineSnapshot('" Nk91"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk91 gE91"');
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
        .gH91 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF91 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .gE91 {
          background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }


        .pt91 {
          color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
        }


        .po91 {
          color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
        }


        .pm91 {
          color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  gH91 pt91"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF91 po91"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE91 pm91"');
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
        .gH91 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF91 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .g_h91 {
          background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
        }


        .g391 {
          background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
        }
      }

      "
    `);
    expect(js({})).toMatchInlineSnapshot('"  gH91"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF91"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h91"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  g391"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY91"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe91"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw91"');
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
          .plb91 {
            color: ButtonText;
          }
        }


        @media (forced-colors: active) {
          .ple91 {
            color: HighlightText;
          }
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  plb91"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple91"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th91 Qh91 Sh91 Rh91"');
    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        .Th91 {
          padding-top: 24px;
        }


        .Qh91 {
          padding-bottom: 24px;
        }


        .Sh91 {
          padding-inline-start: 24px;
        }


        .Rh91 {
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
        .gpQzfVb91 {
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
        .-FUeYm-gE91 {
          --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }
      }

      "
    `);
  });
});
