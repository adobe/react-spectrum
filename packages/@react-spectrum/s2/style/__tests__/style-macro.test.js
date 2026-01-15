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
  .Jbs1:first-child {
    margin-top: 0.25rem;
  }
}

@layer _.c.p {
  @media (min-width: 64rem) {
    .Jbpv1:first-child {
      margin-top: 0.5rem;
    }
  }
}

"
`);
    expect(js).toMatchInlineSnapshot('" Jbs1 Jbpv1"');
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
  ._kc1 {
    border-top-width: 2px;
  }


  .hc1 {
    border-bottom-width: 2px;
  }


  .mCPFGYc1 {
    border-inline-start-width: var(--m);
  }


  .lc1 {
    border-inline-end-width: 2px;
  }


  .SMBFGYc1 {
    padding-inline-start: var(--S);
  }


  .Rv1 {
    padding-inline-end: calc(var(--F, var(--M)) * 3 / 8);
  }


  .ZjUQgKd1 {
    width: calc(200px - var(--m) - var(--S));
  }


  .-m_-mc1 {
    --m: 2px;
  }


  .-S_-Sv1 {
    --S: calc(var(--F, var(--M)) * 3 / 8);
  }
}

"
`);

    expect(js).toMatchInlineSnapshot('" _kc1 hc1 mCPFGYc1 lc1 SMBFGYc1 Rv1 ZjUQgKd1 -m_-mc1 -S_-Sv1"');
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

    expect(js()).toMatchInlineSnapshot('"  gw1 pg1"');
    expect(overrides).toMatchInlineSnapshot('" g8tmWqb1 pHJ3AUd1"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  g8tmWqb1 pg1"');
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

    expect(js()).toMatchInlineSnapshot('"  -_7PloMd-B1 __Ya1"');
    expect(overrides).toMatchInlineSnapshot('" -_7PloMd-D1 __Ya1"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_7PloMd-D1 __Ya1"');
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

    expect(js()).toMatchInlineSnapshot('"  Tk1 Qk1 Sk1 Rk1"');
    expect(overrides).toMatchInlineSnapshot('" Tm1 Qm1 Sm1 Rm1"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Tm1 Qm1 Sm1 Rm1"');
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

    expect(js()).toMatchInlineSnapshot('"  -_6BNtrc-woabcc1 vx1"');
    expect(overrides).toMatchInlineSnapshot('" -_6BNtrc-a1 vx1"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  -_6BNtrc-a1 vx1"');
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

    expect(js()).toMatchInlineSnapshot('"  gE1"');
    expect(overrides).toMatchInlineSnapshot('" Nk1"');
    expect(js({}, overrides)).toMatchInlineSnapshot('"  Nk1 gE1"');
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
  .gH1 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF1 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .gE1 {
    background-color: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }


  .pt1 {
    color: light-dark(rgb(41, 41, 41), rgb(219, 219, 219));
  }


  .po1 {
    color: light-dark(rgb(19, 19, 19), rgb(242, 242, 242));
  }


  .pm1 {
    color: light-dark(rgb(0, 0, 0), rgb(255, 255, 255));
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  gH1 pt1"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF1 po1"');
    expect(js({isPressed: true})).toMatchInlineSnapshot('"  gE1 pm1"');
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
  .gH1 {
    background-color: light-dark(rgb(233, 233, 233), rgb(44, 44, 44));
  }


  .gF1 {
    background-color: light-dark(rgb(225, 225, 225), rgb(50, 50, 50));
  }


  .g_h1 {
    background-color: light-dark(rgb(75, 117, 255), rgb(64, 105, 253));
  }


  .g31 {
    background-color: light-dark(rgb(59, 99, 251), rgb(86, 129, 255));
  }
}

"
`);
    expect(js({})).toMatchInlineSnapshot('"  gH1"');
    expect(js({isHovered: true})).toMatchInlineSnapshot('"  gF1"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  g_h1"');
    expect(js({isSelected: true, isHovered: true})).toMatchInlineSnapshot('"  g31"');
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

    expect(js({variant: 'accent'})).toMatchInlineSnapshot('"  gY1"');
    expect(js({variant: 'primary'})).toMatchInlineSnapshot('"  gjQquMe1"');
    expect(js({variant: 'secondary'})).toMatchInlineSnapshot('"  gw1"');
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
    .plb1 {
      color: ButtonText;
    }
  }


  @media (forced-colors: active) {
    .ple1 {
      color: HighlightText;
    }
  }
}

"
`);

    expect(js({})).toMatchInlineSnapshot('"  plb1"');
    expect(js({isSelected: true})).toMatchInlineSnapshot('"  ple1"');
  });

  it('should expand shorthand properties to longhands', () => {
    let {js, css} = testStyle({
      padding: 24
    });

    expect(js).toMatchInlineSnapshot('" Th1 Qh1 Sh1 Rh1"');
    expect(css).toMatchInlineSnapshot(`
"@layer _.a;

@layer _.a {
  .Th1 {
    padding-top: 24px;
  }


  .Qh1 {
    padding-bottom: 24px;
  }


  .Sh1 {
    padding-inline-start: 24px;
  }


  .Rh1 {
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
  .gpQzfVb1 {
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
  .-FUeYm-gE1 {
    --foo: light-dark(rgb(218, 218, 218), rgb(57, 57, 57));
  }
}

"
`);
  });
});
