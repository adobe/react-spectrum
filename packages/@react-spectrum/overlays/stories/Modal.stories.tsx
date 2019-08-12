import {ActionButton, Button} from '@react-spectrum/button';
import {Dialog, DialogTrigger} from '@react-spectrum/dialog';
import {Modal} from '../';
import React, {Fragment, useState} from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Modal', module)
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
          <p>I am a dialog</p>
          <Button variant="cta" onPress={() => setOpen(false)}>Close</Button>
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
          <ActionButton onPress={openModal}>Open modal</ActionButton>
        </Dialog>
      </DialogTrigger>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <Dialog>
          <p>I am a dialog</p>
          <Button variant="cta" onPress={() => setModalOpen(false)}>Close</Button>
        </Dialog>
      </Modal>
    </Fragment>
  );
}
