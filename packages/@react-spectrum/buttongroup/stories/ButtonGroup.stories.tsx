/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '@react-spectrum/button';
import {ButtonGroup} from '../';
import React, {useState} from 'react';
import {Text} from '@react-spectrum/text';

export default {
  title: 'ButtonGroup'
};

export const Default = () => render({});

Default.story = {
  name: 'default'
};

export const IsDisabled = () => render({isDisabled: true});

IsDisabled.story = {
  name: 'isDisabled'
};

export const OrientationVertical = () => render({orientation: 'vertical'});

OrientationVertical.story = {
  name: 'orientation: vertical'
};

export const OrientationVerticalAlignEnd = () =>
  render({orientation: 'vertical', align: 'end'});

OrientationVerticalAlignEnd.story = {
  name: 'orientation: vertical, align: end'
};

export const IsDisabledOrientationVertical = () =>
  render({isDisabled: true, orientation: 'vertical'});

IsDisabledOrientationVertical.story = {
  name: 'isDisabled, orientation: vertical'
};

export const AlignEnd = () => render({align: 'end'});

AlignEnd.story = {
  name: 'align: end'
};

export const AlignCenter = () => render({align: 'center'});

AlignCenter.story = {
  name: 'align: center'
};

export const AlignCenterOrientationVertical = () =>
  render({align: 'center', orientation: 'vertical'});

AlignCenterOrientationVertical.story = {
  name: 'align: center, orientation: vertical'
};

export const ResizeableContainer = () => (
  <div
    style={{
      minWidth: '100px',
      padding: '10px',
      resize: 'horizontal',
      overflow: 'auto',
      backgroundColor: 'var(--spectrum-global-color-gray-50)'
    }}>
    {render({})}
  </div>
);

ResizeableContainer.story = {
  name: 'resizeable container'
};

export const ConstantContainerChangingSiblings = () => <ExpandingSibling />;

ConstantContainerChangingSiblings.story = {
  name: 'constant container, changing siblings'
};

function render(props) {
  return <Component {...props} />;
}

let ExpandingSibling = (props = {}) => {
  let [isExpanded, setIsExpanded] = useState(false);
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        width: '1000px',
        overflow: 'hidden',
        padding: '10px',
        backgroundColor: 'var(--spectrum-global-color-gray-50)'
      }}>
      <div style={{paddingRight: isExpanded ? '200px' : '10px'}}>
        <Button
          variant="secondary"
          onPress={() => setIsExpanded((prev) => !prev)}>
          {isExpanded ? 'Shrink' : 'Expand'}
        </Button>
      </div>
      {render(props)}
    </div>
  );
};

let Component = (props) => {
  let [show, setShow] = useState(false);
  return (
    <ButtonGroup maxWidth="100vw" {...props}>
      <Button variant="primary" onPress={action('press')}>
        Button 1
      </Button>
      <Button variant="negative" onPress={action('press')}>
        Button long long long name
      </Button>
      <Button variant="primary" isQuiet onPress={action('press')}>
        Quiet button
      </Button>
      <Button variant="primary" isDisabled onPress={action('press')}>
        Disabled button
      </Button>
      <Button variant="secondary" onPress={() => setShow((show) => !show)}>
        <Bell />
        <Text>Click me to make Button larger</Text>
        {show && <Text>to test overflow resizing :D</Text>}
      </Button>
    </ButtonGroup>
  );
};
