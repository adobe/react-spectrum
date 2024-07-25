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

import {ActionButton} from '@react-spectrum/button';
import {OverlayContainer, OverlayProvider, useModal} from '../src';
import React, {useState} from 'react';

export default {
  title: 'useModal'
};

export const DefaultContainer = {
  render: () => <App />,
  name: 'default container'
};

export const DifferentContainer = {
  render: () => <App useAlternateContainer />,
  name: 'different container'
};

export const BadContainer = {
  render: () => <BadApp />,
  name: 'bad container',
  parameters: {description: {data: 'this story should crash'}}
};

function App(props) {
  let [showModal, setShowModal] = useState(false);
  return (
    <>
      <ActionButton onPress={() => setShowModal(prev => !prev)}>Toggle</ActionButton>
      <div id="alternateContainer" data-testid="alternate-container">
        <Example showModal={showModal} {...props}>The Modal</Example>
      </div>
    </>
  );
}

function ModalDOM(props) {
  let {modalProps} = useModal();
  return <div data-testid={props.modalId || 'modal'} {...modalProps}>{props.children}</div>;
}

function Modal(props) {
  return (
    <OverlayContainer portalContainer={props.container} data-testid={props.providerId || 'modal-provider'}>
      <ModalDOM modalId={props.modalId}>{props.children}</ModalDOM>
    </OverlayContainer>
  );
}

function Example(props) {
  let container = props.useAlternateContainer ? document.getElementById('alternateContainer') : undefined;
  return (
    <OverlayProvider data-testid="root-provider">
      This is the root provider.
      {props.showModal &&
      <Modal container={container}>{props.children}</Modal>
      }
    </OverlayProvider>
  );
}

function ModalDOM2(props) {
  let {modalProps} = useModal();
  return <div data-testid={props.modalId || 'modal'} {...modalProps}>{props.children}</div>;
}

function Modal2(props) {
  return (
    <OverlayContainer portalContainer={props.container} data-testid={props.providerId || 'modal-provider'}>
      <ModalDOM2 modalId={props.modalId}>{props.children}</ModalDOM2>
    </OverlayContainer>
  );
}

function Example2(props) {
  return (
    <OverlayProvider data-testid="root-provider">
      <>
        This is the root provider.
        {props.children}
      </>
    </OverlayProvider>
  );
}

function BadApp() {
  let [show1, setShow1] = useState(false);
  let [show2, setShow2] = useState(false);
  return (
    <div id="alternateContainer" data-testid="alternate-container">
      <ActionButton onPress={() => setShow1(prev => !prev)}>Toggle 1</ActionButton>
      {show1 && (
        <Example2>
          <div id="nestedContainer" />
          <ActionButton onPress={() => setShow2(prev => !prev)}>Toggle 2</ActionButton>
          {show2 && (
            <Modal2
              container={document.getElementById('nestedContainer')}
              providerId="inner-modal-provider"
              modalId="inner-modal">
              Inner
            </Modal2>
          )}
        </Example2>
      )}
    </div>
  );
}
