import { Button } from '../src/Button';

export default {
  title: 'Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'destructive']
    }
  },
  args: {
    isDisabled: false,
    children: 'Button'
  }
};

export const Primary = {
  args: {
    variant: 'primary'
  },
};

export const Secondary = {
  args: {
    variant: 'secondary'
  },
};

export const Destructive = {
  args: {
    variant: 'destructive'
  },
};
