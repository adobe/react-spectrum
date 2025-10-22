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

import {Button, ComboBox, Dialog, DialogTrigger, Heading, Input, Label, ListBox, Modal, ModalOverlay, Popover, TextField} from 'react-aria-components';
import {Meta, StoryFn} from '@storybook/react';
import React from 'react';
import './styles.css';
import {MyListBoxItem} from './utils';
import styles from '../example/index.css';


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
              <Heading slot="title" style={{marginTop: 0}}>Sign up</Heading>
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
                              <span aria-hidden="true" style={{padding: '0 2px'}}>▼</span>
                            </Button>
                          </div>
                          <ListBox
                            className={styles.menu}>
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
