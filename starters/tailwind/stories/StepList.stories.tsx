import React from 'react';
import {StepList, StepListItem} from '../src/StepList';
import {type Meta} from '@storybook/react';

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

export const Example = (args: any) => (
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
