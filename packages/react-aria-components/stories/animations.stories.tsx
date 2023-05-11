
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay
} from 'react-aria-components';
import React from 'react';
import styles from './styles.css';


export default {
  title: 'React Aria Components - Animations'
};

export let ModalAnimation = {
  render: () => {
    return (
      <div className="App">
        <DialogTrigger>
          <Button>Open modal</Button>
          <ModalOverlay className={styles['my-overlay']}>
            <Modal isDismissable className={styles['my-modal']}>
              <Dialog>
                {({close}) => (
                  <>
                    <Heading>Notice</Heading>
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
