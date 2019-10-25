import {action} from '@storybook/addon-actions';
import {BreadcrumbItem, Breadcrumbs} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Breadcrumbs', module)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'size: S',
    () => render({size: 'S'})
  )
  .add(
    'size: L',
    () => render({size: 'L'})
  )
  .add(
    'onPress',
    () => render(
      {},
      [
        {children: 'Folder 1', onPress: action('press Folder 1')},
        {children: 'Folder 2', onPress: action('press Folder 2')},
        {children: 'Folder 3', onPress: action('press Folder 3')}
      ]
    )
  );

function render(props = {}, children = []) {
  let breadcrumbItems = children || [{children: 'Folder 1'}, {children: 'Folder 2'}, {children: 'Folder 3'}];
  return (
    <Breadcrumbs {...props}>
      {breadcrumbItems.map(item => <BreadcrumbItem {...item} />)}
    </Breadcrumbs>
  );
}
