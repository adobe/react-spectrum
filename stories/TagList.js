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
import {Tag, TagList} from '../src/TagList';

storiesOf('TagList', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'Read Only',
    () => render({readOnly: true})
  )
  .add(
    'Disabled',
    () => render({disabled: true})
  )
  .add(
    'Using Values',
    () => render({values: [
      'Mango', 'Turtle', 'Noodles', 'Pluto'
    ]})
  );

function render(props = {}) {
  return (
    <div>
      <TagList
        onClose={action('close')}
        {...props}>
        <Tag onClick={action('click tag1')}>Tag 1</Tag>
        <Tag>Tag 2</Tag>
        <Tag>Tag 3</Tag>
        <Tag>Tag 4</Tag>
        <Tag>Tag 5</Tag>
        <Tag>Tag 6</Tag>
        <Tag>Tag 7</Tag>
        <Tag>Tag 8</Tag>
        <Tag>Tag 9</Tag>
        <Tag>Tag 10</Tag>
        <Tag>This is a longer tab</Tag>
        <Tag>This is another longer tab</Tag>
      </TagList>
    </div>
  );
}
