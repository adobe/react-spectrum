/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

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
  )
  .add(
    'renderLink',
    () => (
      <Breadcrumbs
        items={[{label: 'Folder 1', href: '#Folder-1'}, {label: 'Folder 2'}, {label: 'Folder 3'}]}
        renderLink={(props) => <a {...props} data-custom={props.label}>Custom: {props.label}</a>} />
    )
  );
