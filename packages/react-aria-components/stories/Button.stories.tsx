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
import {Button} from 'react-aria-components';
import {mergeProps} from '@react-aria/utils';
import React, {useEffect, useRef, useState} from 'react';
import * as styles from './button-ripple.css';
import * as styles2 from './button-pending.css';

export default {
  title: 'React Aria Components'
};

export const ButtonExample = () => {
  return (
    <Button data-testid="button-example" onPress={() => alert('Hello world!')}>Press me</Button>
  );
};

export const PendingButton = {
  render: (args) => <PendingButtonExample {...args} />,
  args: {
    children: 'Press me',
    className: ({defaultClassName}) => `${defaultClassName} pending-button`
  }
};

export const PendingButtonComplexChildren = {
  render: (args) => <PendingButtonExample {...args} />,
  args: {
    children: (
      <div style={{display: 'flex', gap: '5px'}}>
        <span>
          <svg aria-label="circle" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
            <circle r="5" cx="5" cy="5" fill="red" />
          </svg>
        </span>
        <span>
          circle dot dot
        </span>
      </div>
    ),
    className: ({defaultClassName}) => `${defaultClassName} pending-button`
  }
};

function PendingButtonExample(props) {
  let [isPending, setPending] = useState(false);

  let handlePress = (e) => {
    action('pressed')(e);
    setPending(true);
  };

  useEffect(() => {
    if (isPending) {
      let timeout = setTimeout(() => {
        setPending(false);
      }, 10000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [isPending]);

  return (
    <Button
      {...props}
      isPending={isPending}
      onPress={handlePress}
      className={styles2['button']}
      renderPendingState={() => <div className={styles2['spinner']}>pending</div>}>
      <div className={isPending ? styles2['pending'] : undefined}>{props.children}</div>
    </Button>
  );
}

export const RippleButtonExample = () => {
  return (
    <RippleButton data-testid="button-example">Press me</RippleButton>
  );
};

function RippleButton(props) {
  const [coords, setCoords] = useState({x: -1, y: -1});
  const [isRippling, setIsRippling] = useState(false);

  let timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  let onPress = (e) => {
    setCoords({x: e.x, y: e.y});
    if (e.x !== -1 && e.y !== -1) {
      setIsRippling(true);
      timeout.current = setTimeout(() => setIsRippling(false), 300);
    }
  };
  useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  return (
    <Button {...mergeProps(props, {onPress})} className={styles['ripple-button']}>
      {isRippling ? (
        <span
          className={styles['ripple']}
          style={{
            left: coords.x,
            top: coords.y
          }} />
      ) : (
        ''
      )}
      <span className="content">{props.children}</span>
    </Button>
  );
}
