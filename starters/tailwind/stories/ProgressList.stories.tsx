import React from 'react';
import {ProgressList, ProgressListItem} from '../src/ProgressList';
import {type Meta} from '@storybook/react';

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

export const Example = (args: any) => (
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
