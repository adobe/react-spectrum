import {Link} from '../src';
import type {Meta} from '@storybook/react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Link> = {
  component: Link,
  parameters: {
    layout: 'centered'
  },
  args: {
    href: 'https://www.imdb.com/title/tt6348138/',
    target: '_blank'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

export const Inline = (args: any) => (
  <p
    className={style({
      color: {
        default: 'body',
        staticColor: {white: 'white', black: 'black'}
      },
      fontSize: 'body',
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
