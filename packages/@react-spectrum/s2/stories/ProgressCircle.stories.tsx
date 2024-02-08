import {ProgressCircle} from '../src/ProgressCircle';
import type {Meta, StoryObj} from '@storybook/react';
import {style} from '../style-macro/spectrum-theme.ts' with { type: 'macro' };

const meta: Meta<typeof ProgressCircle> = {
  component: ProgressCircle,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=13120%3A401&mode=dev'
    }
  },
  tags: ['autodocs']
};

export default meta;
type Story = StoryObj<typeof ProgressCircle>;

export const Example: Story = {
  render: (args) => {
    let progressCircle = (
      <ProgressCircle aria-label="Test Progress Circle" {...args} />
    );

    if (args.staticColor) {
      return (
        <div
          className={style({
            padding: 8,
            backgroundColor: {
              staticColor: {
                black: {default: 'yellow-400', dark: 'yellow-1100'},
                white: {default: 'blue-900', dark: 'blue-500'}
              }
            },
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          })({staticColor: args.staticColor})}>
          {progressCircle}
        </div>
      );
    }

    return progressCircle;
  },
  args: {
    staticColor: undefined,
    value: 80
  },
  argTypes: {
    staticColor: {
      control: 'select',
      options: [undefined, 'white', 'black']
    },
    value: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    }
  }
};
