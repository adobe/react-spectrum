import {Button} from '../src/Button';
import {Dialog, DialogTrigger} from '../src/Dialog';
import {Heading} from '../src/Heading';
import {Modal, ModalOverlay} from '../src/Modal';
import React from 'react';
import styles from './styles.css';

export default {
  title: 'React Aria Components - Animations'
};

export let ModalAnimation = {
  render: (): React.ReactElement => {
    return (
      <div className="App">
        <DialogTrigger>
          <Button>Open modal</Button>
          <ModalOverlay className={styles['my-overlay']}>
            <Modal isDismissable className={styles['my-modal']}>
              <Dialog>
                {({close}) => (
                  <>
                    <Heading slot="title">Notice</Heading>
                    <p>This is a modal with a custom modal overlay.</p>
                    <Button onPress={close}>Close</Button>
                  </>
                )}
              </Dialog>
            </Modal>
          </ModalOverlay>
        </DialogTrigger>
      </div>
    );
  }
};
