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

import {Button, Dialog, DialogTrigger, Heading} from 'react-aria-components';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import {Sheet, SheetContent, SheetUnderlay} from '../src/Sheet';
import './Sheet.css';

export default {
  title: 'React Aria Components/Sheet',
  component: Sheet,
  argTypes: {
    position: {
      control: {
        type: 'inline-radio',
        options: ['bottom', 'top', 'left', 'right', 'center']
      }
    },
    swipeDirection: {
      control: {
        type: 'inline-radio',
        options: ['bottom', 'top', 'left', 'right', 'vertical', 'horizontal']
      }
    }
  }
} as Meta<typeof Sheet>;

export type SheetStory = StoryFn<typeof Sheet>;

export const SheetExample: SheetStory = args => (
  <>
    <DialogTrigger>
      <Button>Open sheet</Button>
      <Sheet position="bottom" className="sheet-container" {...args}>
        <SheetContent className="sheet">
          <Dialog>
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
          </Dialog>
        </SheetContent>
      </Sheet>
    </DialogTrigger>
    {/* <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 'calc(100lvh + 58px)', outline: '2px solid red', outlineOffset: -2}} /> */}
  </>
);

export const SheetDetents: SheetStory = args => (
  <DialogTrigger>
    <Button>Open sheet</Button>
    {/* Opens with 180px of the sheet showing; drag up to full height or down to dismiss. */}
    <Sheet position="bottom" className="sheet-container" snapPoints={['180px']} {...args}>
      <SheetContent
        className="sheet"
        style={{height: '92dvh', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
        <Dialog>
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
        </Dialog>
      </SheetContent>
    </Sheet>
  </DialogTrigger>
);
