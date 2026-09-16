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
      <Sheet
        position="bottom"
        className="sheet-container"
        scrollAnimation="backdropAnimation"
        {...args}>
        {/* <div className={styles.backdrop} /> */}
        {/* <SheetUnderlay className="backdrop" scrollAnimation="backdropAnimation" /> */}
        <SheetContent className="sheet" scrollAnimation="radius">
          <Dialog
            style={{
              padding: 30,
              // paddingBottom: 'var(--sheet-padding)',
              boxSizing: 'border-box',
              height: '100%',
              overflow: 'auto'
            }}>
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
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
                <p>
                  In an iPhone app, consider supporting the medium detent to allow progressive
                  disclosure of the sheet’s content. For example, a share sheet displays the most
                  relevant items within the medium detent, where they’re visible without resizing.
                  To view more items, people can scroll or expand the sheet. In contrast, you might
                  not want to support the medium detent if a sheet’s content is more useful when it
                  displays at full height. For example, the compose sheets in Messages and Mail
                  display only at full height to give people enough room to create content.
                </p>
              </form>
            )}
          </Dialog>
        </SheetContent>
      </Sheet>
    </DialogTrigger>
    {/* <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: 'calc(100lvh + 58px)', outline: '2px solid red', outlineOffset: -2}} /> */}
  </>
);
