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

import {Button} from '../src/Button';

import {ComboBox} from '../src/ComboBox';
import {DateRangePickerExample} from './DatePicker.stories';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {Heading} from '../src/Heading';
import {Input} from '../src/Input';
import {Label} from '../src/Label';
import {ListBox} from '../src/ListBox';
import {Meta, StoryFn} from '@storybook/react';
import {Modal, ModalOverlay} from '../src/Modal';
import {MyListBoxItem} from './utils';
import {Popover} from '../src/Popover';
import React from 'react';
import styles from '../example/index.css';
import {TextField} from '../src/TextField';
import './styles.css';

export default {
  title: 'React Aria Components/Modal',
  component: Modal
} as Meta<typeof Modal>;

export type ModalStory = StoryFn<typeof Modal>;

export const ModalExample: ModalStory = () => (
  <DialogTrigger>
    <Button>Open modal</Button>
    <ModalOverlay
      style={{
        position: 'fixed',
        zIndex: 100,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      <Modal
        style={{
          background: 'Canvas',
          color: 'CanvasText',
          border: '1px solid gray',
          padding: 30
        }}>
        <Dialog>
          {({close}) => (
            <form style={{display: 'flex', flexDirection: 'column'}}>
              <Heading slot="title" style={{marginTop: 0}}>
                Sign up
              </Heading>
              <label>
                First Name: <input placeholder="John" />
              </label>
              <label>
                Last Name: <input placeholder="Smith" />
              </label>
              <Button onPress={close} style={{marginTop: 10}}>
                Submit
              </Button>
            </form>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  </DialogTrigger>
);

export const SheetExample: ModalStory = () => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}>
      <DialogTrigger>
        <Button>Open modal</Button>
        <ModalOverlay
          style={{
            position: 'fixed',
            zIndex: 100,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.5)'
          }}>
          <Modal
            style={{
              position: 'sticky',
              left: 0,
              width: '300px',
              /* Extra padding to account for iOS floating browser UI. */
              top: '-100px',
              height: 'calc(100dvh + 200px)',
              padding: '100px 0',
              marginLeft: 'auto',
              background: 'white',
              outline: 'none',
              backgroundColor: 'lightgray',
              borderLeft: '1px solid black',
              boxShadow: '-8px 0 20px rgba(0, 0, 0, 0.1)',
              fontFamily: 'system-ui',
              fontSize: '0.875rem'
            }}>
            <Dialog>
              {({close}) => (
                <form style={{display: 'flex', flexDirection: 'column'}}>
                  <Heading slot="title" style={{marginTop: 0}}>
                    Sign up
                  </Heading>
                  <label>
                    First Name: <input placeholder="John" />
                  </label>
                  <label>
                    Last Name: <input placeholder="Smith" />
                  </label>
                  <Button onPress={close} style={{marginTop: 10}}>
                    Submit
                  </Button>
                </form>
              )}
            </Dialog>
          </Modal>
        </ModalOverlay>
      </DialogTrigger>
    </div>
    <div style={{height: '100vh'}} />
  </div>
);

function InertTest() {
  return (
    <DialogTrigger>
      <Button>Open modal</Button>
      <ModalOverlay
        isDismissable
        style={{
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Modal
          style={{
            background: 'Canvas',
            color: 'CanvasText',
            border: '1px solid gray',
            padding: 30
          }}>
          <Dialog>
            {() => (
              <>
                <TextField>
                  <Label>First name</Label>
                  <Input />
                </TextField>
                <DialogTrigger>
                  <Button>Combobox Trigger</Button>
                  <Popover placement="bottom start">
                    <Dialog>
                      {() => (
                        <ComboBox
                          menuTrigger="focus"
                          autoFocus
                          name="combo-box-example"
                          data-testid="combo-box-example"
                          allowsEmptyCollection>
                          <Label style={{display: 'block'}}>Test</Label>
                          <div style={{display: 'flex'}}>
                            <Input />
                            <Button>
                              <span aria-hidden="true" style={{padding: '0 2px'}}>
                                ▼
                              </span>
                            </Button>
                          </div>
                          <ListBox className={styles.menu}>
                            <MyListBoxItem>Foo</MyListBoxItem>
                            <MyListBoxItem>Bar</MyListBoxItem>
                            <MyListBoxItem>Baz</MyListBoxItem>
                            <MyListBoxItem href="http://google.com">Google</MyListBoxItem>
                          </ListBox>
                        </ComboBox>
                      )}
                    </Dialog>
                  </Popover>
                </DialogTrigger>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

export const InertTestStory = {
  render: () => <InertTest />,
  parameters: {
    description: {
      data: 'You should be able to click "Combobox Trigger" and then click on the textfield, closing the subdialog. A second click should move focus into the textfield'
    }
  }
};

function DateRangePickerInsideModal() {
  return (
    <DialogTrigger>
      <Button>Open modal</Button>
      <ModalOverlay
        isDismissable
        style={{
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          zIndex: 100
        }}>
        <Modal
          style={{
            background: 'Canvas',
            border: '1px solid gray',
            color: 'CanvasText',
            padding: 30
          }}>
          <Dialog>
            {/* @ts-ignore */}
            <DateRangePickerExample />
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}

export const DateRangePickerInsideModalStory = {
  render: () => <DateRangePickerInsideModal />,
  parameters: {
    description: {
      data: 'Open the Modal, then open the DateRangePicker and select a start date. Clicking outside the Modal should close the picker but keep the Modal open.'
    }
  }
};
