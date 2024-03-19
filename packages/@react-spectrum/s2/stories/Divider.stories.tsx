import {Divider} from '../src/Divider';
import {baseColor, style} from '../style-macro/spectrum-theme' with {type: 'macro'};

import type {Meta} from '@storybook/react';
import {StaticColorDecorator} from './utils';

const meta: Meta<typeof Divider> = {
  component: Divider,
  parameters: {
    layout: 'centered'
  },
  decorators: [StaticColorDecorator],
  tags: ['autodocs']
};

export default meta;

export const Example = {
  render: (args: any) => (
    <section
      className={style({
        display: 'flex',
        alignItems: 'center',
        rowGap: 12,
        columnGap: 12,
        flexDirection: {
          default: 'column',
          orientation: {
            'vertical': 'row'
          }
        },
        fontFamily: 'sans',
        color: {
          staticColor: {
            default: 'gray-900',
            black: baseColor('transparent-black-800'),
            white: baseColor('transparent-white-800')
          }
        }
      })({staticColor: args.staticColor, orientation: args.orientation})}>
      <p>Some text</p>
      <Divider {...args} />
      <p>Some text</p>
    </section>
  ),
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=13642%3A359'
    }
  }
};

