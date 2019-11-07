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
import {boolean, optionsKnob as options, text, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
import Refresh from '../src/Icon/Refresh';
import Search from '../src/Search';
import {storiesOf} from '@storybook/react';

/**
 * The following stories are used for showcasing the different props of the component.
 * The user can tweak the different values for the props and observe how the component responds in real time.
 */
storiesOf('Search/interactive', module)
  .addDecorator(withKnobs)
  .add(
    'Search',
    () => <div role="search">{renderSearch()}</div>
  )
  .add(
    'Controlled Search',
    () => <div role="search">{renderSearch({value: text('value', 'search text')})}</div>
  );
  
function renderSearch(props = {}) {
  const iconVariant = {
    default: 'default',
    refresh: 'refresh'
  };
  let iconOptionVariant = options('icon', iconVariant, 'default', {display: 'inline-radio'});
  function getIcon() {
    switch (iconOptionVariant) {
      case 'refresh':
        return <Refresh />;
      case 'default':
      default:
        return undefined;
    }
  }
  return (
    <Search
      aria-label="Search"
      placeholder={text('placeholder', 'Enter text')}
      disabled={boolean('disabled', false)}
      quiet={boolean('quiet', false)}
      onChange={action('change')}
      onSubmit={action('submit')}
      icon={getIcon()}
      {...props} />
  );
}
