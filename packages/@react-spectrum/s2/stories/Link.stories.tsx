import {Link} from '../src/Link';
import type {Meta} from '@storybook/react';
import {style} from '../style-macro/spectrum-theme' with {type: 'macro'};

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  args: {
    href: 'https://www.imdb.com/title/tt6348138/',
    target: '_blank'
  },
  tags: ['autodocs'],
  decorators: [
    (story, ctx) => {
      if (ctx.args.staticColor) {
        return (
          <div
            className={style({
              padding: 8,
              backgroundColor: {
                staticColor: {
                  black: 'yellow',
                  white: 'blue'
                }
              },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            })({staticColor: ctx.args.staticColor})}>
            {story()}
          </div>
        );
      }
      return story();
    }
  ]
};

export default meta;

export const Inline = (args: any) => (
  <p 
    className={style({
      color: {
        default: 'body',
        staticColor: {white: 'white', black: 'black'}
      },
      fontSize: 'lg',
      fontFamily: 'sans'
    })({staticColor: args.staticColor})}>
    Checkbox groups should use <Link {...args}>help text</Link> for error messaging and descriptions. Descriptions are valuable for giving context.
  </p>
);

export const Standalone = (args: any) => (
  <Link {...args} isStandalone>
    The missing link
  </Link>
);
