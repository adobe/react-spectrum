import {Avatar} from '../src';
import {style} from '../style/spectrum-theme' with { type: 'macro' };
import type {Meta} from '@storybook/react';

const meta: Meta<typeof Avatar> = {
  component: Avatar,
  argTypes: {},
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/Mngz9H7WZLbrCvGQf3GnsY/S2-%2F-Desktop?node-id=19100%3A180'
    }
  },
  tags: ['autodocs']
};

export default meta;

const SRC_URL_1 =
  'https://mir-s3-cdn-cf.behance.net/project_modules/disp/690bc6105945313.5f84bfc9de488.png';
const SRC_URL_2 = 'https://i.imgur.com/xIe7Wlb.png';


export const Example = (args: any) => (
  <>
    <Avatar alt="default adobe" src={SRC_URL_1} {...args} />
    <Avatar alt="design provided" src={SRC_URL_2} {...args} />
  </>
);

export const UserAppliedSize = (args: any) => (
  <>
    <Avatar alt="default adobe" src={SRC_URL_1} styles={style({size: 40})} {...args} />
    <Avatar alt="design provided" src={SRC_URL_2} styles={style({size: 40})} {...args} />
  </>
);
