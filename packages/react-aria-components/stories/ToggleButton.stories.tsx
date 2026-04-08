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

import {action} from 'storybook/actions';
import {classNames} from '@adobe/react-spectrum/private/utils/classNames';
import {Meta, StoryFn} from '@storybook/react';
import {ProgressBar} from '../src/ProgressBar';
import React, {useState} from 'react';
import styles from '../example/index.css';
import * as styles2 from './button-pending.css';
import {Text} from '../src/Text';
import {ToggleButton} from '../src/ToggleButton';
import './styles.css';

export default {
  title: 'React Aria Components/ToggleButton',
  component: ToggleButton
} as Meta<typeof ToggleButton>;

export type ToggleButtonStory = StoryFn<typeof ToggleButton>;

export const ToggleButtonExample: ToggleButtonStory = () => {

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

export const ReactAction: ToggleButtonStory = (props) => {
  return (
    <ToggleButton
      {...props}
      className={styles2['button']}
      changeAction={async () => {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }}>
      {({isPending}) => (
        <>
          <Text className={isPending ? styles2['pending'] : undefined}>Toggle</Text>
          <ProgressBar
            aria-label="saving"
            isIndeterminate
            className={[styles2['spinner'], (isPending ? styles2['spinner-pending'] : '')].join(' ')}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" opacity=".25" />
              <path fill="currentColor" d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                <animateTransform attributeName="transform" type="rotate" dur="0.75s" values="0 12 12;360 12 12" repeatCount="indefinite" />
              </path>
            </svg>
          </ProgressBar>
        </>
      )}
    </ToggleButton>
  );
};
