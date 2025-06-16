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
        .Jbs92:first-child {
          margin-top: 0.25rem;
        }
      }

      @layer _.c.p {
        @media (min-width: 64rem) {
          .Jbpv92:first-child {
            margin-top: 0.5rem;
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" Jbs92 Jbpv92"');
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
        ._kc92 {
          border-top-width: 2px;
        }


        .hc92 {
          border-bottom-width: 2px;
        }


        .mCPFGYc92 {
          border-inline-start-width: var(--m);
        }


        .lc92 {
          border-inline-end-width: 2px;
        }


        .SMBFGYc92 {
          padding-inline-start: var(--S);
        }


        .Rv92 {
          padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
        }


        .ZjUQgKd92 {
          width: calc(200px - var(--m) - var(--S));
        }


        .-m_-mc92 {
          --m: 2px;
        }


        .-S_-Sv92 {
          --S: calc(var(--F, var(--M)) * 3 / 8);
        }
      }

      "
    `);

    expect(js).toMatchInlineSnapshot(
      '" _kc92 hc92 mCPFGYc92 lc92 SMBFGYc92 Rv92 ZjUQgKd92 -m_-mc92 -S_-Sv92"'
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

    expect(js()).toMatchInlineSnapshot('"  gw92 pg92"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb92 pHJ3AUd92"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb92 pg92"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B92 __Ya92"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D92 __Ya92"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D92 __Ya92"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk92 Qk92 Sk92 Rk92"');
    expect(overrides).toMatchInlineSnapshot('" Tm92 Qm92 Sm92 Rm92"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm92 Qm92 Sm92 Rm92"');
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

    expect(js()).toMatchInlineSnapshot('"  gE92"');
    expect(overrides).toMatchInlineSnapshot('" Nk92"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk92 gE92"');
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
        .gH92 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF92 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .gE92 {
          background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }


        .pt92 {
          color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
        }


        .po92 {
          color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
        }


        .pm92 {
          color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  gH92 pt92"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF92 po92"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE92 pm92"');
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
        .gH92 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF92 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .g_h92 {
          background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
        }


        .g392 {
          background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
        }
      }

      "
    `);
    expect(js({})).toMatchInlineSnapshot('"  gH92"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF92"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h92"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  g392"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY92"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe92"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw92"');
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
          .plb92 {
            color: ButtonText;
          }
        }


        @media (forced-colors: active) {
          .ple92 {
            color: HighlightText;
          }
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  plb92"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple92"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th92 Qh92 Sh92 Rh92"');
    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        .Th92 {
          padding-top: 24px;
        }


        .Qh92 {
          padding-bottom: 24px;
        }


        .Sh92 {
          padding-inline-start: 24px;
        }


        .Rh92 {
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
        .gpQzfVb92 {
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
        .-FUeYm-gE92 {
          --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }
      }

      "
    `);
  });
});
