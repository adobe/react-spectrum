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

import {Button, Dialog, DialogTrigger, Heading, Modal, ModalOverlay} from 'react-aria-components';
import React, {useEffect} from 'react';

export default {
  title: 'React Aria Components'
};

export const ModalExample = () => (
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

export const ModalInteractionOutsideExample = () => {

  useEffect(() => {
    let button = document.createElement('button');
    button.id = 'test-button';
    button.textContent = 'Click to close';
    button.style.position = 'fixed';
    button.style.top = '0';
    button.style.right = '0';
    button.style.zIndex = '200';
    document.body.appendChild(button);

    return () => {
      document.body.removeChild(button);
    };
  }, []);

  return (
    <DialogTrigger>
      <Button>Open modal</Button>
      <ModalOverlay
        isDismissable
        shouldCloseOnInteractOutside={el => {
          if (el.id === 'test-button') {return true;}
          return false;
        }}
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
};

export const ModalInteractionOutsideDefaultOverlayExample = () => {

  useEffect(() => {
    let button = document.createElement('button');
    button.id = 'test-button';
    button.textContent = 'Click to close';
    button.style.position = 'fixed';
    button.style.top = '0';
    button.style.right = '0';
    button.style.zIndex = '200';
    document.body.appendChild(button);
    return () => {
      document.body.removeChild(button);
    };
  }, []);

  return (
    <DialogTrigger>
      <Button>Open modal</Button>
      <Modal
        isDismissable
        shouldCloseOnInteractOutside={el => {
          if (el.id === 'test-button') {return true;}
          return false;
        }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
    </DialogTrigger>
  );
};
