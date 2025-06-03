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

  return {css, js: typeof js === 'function' ? js : js.toString()};
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
        .Jbs9:first-child {
          margin-top: 0.25rem;
        }
      }

      @layer _.c.p {
        @media (min-width: 64rem) {
          .Jbpv9:first-child {
            margin-top: 0.5rem;
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" Jbs9 Jbpv9 -macro$M74Bxe"');
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
        ._kc9 {
          border-top-width: 2px;
        }


        .hc9 {
          border-bottom-width: 2px;
        }


        .mCPFGYc9 {
          border-inline-start-width: var(--m);
        }


        .lc9 {
          border-inline-end-width: 2px;
        }


        .SMBFGYc9 {
          padding-inline-start: var(--S);
        }


        .Rv9 {
          padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
        }


        .ZjUQgKd9 {
          width: calc(200px - var(--m) - var(--S));
        }


        .-m_-mc9 {
          --m: 2px;
        }


        .-S_-Sv9 {
          --S: calc(var(--F, var(--M)) * 3 / 8);
        }
      }

      "
    `);

    expect(js).toMatchInlineSnapshot(
      '" _kc9 hc9 mCPFGYc9 lc9 SMBFGYc9 Rv9 ZjUQgKd9 -m_-mc9 -S_-Sv9 -macro$wNXlmc"'
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

    expect(js()).toMatchInlineSnapshot('"  gw9 pg9 -macro$7ucvu4"');
    expect(overrides).toMatchInlineSnapshot(
      '" g8tmWqb9 pHJ3AUd9 -macro$sFRgme"'
    );
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  g8tmWqb9 -macro$sFRgme pg9 -macro$nt261r"'
    );
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B9 __Ya9 -macro$hzmozh"');
    expect(overrides).toMatchInlineSnapshot(
      '" -_7PloMd-D9 __Ya9 -macro$f5PRU"'
    );
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  -_7PloMd-D9 __Ya9 -macro$f5PRU -macro$1vw5vro"'
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

    expect(js()).toMatchInlineSnapshot('"  Tk9 Qk9 Sk9 Rk9 -macro$1jmmjz3"');
    expect(overrides).toMatchInlineSnapshot('" Tm9 Qm9 Sm9 Rm9 -macro$hWyGab"');
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  Tm9 Qm9 Sm9 Rm9 -macro$hWyGab -macro$vku4y4"'
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

    expect(js()).toMatchInlineSnapshot('"  gE9 -macro$2v7u7e"');
    expect(overrides).toMatchInlineSnapshot('" Nk9 -macro$hsZrrc"');
    expect(js({}, overrides)).toMatchInlineSnapshot(
      '"  Nk9 -macro$hsZrrc gE9 -macro$emy58b"'
    );
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
        .gH9 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF9 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .gE9 {
          background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }


        .pt9 {
          color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
        }


        .po9 {
          color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
        }


        .pm9 {
          color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  gH9 pt9 -macro$1cgd07e"');
    expect(js({isHovered: true})).toMatchInlineSnapshot(
      '"  gF9 po9 -macro$1b5rdyb"'
    );
    expect(js({isPressed: true})).toMatchInlineSnapshot(
      '"  gE9 pm9 -macro$1aigku8"'
    );
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
        .gH9 {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .gF9 {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .g_h9 {
          background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
        }


        .g39 {
          background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
        }
      }

      "
    `);
    expect(js({})).toMatchInlineSnapshot('"  gH9 -macro$2v7ua5"');
    expect(js({isHovered: true})).toMatchInlineSnapshot(
      '"  gF9 -macro$2v7u8b"'
    );
    expect(js({isSelected: true})).toMatchInlineSnapshot(
      '"  g_h9 -macro$nl39vw"'
    );
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  g39 -macro$2v7tqw"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot(
      '"  gY9 -macro$2v7upq"'
    );
    expect(js({variant: 'primary'})).toMatchInlineSnapshot(
      '"  gjQquMe9 -macro$1xbmgag"'
    );
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot(
      '"  gw9 -macro$2v7vh8"'
    );
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
          .plb9 {
            color: ButtonText;
          }
        }


        @media (forced-colors: active) {
          .ple9 {
            color: HighlightText;
          }
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  plb9 -macro$nlai7w"');
    expect(js({isSelected: true})).toMatchInlineSnapshot(
      '"  ple9 -macro$nlaian"'
    );
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th9 Qh9 Sh9 Rh9 -macro$tgBsxe"');
    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        .Th9 {
          padding-top: 24px;
        }


        .Qh9 {
          padding-bottom: 24px;
        }


        .Sh9 {
          padding-inline-start: 24px;
        }


        .Rh9 {
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
        .gpQzfVb9 {
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
        .-FUeYm-gE9 {
          --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }
      }

      "
    `);
  });
});
