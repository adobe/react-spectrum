import {classNames} from '@react-spectrum/utils';
import {FocusRing} from '@react-aria/focus';
import React, {useRef} from 'react';
import rspStyles from './SplitView.css';
import {SplitViewProps} from '@react-types/splitview';
import styles from '@adobe/spectrum-css-temp/components/splitview/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useSplitView} from '@react-aria/splitview';
import {useSplitViewState} from '@react-stately/splitview';


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

export function SplitView(props: SplitViewProps) {
  let {direction} = useLocale();
  let completeProps = Object.assign(
    {},
    {
      orientation: 'horizontal',
      allowsResizing: true,
      primaryPane: 0,
      defaultPrimarySize: 304,
      primaryMinSize: 304,
      primaryMaxSize: Infinity,
      secondaryMinSize: 304,
      secondaryMaxSize: Infinity
    },
    props
  );
  let {
    orientation,
    allowsResizing,
    primaryPane
  } = completeProps;
  let containerRef = useRef(null);

  let children = React.Children.toArray(props.children);
  if (children.length !== 2) {
    throw new Error(`SplitView must have 2 children, ${children.length} found.`);
  }

  let {containerState, handleState} = useSplitViewState(completeProps);

  let {
    handleProps,
    primaryPaneProps
  } = useSplitView(
    {
      containerRef,
      ...completeProps
    }, {
      containerState,
      handleState
    },
      direction
  );

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
      ref={containerRef}
      className={classNames(styles, 'spectrum-SplitView', `spectrum-SplitView--${orientation}`, props.className)}>
      {primaryPane === 0 ? primary : secondary}
      <FocusRing focusRingClass={classNames(styles, 'focus-ring')}>
        <div
          {...handleProps}
          className={classNames(styles,
            'spectrum-SplitView-splitter',
            {
              'is-draggable': allowsResizing,
              'is-hovered': handle.hovered,
              'is-active': handle.dragging,
              'is-collapsed-start': handle.offset === 0 && primaryPane === 0,
              'is-collapsed-end': handle.offset === 0 && primaryPane === 1
            },
            classNames(rspStyles, `react-spectrum-SplitView--${orientation}`)
          )}>
          {allowsResizing ? <div className={classNames(styles, 'spectrum-SplitView-gripper')} /> : null}
        </div>
      </FocusRing>
      {primaryPane === 1 ? primary : secondary}
    </div>
  );
}
