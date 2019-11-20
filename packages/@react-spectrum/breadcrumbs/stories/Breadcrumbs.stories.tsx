import {action} from '@storybook/addon-actions';
import {BreadcrumbItem, Breadcrumbs} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

let styles = {
  width: '100%'
};
const CenterDecorator = storyFn => <div style={styles}><div>{storyFn()}</div></div>;

storiesOf('Breadcrumbs', module)
  .addDecorator(CenterDecorator)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'isHeading: true',
    () => render({isHeading: true})
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
  )
  .add(
    'maxVisibleItems: 4',
    () => renderPress({})
  )
  .add(
    'maxVisibleItems: 4, showRoot: true',
    () => renderPress({showRoot: true})
  )
  .add(
    'maxVisibleItems: auto',
    () => renderPress({maxVisibleItems: 'auto'})
  )
  .add(
    'maxVisibleItems: auto, size: L',
    () => renderPress({maxVisibleItems: 'auto', size: 'L'})
  )
  .add(
    'isDisabled: true',
    () => render({isDisabled: true})
  )
  .add(
    'isDisabled: true, size: L',
    () => render({isDisabled: true, size: 'L'})
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
      <BreadcrumbItem onPress={action('press Folder 4')}>Folder 4</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 5')}>Folder 5</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 6')}>Folder 6</BreadcrumbItem>
      <BreadcrumbItem onPress={action('press Folder 7')}>Folder 7</BreadcrumbItem>
    </Breadcrumbs>
  );
}
