import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content, Header} from '@react-spectrum/view';
import {Dialog, DialogContainer, useDialogContainer} from '../';
import {Divider} from '@react-spectrum/divider';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import React from 'react';

export function DialogContainerExample(props) {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <ActionButton onPress={() => setOpen(true)}>Open dialog</ActionButton>
      <DialogContainer onDismiss={() => setOpen(false)} {...props}>
        {isOpen &&
          <ExampleDialog {...props} />
        }
      </DialogContainer>
    </>
  );
}

export function MenuExample(props) {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <MenuTrigger>
        <ActionButton>Open menu</ActionButton>
        <Menu onAction={() => setOpen(true)}>
          <Item>Open dialog...</Item>
        </Menu>
      </MenuTrigger>
      <DialogContainer {...props} onDismiss={() => setOpen(false)}>
        {isOpen &&
          <ExampleDialog {...props} />
        }
      </DialogContainer>
    </>
  );
}

function ExampleDialog(props) {
  let container = useDialogContainer();

  return (
    <Dialog>
      <Heading>The Heading</Heading>
      <Header>The Header</Header>
      <Divider />
      <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
      {!props.isDismissable &&
        <ButtonGroup>
          <Button variant="secondary" onPress={container.dismiss}>Cancel</Button>
          <Button variant="cta" onPress={container.dismiss}>Confirm</Button>
        </ButtonGroup>
      }
    </Dialog>
  );
}
