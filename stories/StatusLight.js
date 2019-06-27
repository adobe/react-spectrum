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

import React from 'react';
import StatusLight from '../src/StatusLight';
import {storiesOf} from '@storybook/react';

const SEMANTIC_COLORS_MESSAGE = `When status lights have a semantic meaning, they should use _semantic colors_.

`;

const LABEL_COLORS_MESSAGE = `When status lights are used to color code categories and labels commonly found in data visualization, they use _label colors_.
The ideal usage for these is when there are 8 or fewer categories or labels being color coded.
Use them in the following order to ensure the greatest possible color differences for multiple forms of color blindness:

* Indigo
* Celery
* Magenta
* Yellow
* Fuchsia
* Seafoam
* Chartreuse
* Purple`;

storiesOf('StatusLight', module)
  .add(
    'Default',
    () => render()
  ).add(
    'variant: neutral',
    () => render({variant: 'neutral', children: 'Paused'}),
    {info: SEMANTIC_COLORS_MESSAGE + 'Use **"neutral"** semantic color variant for the following statuses: Archived, Deleted, Paused, Draft, Not Started, Ended'}
  ).add(
    'variant: positive',
    () => render({variant: 'positive', children: 'Approved'}),
    {info: SEMANTIC_COLORS_MESSAGE + 'Use **"positive"** semantic color variant for the following statuses: Approved, Complete, Success, New, Purchased, Licensed'}
  ).add(
    'variant: notice',
    () => render({variant: 'notice', children: 'Needs Approval'}),
    {info: SEMANTIC_COLORS_MESSAGE + 'Use **"notice"** semantic color variant for the following statuses: Needs Approval, Pending, Scheduled, Syncing, Indexing, Processing'}
  ).add(
    'variant: negative',
    () => render({variant: 'negative', children: 'Rejected'}),
    {info: SEMANTIC_COLORS_MESSAGE + 'Use **"negative"** semantic color variant for the following statuses: Error, Alert, Rejected, Failed'}
  ).add(
    'variant: info',
    () => render({variant: 'info', children: 'Active'}),
    {info: SEMANTIC_COLORS_MESSAGE + 'Use **"info"** semantic color variant for the following statuses: Active, In Use, Live, Published'}
  ).add(
    'variant: active',
    () => render({variant: 'info', children: 'Active'}),
    {info: '**Note:** the **"active"** variant is deprecated; use **"info"** instead.'}
  ).add(
    'variant: archived',
    () => render({variant: 'archived', children: 'Archived'}),
    {info: '**Note:** the **"archived"** variant is deprecated; use **"neutral"** instead.'}
  ).add(
    'variant: indigo',
    () => render({variant: 'indigo'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: celery',
    () => render({variant: 'celery'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: magenta',
    () => render({variant: 'magenta'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: yellow',
    () => render({variant: 'yellow'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: fuchsia',
    () => render({variant: 'fuchsia'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: seafoam',
    () => render({variant: 'seafoam'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: chartreuse',
    () => render({variant: 'chartreuse'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'variant: purple',
    () => render({variant: 'purple'}),
    {info: LABEL_COLORS_MESSAGE}
  ).add(
    'disabled: true',
    () => render({disabled: true})
  );

function render(props = {}) {
  const {
    children = props.variant || 'Status light of love',
    ...otherProps
  } = props;
  return (<StatusLight {...otherProps}>{children}</StatusLight>);
}
