import {action, storiesOf} from '@kadira/storybook';
import Breadcrumbs from '../src/Breadcrumbs';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Breadcrumbs', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <Breadcrumbs
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'Disabled',
    () => (
      <Breadcrumbs
        disabled
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'size: M',
    () => (
      <Breadcrumbs
        size="M"
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'size: L',
    () => (
      <Breadcrumbs
        size="L"
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'icon: folder',
    () => (
      <Breadcrumbs
        icon="folder"
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  )
  .addWithInfo(
    'icon: folder, size: L',
    () => (
      <Breadcrumbs
        icon="folder"
        size="L"
        items={[{label: 'Folder 1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    ),
    {inline: true}
  );
