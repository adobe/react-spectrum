import {action} from '@storybook/addon-actions';
import {Breadcrumbs, BreadcrumbItem} from '../';
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
  );;

function render(props = {}) {
  return (
    <Breadcrumbs {...props}>
      <BreadcrumbItem>Folder 1</BreadcrumbItem>
      <BreadcrumbItem>Folder 2</BreadcrumbItem>
      <BreadcrumbItem>Folder 3</BreadcrumbItem>
    </Breadcrumbs>
  );
}
