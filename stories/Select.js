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
import Illustrator from '../src/Icon/Illustrator';
import Lightroom from '../src/Icon/Lightroom';
import Photoshop from '../src/Icon/Photoshop';
import React from 'react';
import Select from '../src/Select';
import {storiesOf} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';

const defaultList = {
  options: [
    {label: 'Chocolate', value: 'chocolate'},
    {label: 'Vanilla', value: 'vanilla'},
    {label: 'Strawberry', value: 'strawberry'},
    {label: 'Caramel', value: 'caramel'},
    {label: 'Cookies and Cream', value: 'cookiescream'},
    {label: 'Peppermint', value: 'peppermint'}
  ]
};

const longList = {
  options: [
    ...defaultList.options,
    {label: 'Crispity, crunchity, peanut-buttery munchity', value: 'butterfinger'}
  ]
};

const defaultProps = {
  defaultValue: 'peppermint'
};

const tinyList = {
  options: [
    {label: 'AM', value: 'am'},
    {label: 'PM', value: 'PM'}
  ]
};

const tinyProps = {
  defaultValue: 'am'
};

const selectedValues = [
  'chocolate',
  'vanilla'
];

storiesOf('Select', module)
  .addDecorator(withKnobs)
  .add(
    'Default',
    () => render({...defaultProps})
  )
  .add(
    'Various widths',
    () => renderMany()
  )
  .add(
    'placeholder: other placeholder',
    () => renderNoDefaultProps({placeholder: 'other placeholder'})
  )
  .add(
    'flexible',
    () => render({flexible: true})
  )
  .add(
    'alignRight',
    () => render({alignRight: true, defaultValue: 'vanilla'})
  )
  .add(
    'quiet',
    () => render({quiet: true})
  )
  .add(
    'quiet, flexible',
    () => render({quiet: true, flexible: true})
  )
  .add(
    'quiet, alignRight',
    () => render({quiet: true, alignRight: true, defaultValue: 'vanilla'})
  )
  .add(
    'quiet, value: longVal, flexible',
    () => render({quiet: true, flexible: true, ...longList, defaultValue: 'butterfinger'})
  )
  .add(
    'quiet, multiple, flexible',
    () => renderNoDefaultProps({quiet: true, flexible: true, multiple: true, value: selectedValues})
  )
  .add(
    'quiet, disabled, flexible',
    () => render({quiet: true, flexible: true, disabled: true})
  )
  .add(
    'multiple: true',
    () => render({multiple: true, flexible: true, defaultValue: selectedValues})
  )
  .add(
    'required: true',
    () => render({required: true})
  )
  .add(
    'disabled: true',
    () => render({disabled: true})
  )
  .add(
    'invalid: true',
    () => render({invalid: true})
  )
  .add(
    'multiple disabled: true',
    () => renderNoDefaultProps({disabled: true, multiple: true, value: selectedValues})
  )
  .add(
    'value: longVal',
    () => renderNoDefaultProps({...longList, value: 'butterfinger'})
  )
  .add(
    'Stay open on select',
    () => render({closeOnSelect: false})
  ).add(
    'with icons',
    () =>
      render({
        options: [
          {label: 'Photoshop', value: 'PHSP', icon: <Photoshop />},
          {label: 'Lightroom', value: 'LTRM', icon: <Lightroom />},
          {label: 'Illustrator', value: 'ILST', icon: <Illustrator />},
          {label: 'Other', value: 'OTHER'}
        ]
      })
  ).add(
    'with menuClassName',
    () => render({menuClassName: 'custom-class-name'})
  ).add(
    'no flip',
    () => render({flip: false})
  )
  .add(
    'renderItem',
    () => render({
      renderItem: item => <em>{item.label}</em>
    }),
    {info: 'This example uses renderItem method to italicize text'}
  );

function render(props = {}) {
  return (
    <Select
      onChange={action('change')}
      onOpen={action('open')}
      onClose={action('close')}
      {...defaultList}
      {...defaultProps}
      {...props} />
  );
}

function renderMany(props = {}) {
  return (
    <div>
      <p>A. Default width:</p>
      <Select
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...longList}
        {...defaultProps} />
      <p>B. Fixed width:</p>
      <Select
        style={{width: '72px'}}
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...tinyList}
        {...tinyProps} />
      <p>C. 100% of container</p>
      <Select
        style={{width: '100%'}}
        onChange={action('change')}
        onOpen={action('open')}
        onClose={action('close')}
        {...longList}
        {...defaultProps} />
    </div>
  );
}

function renderNoDefaultProps(props = {}) {
  return (
    <Select
      onChange={action('change')}
      onOpen={action('open')}
      onClose={action('close')}
      {...defaultList}
      {...props} />
  );
}
