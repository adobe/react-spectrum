import {ProgressList, ProgressListItem} from '../src/ProgressList';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof ProgressList> = {
  component: ProgressList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    selectedKey: 'payment'
  }
};

export default meta;
type Story = StoryFn<typeof ProgressList>;

export const Example: Story = args => (
  <ProgressList {...args} aria-label="Checkout">
    <ProgressListItem id="cart" href="#cart">
      Cart
    </ProgressListItem>
    <ProgressListItem id="shipping" href="#shipping">
      Shipping
    </ProgressListItem>
    <ProgressListItem id="payment" href="#payment">
      Payment
    </ProgressListItem>
    <ProgressListItem id="review" href="#review">
      Review
    </ProgressListItem>
  </ProgressList>
);
