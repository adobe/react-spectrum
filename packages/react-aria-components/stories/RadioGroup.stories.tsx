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

import {Button, Dialog, DialogTrigger, Label, Modal, ModalOverlay, Radio, RadioGroup} from 'react-aria-components';
import React, {useRef, useState} from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const RadioGroupExample = () => {
  return (
    <RadioGroup
      data-testid="radio-group-example"
      className={styles.radiogroup}>
      <Label>Favorite pet</Label>
      <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
      <Radio className={styles.radio} value="cats">Cat</Radio>
      <Radio className={styles.radio} value="dragon">Dragon</Radio>
    </RadioGroup>
  );
};

export const RadioGroupControlledExample = () => {
  let [selected, setSelected] = useState<string|null>(null);
  
  return (
    <RadioGroup
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

export const RadioGroupInDialogExample = () => {
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
              <>
                <div>
                  <RadioGroupExample />
                </div>
                <div>
                  <Button onPress={close} style={{marginTop: 10}}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};

function RadioGroupFocusableRefComponent() {
  let focusableRef = useRef<HTMLDivElement>(null);
  let triggerButtonRef = useRef<HTMLButtonElement>(null);
  let [selected, setSelected] = useState<string|null>(null);
  
  let onPress = () => {
    focusableRef.current?.focus();
    console.log(document.activeElement);
  };
    
  return (
    <>
      <div
        style={{
          height: '200vh',
          padding: '80px',
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between'
        }}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{fontSize: 16, marginBottom: 16}}>
            <p>
              Use keyboard interactions for a visible focus ring or 
              use the <a href="https://github.com/wizzyfx/nerdeFocusPlugIn" target="_blank">NerdeFocus plugin</a> to track focus.
            </p>
            <p>
              Try clicking on the 'Focus radio group' button below either when no radios are selected or when any radio is selected except the first.
            </p>
            <p>
              Expectation is that focus goes to the first radio in the group when none of them are selected,
              and it goes to the selected one if it exists.
            </p>
          </div>
          <Button ref={triggerButtonRef} style={{padding: 8}} onPress={onPress}>Focus radio group</Button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <RadioGroup
            ref={focusableRef}
            data-testid="radio-group-example"
            className={styles.radiogroup}
            value={selected}
            onChange={setSelected}>
            <Label>Favorite pet (focusable ref)</Label>
            <Radio className={styles.radio} value="dogs" data-testid="radio-dog">Dog</Radio>
            <Radio className={styles.radio} value="cats">Cat</Radio>
            <Radio className={styles.radio} value="dragon">Dragon</Radio>
          </RadioGroup>
          <Button
            style={{
              marginTop: 40
            }}
            onPress={() => {
              document.documentElement.scrollTop = 0;
              triggerButtonRef.current?.focus();
            }}>Scroll to top</Button>
        </div>
      </div>
    </>
  );
}

export const RadioGroupFocusableRefExample = {
  render: RadioGroupFocusableRefComponent,
  parameters: {description: {data: `
  Use keyboard interactions for a visible focus ring or use the NerdeFocus plugin to track focus. 
  Try both clicking on the extra button when no radios are selected and clicking on the extra button when any radio is selected except the first.
  Expectation is that focus goes to the first radio is the group when none are selected, and focus goes to the selected radio if one is selected.
  `}}
};
