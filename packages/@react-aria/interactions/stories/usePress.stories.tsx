/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';
import styles from './usePress-stories.css';
import {usePress} from '@react-aria/interactions';

export default {
  title: 'usePress'
};

export function TouchIssue() {
  const [opened, setOpened] = React.useState(false);
  const handleOpen = React.useCallback(() => {
    console.log('opening');
    setOpened(true);
  }, []);
  const handleClose = React.useCallback(() => {
    console.log('closing');
    setOpened(false);
  }, []);
  const handleOnClick = React.useCallback(() => {
    alert('clicked it');
  }, []);

  return (
    <div className={styles['outer-div']}>
      <OnPress onPress={handleOpen} className={styles['open-btn']}>
        Open
      </OnPress>
      <div className={styles['side-by-side']}>
        <div>Some text</div>
        <a href="https://www.google.com" className={styles['visit-link']}>
          Another Link
        </a>
        <button className={styles['my-btn']} onClick={handleOnClick}>
          On Click
        </button>
      </div>

      {opened && (
        <div className={styles['fake-modal']}>
          <h1>Header</h1>
          <div className={styles['side-by-side']}>
            <OnPress onPress={handleClose} className={styles['close-btn']}>
              Close 1
            </OnPress>
            <OnPress onPress={handleClose} className={styles['close-btn']}>
              Close 2
            </OnPress>
            <OnPress onPress={handleClose} className={styles['close-btn']}>
              Close 3
            </OnPress>
          </div>
        </div>
      )}
    </div>
  );
}

function OnPress(props) {
  const {className, onPress, children} = props;

  const {pressProps} = usePress({
    onPress
  });

  return (
    <div
      {...pressProps}
      role="button"
      tabIndex={0}
      className={`OnPress ${className || ''}`}>
      {children}
    </div>
  );
}
