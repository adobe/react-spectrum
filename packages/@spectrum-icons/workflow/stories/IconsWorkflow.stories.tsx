import Icon3DMaterials from '../3DMaterials';
import Add from '../Add';
import Bell from '../Bell';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Icons/Workflow', module)
  .add(
    'icon: Add with sizes',
    () => renderIconSizes(Add, {alt: 'Add'})
  )
  .add(
    'icon: Bell with sizes',
    () => renderIconSizes(Bell, {alt: 'Bell'})
  )
  .add(
    'icon: _3DMaterials with sizes',

    () => renderIconSizes(Icon3DMaterials, {alt: '3D Materials'})
  );

function renderIconSizes(Component, props) {
  let sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  return (
    <div>
      {sizes.map(size => {
        return <Component UNSAFE_style={{padding: '15px'}} size={size} {...props} />
      })}
    </div>
  )
}
