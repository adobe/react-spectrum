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

import {mergeProps} from '../../src/utils/mergeProps';

import {Placement, useOverlayPosition} from '../../src/overlays/useOverlayPosition';
import React, {JSX} from 'react';
import ReactDOM from 'react-dom';
import {StoryFn} from '@storybook/react';
import {useOverlayTrigger} from '../../src/overlays/useOverlayTrigger';
import {useOverlayTriggerState} from 'react-stately/useOverlayTriggerState';

function Trigger(props: {
  withPortal: boolean;
  placement: Placement;
  maxHeight?: number;
  buttonWidth?: number;
}): JSX.Element {
  const {withPortal, placement, maxHeight, buttonWidth} = props;
  const targetRef = React.useRef<HTMLButtonElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const state = useOverlayTriggerState({
    defaultOpen: false
  });
  const {triggerProps, overlayProps} = useOverlayTrigger(
    {
      type: 'menu'
    },
    state,
    targetRef
  );
  const {overlayProps: overlayPositionProps} = useOverlayPosition({
    targetRef,
    overlayRef,
    shouldFlip: false,
    isOpen: state.isOpen,
    offset: 10,
    placement,
    maxHeight
  });

  let overlay = (
    <div
      ref={overlayRef}
      {...mergeProps(overlayProps, overlayPositionProps)}
      style={{
        ...overlayPositionProps.style,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.25)',
        backgroundColor: 'white',
        overflow: 'auto'
      }}>
      <ul
        style={{
          padding: 10,
          margin: 0,
          listStyleType: 'none'
        }}>
        {maxHeight
          ? [...Array(20)].map((_, i) => <li>Hello {i}</li>)
          : [...Array(5)].map((_, i) => <li>Hello {i}</li>)}
      </ul>
    </div>
  );

  if (withPortal) {
    overlay = ReactDOM.createPortal(overlay, document.body);
  }
  return (
    <div style={{position: 'relative', margin: 'auto'}}>
      <button
        ref={targetRef}
        {...triggerProps}
        style={{width: buttonWidth}}
        onClick={() => state.toggle()}>
        Trigger (open: {`${state.isOpen}`})
      </button>
      {state.isOpen && overlay}
    </div>
  );
}

function GrowingContentTrigger(props: {placement: Placement}): JSX.Element {
  const {placement} = props;
  const targetRef = React.useRef<HTMLButtonElement>(null);
  const state = useOverlayTriggerState({
    defaultOpen: false
  });
  const {triggerProps, overlayProps} = useOverlayTrigger(
    {
      type: 'menu'
    },
    state,
    targetRef
  );

  return (
    // Pin the trigger to the right viewport edge regardless of story decorators,
    // so the overlay has to fit its width against the page boundary (issue #10050).
    <div style={{position: 'fixed', top: 8, right: 8}}>
      <button ref={targetRef} {...triggerProps} onClick={() => state.toggle()}>
        Trigger (open: {`${state.isOpen}`})
      </button>
      {state.isOpen &&
        ReactDOM.createPortal(
          <GrowingContentOverlay
            targetRef={targetRef}
            overlayProps={overlayProps}
            placement={placement} />,
          document.body
        )}
    </div>
  );
}

// The overlay is a separate component that mounts when the trigger opens, like
// usePopover-based components, so that useOverlayPosition's ResizeObserver is
// attached to the overlay element and repositions it when its content changes.
function GrowingContentOverlay(props: {
  overlayProps: React.HTMLAttributes<HTMLElement>;
  placement: Placement;
  targetRef: React.RefObject<HTMLButtonElement | null>;
}): JSX.Element {
  const {targetRef, overlayProps, placement} = props;
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const {overlayProps: overlayPositionProps} = useOverlayPosition({
    targetRef,
    overlayRef,
    placement
  });

  // Simulate content that renders after the initial positioning pass,
  // e.g. menu items with descriptions populating on a second render (issue #10050).
  const [showDescriptions, setShowDescriptions] = React.useState(false);
  React.useEffect(() => {
    const timeout = setTimeout(() => setShowDescriptions(true), 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      ref={overlayRef}
      {...mergeProps(overlayProps, overlayPositionProps)}
      style={{
        ...overlayPositionProps.style,
        boxShadow: '0 0 4px 0 rgba(0,0,0,0.25)',
        backgroundColor: 'white',
        overflow: 'auto'
      }}>
      <ul
        style={{
          padding: 10,
          margin: 0,
          listStyleType: 'none'
        }}>
        {[...Array(3)].map((_, i) => (
          <li key={i}>
            Menu item {i}
            {showDescriptions &&
              ' — a longer description that widens the overlay after it has been positioned'}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default {
  title: 'UseOverlayPosition'
};

export type TriggerStory = StoryFn<typeof Trigger>;

export const DocumentBodyContainerBottom: TriggerStory = () => (
  <Trigger withPortal placement="bottom" />
);

DocumentBodyContainerBottom.story = {
  name: 'document.body container bottom'
};

export const DocumentBodyContainerTop: TriggerStory = () => <Trigger withPortal placement="top" />;

DocumentBodyContainerTop.story = {
  name: 'document.body container top'
};

export const PositionedContainerBottom: TriggerStory = () => (
  <Trigger withPortal={false} placement="bottom" />
);

PositionedContainerBottom.story = {
  name: 'positioned container bottom'
};

export const PositionedContainerTop: TriggerStory = () => (
  <Trigger withPortal={false} placement="top" />
);

PositionedContainerTop.story = {
  name: 'positioned container top'
};

export const ButtonWidth500DocumentBodyBottomStart: TriggerStory = () => (
  <Trigger withPortal buttonWidth={500} placement="bottom start" />
);

ButtonWidth500DocumentBodyBottomStart.story = {
  name: 'buttonWidth=500 document.body bottom start'
};

export const MaxHeight200ContainerBottom: TriggerStory = () => (
  <Trigger withPortal maxHeight={200} placement="bottom" />
);

MaxHeight200ContainerBottom.story = {
  name: 'maxHeight=200 container bottom'
};

export const MaxHeight200ContainerTop: TriggerStory = () => (
  <Trigger withPortal maxHeight={200} placement="top" />
);

MaxHeight200ContainerTop.story = {
  name: 'maxHeight=200 container top'
};

export const GrowingContentRightEdge: StoryFn<typeof GrowingContentTrigger> = () => (
  <GrowingContentTrigger placement="bottom end" />
);

GrowingContentRightEdge.story = {
  name: 'growing content at right page edge (#10050)'
};

export const GrowingContentRightEdgeStart: StoryFn<typeof GrowingContentTrigger> = () => (
  <GrowingContentTrigger placement="start top" />
);

GrowingContentRightEdgeStart.story = {
  name: 'growing content at right page edge, start top (#10050)'
};
