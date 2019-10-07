import CalendarCheckColor from '../CalendarCheckColor';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Color', module)
  .add(
    'Color icon with sizes',
    () => renderIconSizes(CalendarCheckColor, {alt: 'Adobe Analytics Color'})
  );

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map(size => {
        return <Component size={size} style={{padding: '15px'}} {...props} />
      })}
    </div>
  )
}
