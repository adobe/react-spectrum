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
      ".\\.:not(#a#b) { all: revert-layer }

      @layer _.a, _.b, _.c, UNSAFE_overrides;

      @layer _.b {
        .y-13alit4b {
          &:first-child {
            margin-top: 0.25rem;
          }
        }
      }

      @layer _.c.e {
        @media (min-width: 1024px) {
          .y-13alit4ec {
            &:first-child {
              margin-top: 0.5rem;
            }
          }
        }
      }

      "
    `);
    expect(js).toMatchInlineSnapshot('" . y-13alit4b y-13alit4ec"');
  });
});
