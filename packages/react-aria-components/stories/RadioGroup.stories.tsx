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
import {Button, Dialog, DialogTrigger, FieldError, Form, Label, Modal, ModalOverlay, Radio, RadioGroup} from 'react-aria-components';
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {useState} from 'react';
import styles from '../example/index.css';
import './styles.css';

export default {
  title: 'React Aria Components/RadioGroup',
  component: RadioGroup
} as Meta<typeof RadioGroup>;

export type RadioGroupStory = StoryFn<typeof RadioGroup>;
export type RadioGroupStoryObj = StoryObj<typeof RadioGroup>;

export const RadioGroupExample: RadioGroupStoryObj = {
  render: (props) => {
    return (
      <RadioGroup
        {...props}
        data-testid="radio-group-example"
        className={styles.radiogroup}>
        <Label>Favorite pet</Label>
        <Radio onFocus={action('radio focus')} onBlur={action('radio blur')} className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
        <Radio onFocus={action('radio focus')} onBlur={action('radio blur')} className={styles.radio} value="cats">Cat</Radio>
        <Radio onFocus={action('radio focus')} onBlur={action('radio blur')} className={styles.radio} value="dragon">Dragon</Radio>
      </RadioGroup>
    );
  },
  args: {
    onFocus: action('onFocus'),
    onBlur: action('onBlur')
  }
};

export const RadioGroupControlledExample: RadioGroupStory = (props) => {
  let [selected, setSelected] = useState<string|null>(null);

  return (
    <RadioGroup
      {...props}
      data-testid="radio-group-example"
      className={styles.radiogroup}
      value={selected}
      onChange={setSelected}>
      <Label>Favorite pet (controlled)</Label>
      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
      <Radio className={styles.radio} value="cats">Cat</Radio>
      <Radio className={styles.radio} value="dragon">Dragon</Radio>
    </RadioGroup>
  );
};

export const RadioGroupInDialogExample: RadioGroupStory = (props) => {
  return (
    <DialogTrigger>
      <Button>Open dialog</Button>
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
          <Dialog
            style={{
              outline: '2px solid transparent',
              outlineOffset: '2px',
              position: 'relative'
            }}>
            {({close}) => (
              <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                <div style={{display: 'flex', flexDirection: 'row', gap: 20}}>
                  <div>
                    <RadioGroup
                      {...props}
                      data-testid="radio-group-example"
                      className={styles.radiogroup}>
                      <Label>Favorite pet</Label>
                      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
                      <Radio className={styles.radio} value="cats">Cat</Radio>
                      <Radio className={styles.radio} value="dragon">Dragon</Radio>
                    </RadioGroup>
                  </div>
                  <Form>
                    <RadioGroup
                      className={styles.radiogroup}
                      data-testid="radio-group-example-2"
                      isRequired>
                      <Label>Second Favorite pet</Label>
                      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
                      <Button>About dogs</Button>
                      <Radio className={styles.radio} value="cats">Cat</Radio>
                      <Button>About cats</Button>
                      <Radio className={styles.radio} value="dragon">Dragon</Radio>
                      <Button>About dragons</Button>
                      <FieldError className={styles.errorMessage} />
                    </RadioGroup>
                  </Form>
                  <Form>
                    <RadioGroup
                      className={styles.radiogroup}
                      data-testid="radio-group-example-3"
                      defaultValue="dragon"
                      isRequired>
                      <Label>Third Favorite pet</Label>
                      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
                      <Button>About dogs</Button>
                      <Radio className={styles.radio} value="cats">Cat</Radio>
                      <Button>About cats</Button>
                      <Radio className={styles.radio} value="dragon">Dragon</Radio>
                      <Button>About dragons</Button>
                      <FieldError className={styles.errorMessage} />
                    </RadioGroup>
                  </Form>
                </div>
                <div>
                  <Button onPress={close} style={{marginTop: 10}}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

export const RadioGroupSubmitExample: RadioGroupStory = (props) => {
  return (
    <Form>
      <RadioGroup
        {...props}
        className={styles.radiogroup}
        data-testid="radio-group-example"
        isRequired>
        <Label>Favorite pet</Label>
        <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
        <Radio className={styles.radio} value="cats">Cat</Radio>
        <Radio className={styles.radio} value="dragon">Dragon</Radio>
        <FieldError className={styles.errorMessage} />
      </RadioGroup>
      <Button type="submit">Submit</Button>
      <Button type="reset">Reset</Button>
    </Form>
  );
};
