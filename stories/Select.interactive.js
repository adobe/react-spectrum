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
import {array, boolean, text, withKnobs} from '@storybook/addon-knobs';
import React from 'react';
import Select from '../src/Select';
import {storiesOf} from '@storybook/react';

/**
 * The following stories are used for showcasing the different props of the component.
 * The user can tweak the different values for the props and observe how the component responds in real time.
 */
storiesOf('Select/interactive', module)
  .addDecorator(withKnobs)
  .add(
    'Select',
    () => renderSelect({defaultValue: 'option2'})
  )
  .add(
    'Controlled Select',
    () => renderSelect({value: text('value', 'option2')}),
    {info: 'In the controlled scenario where the value prop is added, use the parent of the Select component to maintain the value state.  Use the onChange event to capture the change in value and set the state.'}
  );

function renderSelect(props = {}) {
  const optionLabels = array('option labels', ['Mango', 'Fig', 'Banana']);
  const width = text('width', null);
  function getOptions() {
    return optionLabels.map((label, index) => ({label: label, value: `option${index}`}));
  }
  function getWidth() {
    return {width: width};
  }
  return (
    <Select
      onChange={action('change')}
      onOpen={action('open')}
      onClose={action('close')}
      options={getOptions()}
      style={getWidth()}
      flexible={boolean('flexible', false)}
      quiet={boolean('quiet', false)}
      multiple={boolean('multiple', false)}
      disabled={boolean('disabled', false)}
      closeOnSelect={boolean('closeOnSelect', true)}
      {...props} />
  );
}

