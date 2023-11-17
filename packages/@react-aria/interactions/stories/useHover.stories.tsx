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
import {AriaButtonProps} from '@react-types/button';
import {classNames} from '@react-spectrum/utils';
import {mergeProps} from '@react-aria/utils';
import React, {useRef, useState} from 'react';
import {useButton} from '@react-aria/button';
import {useHover} from '../';

export default {
  title: 'useHover'
};

export const HoverDisabling = {
  render: () => <App />,
  name: 'hover disabling'
};

function Button(props: AriaButtonProps) {
  let {children, isDisabled} = props;

  let buttonRef = useRef(null);

  let {buttonProps} = useButton(props, buttonRef);
  let {hoverProps, isHovered} = useHover({isDisabled});

  return (
    <button
      className={classNames({}, {
        isHovered
      })}
      data-hover={isHovered || null}
      {...mergeProps(buttonProps, hoverProps)}
      ref={buttonRef}>
      {children}
    </button>
  );
}

function App() {
  let [isDisabled, setIsDisabled] = useState(false);
  return (
    <>
      <style>{`
        .isHovered {
          background-color: purple;
        }
      `}</style>
      <Button isDisabled={isDisabled} onPress={() => setIsDisabled(true)}>
        {'Hover & Press'}
      </Button>
      <button onClick={() => setIsDisabled(false)}>Reset</button>
    </>
  );
}
