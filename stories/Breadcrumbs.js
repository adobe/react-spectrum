import {action} from '@storybook/addon-actions';
import Breadcrumbs from '../src/Breadcrumbs';
import FolderIcon from '../src/Icon/Folder';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Breadcrumbs', module)
  .add(
    'Default',
    () => (
      <Breadcrumbs
        items={[{label: 'Folder 1', href: '#Folder-1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    )
  )
  .add(
    'icon: folder',
    () => (
      <Breadcrumbs
        icon={<FolderIcon />}
        items={[{label: 'Folder 1', href: '#Folder-1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    )
  )
  .add(
    'variant: "title"',
    () => (
      <Breadcrumbs
        variant="title"
        ariaLevel={3}
        items={[{label: 'Folder 1', href: '#Folder-1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        onBreadcrumbClick={action('breadcrumbClick')} />
    )
  );
