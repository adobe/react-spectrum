import AdobeAnalyticsColor from '../AdobeAnalyticsColor';
import {Icon} from '@react-spectrum/icon';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Color', module)
  .add(
    'Color icon with sizes',
    () => renderIconSizes(AdobeAnalyticsColor, {alt: 'Adobe Analytics Color'})
  );

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map(size => {
        return <Component size={size} {...props} />
      })}
    </div>
  )
}
