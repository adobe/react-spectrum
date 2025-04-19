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
        .jnb:first-child {
          margin-top: 0.25rem;
        }
      }

      @layer _.c.YxLy {
        @media (min-width: 1024px) {
          .jnYxLyf:first-child {
            margin-top: 0.5rem;
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" jnb jnYxLyf"');
  });

  it('should support self references', () => {
    let {css, js} = testStyle({
      borderWidth: 2,
      paddingX: 'edge-to-text',
      width: '[calc(200px - self(borderStartWidth) - self(paddingStart))]'
    });

    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        ._nb {
          border-top-width: 2px;
        }


        ._ma {
          border-bottom-width: 2px;
        }


        ._twdjPYd {
          border-inline-start-width: var(--_t);
        }


        ._sa {
          border-inline-end-width: 2px;
        }


        .oGQFGYc {
          padding-inline-start: var(--o);
        }


        .nb {
          padding-inline-end: calc(var(--e, var(--s)) * 3 / 8);
        }


        .fNANddc {
          width: calc(200px - var(--_t) - var(--o));
        }


        .-_t_-_ta {
          --_t: 2px;
        }


        .-o_-ob {
          --o: calc(var(--e, var(--s)) * 3 / 8);
        }
      }

      "
    `);

    expect(js).toMatchInlineSnapshot(
      '" _nb _ma _twdjPYd _sa oGQFGYc nb fNANddc -_t_-_ta -o_-ob"'
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

    expect(js()).toMatchInlineSnapshot('"  cE dj"');
    expect(overrides).toMatchInlineSnapshot('" c8tmWqb dHJ3AUd"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  c8tmWqb dj"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-zTRurc _Ia"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-Kr5lvc _Ia"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-Kr5lvc _Ia"');
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

    expect(js()).toMatchInlineSnapshot('"  rg vd of ng"');
    expect(overrides).toMatchInlineSnapshot('" rw vw oy ny"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  rw vw oy ny"');
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

    expect(js()).toMatchInlineSnapshot('"  cz"');
    expect(overrides).toMatchInlineSnapshot('" ue"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  ue cz"');
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
        .ca {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .ce {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .cz {
          background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }


        .da {
          color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
        }


        .db {
          color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
        }


        .dv {
          color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  ca da"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  ce db"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  cz dv"');
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
        .ca {
          background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
        }


        .ce {
          background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
        }


        .c_k {
          background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
        }


        .cK {
          background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
        }
      }

      "
    `);
    expect(js({})).toMatchInlineSnapshot('"  ca"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  ce"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  c_k"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot(
      '"  cK"'
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  cw"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  cjQquMe"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  cE"');
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

      @layer _.b.b {
        @media (forced-colors: active) {
          .dbf {
            color: ButtonText;
          }
        }


        @media (forced-colors: active) {
          .dbm {
            color: HighlightText;
          }
        }
      }

      "
    `);

    expect(js({})).toMatchInlineSnapshot('"  dbf"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  dbm"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" rc vc od nd"');
    expect(css).toMatchInlineSnapshot(`
      "@layer _.a;

      @layer _.a {
        .rc {
          padding-top: 1.5rem;
        }


        .vc {
          padding-bottom: 1.5rem;
        }


        .od {
          padding-inline-start: 1.5rem;
        }


        .nd {
          padding-inline-end: 1.5rem;
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
        .cpQzfVb {
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
        .-FUeYm-cz {
          --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
        }
      }

      "
    `);
  });
});
