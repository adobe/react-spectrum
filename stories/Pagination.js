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
import Pagination from '../src/Pagination';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Pagination', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'button:cta',
    () => render({variant: 'button', mode: 'cta'})
  )
  .add(
    'button:secondary',
    () => render({variant: 'button', mode: 'secondary'})
  )
  .add(
    'explicit',
    () => render({variant: 'explicit', totalPages: 50})
  )
  .add(
    'controlled',
    () => render({variant: 'explicit', totalPages: 50, currentPage: 2})
  )
  .add(
    'labelling for accessibility',
    () => render({'aria-label': 'Items', variant: 'explicit', totalPages: 10, defaultPage: 3})
  );

function render(props = {}) {
  return (<Pagination {...props} onPrevious={action('onPrevious')} onNext={action('onNext')} onChange={props.variant === 'explicit' ? action('onChange') : null} />);
}
