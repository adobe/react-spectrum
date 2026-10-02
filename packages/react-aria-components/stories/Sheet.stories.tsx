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

import {Button, Heading} from 'react-aria-components';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {Sheet, SheetBackdrop, SheetContent, SheetOverlay, SheetTrigger} from '../src/Sheet';
import './Sheet.css';

export default {
  title: 'React Aria Components/Sheet',
  component: SheetOverlay,
  argTypes: {
    position: {
      control: {
        type: 'inline-radio',
        options: ['bottom', 'top', 'left', 'right', 'start', 'end', 'center']
      }
    },
    swipeDirection: {
      control: {
        type: 'inline-radio',
        options: ['bottom', 'top', 'left', 'right', 'start', 'end', 'vertical', 'horizontal']
      }
    }
  }
} as Meta<typeof SheetOverlay>;

export type SheetStory = StoryFn<typeof SheetOverlay>;

export const SheetExample: SheetStory = args => (
  <SheetTrigger>
    <Button>Open sheet</Button>
    <SheetOverlay position="bottom" {...args}>
      <SheetBackdrop swipeAnimation="backdropAnimation" />
      <Sheet overscrollPadding swipeAnimation="radius">
        <SheetContent>
          {({close}) => (
            <form style={{display: 'flex', flexDirection: 'column'}}>
              <Heading slot="title" style={{marginTop: 0}}>
                Sign up
              </Heading>
              <label>
                First Name: <input placeholder="John" style={{fontSize: 16}} />
              </label>
              <label>
                Last Name: <input placeholder="Smith" />
              </label>
              <Button onPress={close} style={{marginTop: 10}}>
                Submit
              </Button>
              {[...Array(8)].map((_, i) => (
                <p key={i}>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet.
                </p>
              ))}
            </form>
          )}
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  </SheetTrigger>
);

export const SheetDetents: SheetStory = args => (
  <SheetTrigger>
    <Button>Open sheet</Button>
    {/* Opens with 180px of the sheet showing; drag up to full height or down to dismiss. */}
    <SheetOverlay position="bottom" snapPoints={['180px']} {...args}>
      <SheetBackdrop swipeAnimation="backdropAnimation" swipeAnimationRange={{start: 0}} />
      <Sheet
        style={{height: '92dvh'}}
        overscrollPadding
        swipeAnimation="radius"
        swipeAnimationRange={{end: 0}}>
        <SheetContent>
          {({close}) => (
            <form style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <Heading slot="title" style={{marginTop: 0}}>
                Details
              </Heading>
              <p style={{marginTop: 0}}>
                Drag the handle up to expand this sheet to full height, or swipe it down to dismiss.
                It opens at the medium detent so the most relevant content is visible without
                resizing.
              </p>
              <Button onPress={close}>Done</Button>
              {[...Array(8)].map((_, i) => (
                <p key={i}>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet.
                </p>
              ))}
            </form>
          )}
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  </SheetTrigger>
);

export const SheetStacking: SheetStory = args => {
  // A sheet can be nested inside another sheet's content. When the child opens, the parent scales
  // backward (bound to the child's view timeline); swiping the child away scales the parent forward
  // again, continuously tracking the drag.
  let renderSheet = (depth: number): React.ReactNode => (
    <SheetOverlay position="bottom" {...args}>
      <SheetBackdrop swipeAnimation="backdropAnimation" />
      <Sheet overscrollPadding swipeAnimation="radius" stackAnimation="scaleBack">
        <SheetContent>
          {({close}) => (
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <Heading slot="title" style={{marginTop: 0}}>
                Sheet {depth}
              </Heading>
              <p style={{marginTop: 0}}>
                This is sheet {depth}. Open another to watch this one scale backward, then swipe it
                away to bring this one forward again.
              </p>
              {depth < 4 && (
                <SheetTrigger>
                  <Button>Open sheet {depth + 1}</Button>
                  {renderSheet(depth + 1)}
                </SheetTrigger>
              )}
              <Button onPress={close}>Close sheet {depth}</Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </SheetOverlay>
  );

  return (
    <SheetTrigger>
      <Button>Open sheet 1</Button>
      {renderSheet(1)}
    </SheetTrigger>
  );
};
