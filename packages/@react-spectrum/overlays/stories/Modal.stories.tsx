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
import {Flex} from '@react-spectrum/layout';
import {Heading, Text} from '@react-spectrum/text';
import {Modal} from '../';
import React, {Fragment} from 'react';
import {useOverlayTriggerState} from '@react-stately/overlays';

export default {
  title: 'Modal',
  parameters: {
    providerSwitcher: {status: 'notice'}
  }
};

export const Default = () => <ModalExample />;

Default.story = {
  name: 'default'
};

export const _UnmountingTrigger = () => <UnmountingTrigger />;

_UnmountingTrigger.story = {
  name: 'unmounting trigger'
};

function ModalExample() {
  let state = useOverlayTriggerState({});

  return (
    <Fragment>
      <ActionButton onPress={state.open}>Open modal</ActionButton>
      <Modal state={state}>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content>
            <Text>I am a dialog</Text>
          </Content>
          <ButtonGroup>
            <Button variant="cta" onPress={state.close}>
              Close
            </Button>
          </ButtonGroup>
        </Dialog>
      </Modal>
    </Fragment>
  );
}

function UnmountingTrigger() {
  let popoverState = useOverlayTriggerState({});
  let modalState = useOverlayTriggerState({});

  let openModal = () => {
    popoverState.close();
    modalState.open();
  };

  // Ideally this would be a menu, but we don't have those implemented yet...
  return (
    <Fragment>
      <DialogTrigger
        type="popover"
        isOpen={popoverState.isOpen}
        onOpenChange={popoverState.setOpen}>
        <ActionButton>Open popover</ActionButton>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content>
            <Flex direction="column" gap="size-100">
              <Text>I am a dialog</Text>
              <ActionButton onPress={openModal}>Open modal</ActionButton>
            </Flex>
          </Content>
        </Dialog>
      </DialogTrigger>
      <Modal state={modalState}>
        <Dialog>
          <Heading>Title</Heading>
          <Divider />
          <Content>
            <Text>I am a dialog</Text>
          </Content>
          <ButtonGroup>
            <Button variant="cta" onPress={modalState.close}>
              Close
            </Button>
          </ButtonGroup>
        </Dialog>
      </Modal>
    </Fragment>
  );
}
