/*
 * Copyright 2022 Adobe. All rights reserved.
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
import {classNames} from '@react-spectrum/utils';
import React, {useState} from 'react';
import styles from '../example/index.css';
import {ToggleButton} from 'react-aria-components';

export default {
  title: 'React Aria Components/ToggleButton'
};

export const ToggleButtonExample = () => {

  const [textColor, setTextColor] = useState('black');

  return (
    <ToggleButton
      className={classNames(styles, 'toggleButtonExample')}
      data-testid="toggle-button-example"
      onKeyUp={action('keyup')}
      onPress={action('press')}
      onHoverStart={() => setTextColor('red')}
      onHoverEnd={() => setTextColor('black')}
      style={{color: textColor}}>
      Toggle
    </ToggleButton>
  );
};
