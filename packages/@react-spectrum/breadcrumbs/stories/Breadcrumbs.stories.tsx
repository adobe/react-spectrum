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
    () => renderPress({})
  );

function render(props = {}) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem>Folder 1</BreadcrumbItem>
      <BreadcrumbItem>Folder 2</BreadcrumbItem>
      <BreadcrumbItem>Folder 3</BreadcrumbItem>
    </Breadcrumbs>
  );
}

function renderPress(props = {}) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem onPress={action('press Folder 1')}>Folder 1</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 2')}>Folder 2</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 3')}>Folder 3</BreadcrumbItem>
    </Breadcrumbs>
  );
}
