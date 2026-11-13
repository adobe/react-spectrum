import {StepList, StepListItem} from '../src/StepList';
import type {Meta, StoryFn} from '@storybook/react';

const meta: Meta<typeof StepList> = {
  component: StepList,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  args: {
    selectedKey: 'payment'
  }
};

export default meta;
type Story = StoryFn<typeof StepList>;

export const Example: Story = args => (
  <StepList {...args} aria-label="Checkout">
    <StepListItem id="cart" href="#cart">
      Cart
    </StepListItem>
    <StepListItem id="shipping" href="#shipping">
      Shipping
    </StepListItem>
    <StepListItem id="payment" href="#payment">
      Payment
    </StepListItem>
    <StepListItem id="review" href="#review">
      Review
    </StepListItem>
  </StepList>
);
