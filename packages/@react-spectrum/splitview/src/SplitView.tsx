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
import {classNames, useStyleProps} from '@react-spectrum/utils';
import {DOMProps, SplitViewProps, StyleProps} from '@react-types/shared';
import React, {useRef} from 'react';
import styles from '@adobe/spectrum-css-temp/components/splitview/vars.css';
import {useSplitView} from '@react-aria/splitview';
import {useSplitViewState} from '@react-stately/splitview';
import './SplitView.css';


const ORIENTATIONS = {
  horizontal: 'width',
  vertical: 'height'
};

const CURSORS = {
  horizontal: {
    default: 'ew-resize',
    min: ['e-resize', 'w-resize'],
    max: ['w-resize', 'e-resize']
  },
  vertical: {
    default: 'ns-resize',
    min: ['s-resize', 'n-resize'],
    max: ['n-resize', 's-resize']
  }
};

interface SpectrumSplitViewProps extends SplitViewProps, DOMProps, StyleProps {}

export function SplitView(props: SpectrumSplitViewProps) {
  let {
    orientation = 'horizontal' as 'horizontal',
    allowsResizing = true,
    primaryPane = 0 as 0,
    primaryMinSize = 304,
    primaryMaxSize = Infinity,
    secondaryMinSize = 304,
    secondaryMaxSize = Infinity,
    ...remainingProps
  } = props;
  let {styleProps} = useStyleProps(remainingProps);
  let containerRef = useRef(null);

  let children = React.Children.toArray(props.children);
  if (children.length !== 2) {
    throw new Error(`SplitView must have 2 children, ${children.length} found.`);
  }

  let {containerState, handleState} = useSplitViewState(props);

  let {
    containerProps,
    handleProps,
    primaryPaneProps
  } = useSplitView({
    containerRef,
    orientation,
    allowsResizing,
    primaryPane,
    primaryMinSize,
    primaryMaxSize,
    secondaryMinSize,
    secondaryMaxSize,
    ...remainingProps
  }, {
    containerState,
    handleState
  });

  let dimension = ORIENTATIONS[orientation];
  let secondaryPane = Number(!primaryPane);
  let handle = handleState;
  let primaryStyle = {[dimension]: handle.offset};

  if (handle.hovered || handle.dragging) {
    let cursors = CURSORS[orientation];
    let cursor = cursors.default;
    if (handle.offset <= containerState.minPos) {
      cursor = cursors.min[primaryPane];
    } else if (handle.offset >= containerState.maxPos) {
      cursor = cursors.max[primaryPane];
    }
    document.body.style.cursor = cursor;
  } else {
    document.body.style.cursor = null;
  }

  let primary = (
    <div
      {...primaryPaneProps}
      className={classNames(styles, 'spectrum-SplitView-pane')}
      style={primaryStyle}>
      {children[primaryPane]}
    </div>
  );

  let secondary = (
    <div
      className={classNames(styles, 'spectrum-SplitView-pane')}
      style={{flex: 1}}>
      {children[secondaryPane]}
    </div>
  );

  return (
    <div
      {...containerProps}
      {...styleProps}
      ref={containerRef}
      className={classNames(styles, 'spectrum-SplitView', `spectrum-SplitView--${orientation}`, styleProps.className)}>
      {primaryPane === 0 ? primary : secondary}
      <div
        {...handleProps}
        className={classNames(styles,
          'spectrum-SplitView-splitter',
          `react-spectrum-SplitView--${orientation}`,
          {
            'is-draggable': allowsResizing,
            'is-hovered': handle.hovered,
            'is-active': handle.dragging,
            'is-collapsed-start': handle.offset === 0 && primaryPane === 0,
            'is-collapsed-end': handle.offset === 0 && primaryPane === 1
          }
        )}>
        {allowsResizing ? <div className={classNames(styles, 'spectrum-SplitView-gripper')} /> : null}
      </div>
      {primaryPane === 1 ? primary : secondary}
    </div>
  );
}
