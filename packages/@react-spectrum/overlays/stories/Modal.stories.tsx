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

import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Divider} from '@react-spectrum/divider';
import {Heading, Text} from '@react-spectrum/typography';
import {Modal} from '../';
import React, {Fragment, useState} from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Modal', module)
  .addParameters({providerSwitcher: {status: 'notice'}})
  .addParameters({chromatic: {disable: true}})
  .add(
    'default',
    () => <ModalExample />
  )
  .add(
    'unmounting trigger',
    () => <UnmountingTrigger />
  );

function ModalExample() {
  let [isOpen, setOpen] = useState(false);

  return (
    <Fragment>
      <ActionButton onPress={() => setOpen(true)}>Open modal</ActionButton>
      <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content><Text>I am a dialog</Text></Content>
          <ButtonGroup><Button variant="cta" onPress={() => setOpen(false)}>Close</Button></ButtonGroup>
        </Dialog>
      </Modal>
    </Fragment>
  );
}

function UnmountingTrigger() {
  let [isPopoverOpen, setPopoverOpen] = useState(false);
  let [isModalOpen, setModalOpen] = useState(false);

  let openModal = () => {
    setPopoverOpen(false);
    setModalOpen(true);
  };

  // Ideally this would be a menu, but we don't have those implemented yet...
  return (
    <Fragment>
      <DialogTrigger type="popover" isOpen={isPopoverOpen} onOpenChange={setPopoverOpen}>
        <ActionButton>Open popover</ActionButton>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content><Text>I am a dialog</Text></Content>
          <ButtonGroup><ActionButton onPress={openModal}>Open modal</ActionButton></ButtonGroup>
        </Dialog>
      </DialogTrigger>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content><Text>I am a dialog</Text></Content>
          <ButtonGroup><Button variant="cta" onPress={() => setModalOpen(false)}>Close</Button></ButtonGroup>
        </Dialog>
      </Modal>
    </Fragment>
  );
}
