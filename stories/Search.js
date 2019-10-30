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
import Autocomplete from '../src/Autocomplete';
import React from 'react';
import Refresh from '../src/Icon/Refresh';
import Search from '../src/Search';
import {storiesOf} from '@storybook/react';

const info = 'A containing element with  `role="search"` has been added to define a **search** landmark region.';

storiesOf('Search', module)
  .add(
    'Default',
    () => <div role="search">{render()}</div>,
    {info}
  )
  .add(
    'defaultValue (uncontrolled)',
    () => <div role="search">{render({defaultValue: 'React'})}</div>,
    {info}
  )
  .add(
    'value (controlled)',
    () => <div role="search">{render({value: 'React'})}</div>,
    {info}
  )
  .add(
    'disabled: true',
    () => <div role="search">{render({value: 'React', disabled: true})}</div>,
    {info}
  )
  .add(
    'icon: refresh',
    () => <div role="search">{render({value: 'React', icon: <Refresh />})}</div>,
    {info}

  )
  .add(
    'quiet',
    () => <div role="search">{render({quiet: true})}</div>,
    {info}
  )
  .add(
    'quiet disabled',
    () => <div role="search">{render({quiet: true, disabled: true})}</div>,
    {info}
  )
  .add(
    'quiet icon: refresh',
    () => <div role="search">{render({quiet: true, icon: <Refresh />})}</div>,
    {info}
  )
  .add(
    'using Autocomplete',
    () => <div role="search">{renderAutocomplete()}</div>,
    {info: `With Autocomplete, Search will be exposed to assistive technology as a combobox. ${info}`}
  )
  .add(
    'using combobox role',
    () => <div role="search">{render({type: 'text', role: 'combobox', 'aria-expanded': 'false', 'aria-haspopup': 'listbox', 'aria-autocomplete': 'list'})}</div>,
    {info: `This example demonstrates how to overide Search props for a custom implementation of the WAI-ARIA 1.0 ComboBox design pattern. ${info}`}
  );

function render(props = {}) {
  return (
    <Search
      aria-label="Search"
      placeholder="Enter text"
      {...props}
      onChange={action('change')}
      onSubmit={action('submit')} />
  );
}

function renderAutocomplete(props = {}) {
  const OPTIONS = [
    'Chocolate',
    'Vanilla',
    'Strawberry',
    'Caramel',
    'Cookies and Cream',
    'Coconut',
    'Peppermint'
  ];

  function getCompletions(text) {
    return OPTIONS.filter(o => o.toLowerCase().startsWith(text.toLowerCase()));
  }
  return <Autocomplete getCompletions={getCompletions}>{render({'aria-label': 'Ice Cream Flavors', autocompleteInput: true, type: 'text', ...props})}</Autocomplete>;
}

