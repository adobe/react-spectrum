import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Content, Header} from '@react-spectrum/view';
import {Dialog, DialogContainer, useDialogContainer} from '../';
import {Divider} from '@react-spectrum/divider';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import React, {useRef} from 'react';

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


export function NestedDialogContainerExample(props) {
  let {useRestoreFocusRef = false} = props;
  let [dialog, setDialog] = React.useState(null);
  let [shouldUseRestoreFocusRef, setShouldUseRestoreFocusRef] = React.useState(useRestoreFocusRef);
  let triggerRef = useRef();
  let afterThisRef = useRef();
  let afterThatRef = useRef();
  let dismiss = () => {
    if (!useRestoreFocusRef) {
      setDialog(null);
      return;
    }
    setShouldUseRestoreFocusRef(false);
    requestAnimationFrame(() => {
      setDialog(null);
      setShouldUseRestoreFocusRef(true);
    });
  };

  return (
    <>
      <MenuTrigger>
        <ActionButton aria-label="Actions" ref={triggerRef}>Open menu</ActionButton>
        <Menu onAction={setDialog}>
          <Item key="doThis">Do this…</Item>
          <Item key="doThat">Do that…</Item>
        </Menu>
      </MenuTrigger>
      {useRestoreFocusRef &&
        <>
          <input ref={afterThisRef} placeholder="Focus after this" />
          <input ref={afterThatRef} placeholder="Focus after that" />
        </>
      }
      <DialogContainer onDismiss={dismiss}>
        {dialog === 'doThis' &&
          <Dialog
            onDismiss={dismiss}
            {
              ...(
                useRestoreFocusRef ?
                {
                  restoreFocus: (shouldUseRestoreFocusRef ? afterThisRef : triggerRef)
                } : {
                  isDismissable: true
                }
              )
            }>
            <Heading>This</Heading>
            <Divider />
            {useRestoreFocusRef ? (
              <>
                <Content><Text>Press “Do that” button to open a secondary dialog, or “This” button to “Do this.”</Text></Content>
                <ButtonGroup>
                  <Button variant="secondary" onPress={() => setDialog('doThat')} autoFocus>Do that</Button>
                  <Button variant="secondary" onPress={dismiss}>Cancel</Button>
                  <Button variant="cta" onPress={() => setDialog(null)}>This</Button>
                </ButtonGroup>
              </>
            ) : (
              <Content>
                <ActionButton onPress={() => setDialog('doThat')} autoFocus>Do that</ActionButton>
              </Content>
            )}
          </Dialog>
        }
        {dialog === 'doThat' &&
          <Dialog
            onDismiss={dismiss}
            {
              ...(
                useRestoreFocusRef ?
                {
                  restoreFocus: (shouldUseRestoreFocusRef ? afterThatRef : triggerRef)
                } : {
                  isDismissable: true
                }
              )
            }>
            <Heading>That</Heading>
            <Divider />
            {useRestoreFocusRef ? (
              <>
                <Content><Text>Press “Do this” button to open a secondary dialog, or “That” button to “Do that.”</Text></Content>
                <ButtonGroup>
                  <Button variant="secondary" onPress={() => setDialog('doThis')} autoFocus>Do this</Button>
                  <Button variant="secondary" onPress={dismiss}>Cancel</Button>
                  <Button variant="cta" onPress={() => setDialog(null)}>That</Button>
                </ButtonGroup>
              </>
            ) : (
              <Content>
                <ActionButton onPress={() => setDialog('doThis')} autoFocus>Do this</ActionButton>
              </Content>
            )}
          </Dialog>
        }
      </DialogContainer>
    </>
  );
}
