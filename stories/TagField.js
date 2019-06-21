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
import React from 'react';
import {storiesOf} from '@storybook/react';
import TagField from '../src/TagField';

const OPTIONS = [
  'Chocolate',
  'Vanilla',
  'Strawberry',
  'Caramel',
  'Cookies and Cream',
  'Coconut',
  'Peppermint',
  'Some crazy long value that should be cut off'
];

const OBJECT_OPTIONS = [
  {label: 'Chocolate', id: '1'},
  {label: 'Vanilla', id: '2'},
  {label: 'Strawberry', id: '3'}

];

const EXISTING_VALUES = [
  'Chocolate',
  'Vanilla',
  'Peppermint'
];

function getCompletions(text) {
  return OPTIONS.filter(o => ({label: o.name, id: o.id}));
}
function getCompletionsObject(text) {
  return OBJECT_OPTIONS.filter(o => o.label.toLowerCase().startsWith(text.toLowerCase()));
}

storiesOf('TagField', module)
  .add(
    'Default',
    () => (
      <TagField placeholder="Tags" />
    )
  )
  .add(
    'Autocomplete',
    () => (
      <TagField placeholder="Tags" getCompletions={getCompletions} />
    )
  )
  .add(
    'Display existing values',
    () => (
      <TagField placeholder="Tags" value={EXISTING_VALUES} />
    )
  )
  .add(
    'Disallow new tags',
    () => (
      <TagField allowCreate={false} placeholder="Tags" getCompletions={getCompletionsObject} />
    )
  )
  .add(
    'Allow duplicate tags',
    () => (
      <TagField allowDuplicates placeholder="Tags" getCompletions={getCompletionsObject} />
    )
  )
  .add(
    'Handle additions and removals',
    () => (
      <TagField placeholder="Tags" onChange={action('change')} />
    )
  )
  .add(
    'disabled',
    () => (
      <TagField placeholder="Tags" disabled />
    )
  )
  .add(
    'invalid',
    () => (
      <TagField placeholder="Tags" invalid />
    )
  )
  .add(
    'quiet',
    () => (
      <TagField placeholder="Tags" quiet />
    )
  )
  .add(
    'quiet disabled',
    () => (
      <TagField placeholder="Tags" quiet disabled />
    )
  )
  .add(
    'quiet invalid',
    () => (
      <TagField placeholder="Tags" quiet invalid />
    )
  )
  .add(
    'controlled',
    () => (
      <TagField placeholder="Tags" value={['one', 'two']} onChange={action('change')} />
    )
  );
