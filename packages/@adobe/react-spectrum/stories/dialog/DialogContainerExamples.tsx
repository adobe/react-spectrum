import {ActionButton} from '../../src/button/ActionButton';
import {Button} from '../../src/button/Button';
import {ButtonGroup} from '../../src/buttongroup/ButtonGroup';
import {Content} from '../../src/view/Content';
import {Dialog, SpectrumDialogProps} from '../../src/dialog/Dialog';
import {DialogContainer, SpectrumDialogContainerProps} from '../../src/dialog/DialogContainer';
import {Divider} from '../../src/divider/Divider';
import {Header} from '../../src/view/Header';
import {Heading} from '../../src/text/Heading';
import {Item} from 'react-stately/Item';
import {Key} from '@react-types/shared';
import {Menu} from '../../src/menu/Menu';
import {MenuTrigger} from '../../src/menu/MenuTrigger';
import React, {JSX} from 'react';
import {Text} from '../../src/text/Text';
import {useDialogContainer} from '../../src/dialog/useDialogContainer';

export function DialogContainerExample(
  props: Omit<SpectrumDialogContainerProps, 'children' | 'onDismiss'> &
    Omit<SpectrumDialogProps, 'children'>
): JSX.Element {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <>
      <ActionButton onPress={() => setOpen(true)}>Open dialog</ActionButton>
      <DialogContainer {...props} onDismiss={() => setOpen(false)}>
        {isOpen && <ExampleDialog {...props} />}
      </DialogContainer>
    </>
  );
}

export function MenuExample(
  props: Omit<SpectrumDialogContainerProps, 'children' | 'onDismiss'> &
    Omit<SpectrumDialogProps, 'children'>
): JSX.Element {
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
        {isOpen && <ExampleDialog {...props} />}
      </DialogContainer>
    </>
  );
}

function ExampleDialog(
  props: Omit<SpectrumDialogContainerProps, 'children' | 'onDismiss'> &
    Omit<SpectrumDialogProps, 'children'>
): JSX.Element {
  let container = useDialogContainer();

  return (
    <Dialog>
      <Heading>The Heading</Heading>
      <Header>The Header</Header>
      <Divider />
      <Content>
        <Text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus.
          In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes,
          nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et
          quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere
          a. Nunc vestibulum sapien pellentesque lectus commodo ornare.
        </Text>
      </Content>
      {!props.isDismissable && (
        <ButtonGroup>
          <Button variant="secondary" onPress={container.dismiss}>
            Cancel
          </Button>
          <Button variant="cta" onPress={container.dismiss}>
            Confirm
          </Button>
        </ButtonGroup>
      )}
    </Dialog>
  );
}

export function NestedDialogContainerExample(): JSX.Element {
  let [dialog, setDialog] = React.useState<Key | null>(null);
  let dismiss = () => setDialog(null);

  return (
    <>
      <MenuTrigger>
        <ActionButton aria-label="Actions">Open menu</ActionButton>
        <Menu onAction={setDialog}>
          <Item key="doThis">Do this…</Item>
          <Item key="doThat">Do that…</Item>
        </Menu>
      </MenuTrigger>
      <DialogContainer onDismiss={dismiss}>
        {dialog !== null && (
          <Dialog onDismiss={dismiss} isDismissable>
            <Heading>{dialog === 'doThis' ? 'This' : 'That'}</Heading>
            <Divider />
            <Content>
              <ActionButton
                onPress={() => setDialog(dialog === 'doThis' ? 'doThat' : 'doThis')}
                autoFocus>
                {dialog === 'doThis' ? 'Do that' : 'Do this'}
              </ActionButton>
            </Content>
          </Dialog>
        )}
      </DialogContainer>
    </>
  );
}
