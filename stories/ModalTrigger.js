import {action} from '@storybook/addon-actions';
import Button from '../src/Button';
import Datepicker from '../src/Datepicker';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('ModalTrigger', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'with onConfirm',
    () => render({onConfirm: action('confirm'), onCancel: action('cancel')})
  )
  .add(
    'with onConfirm () => false',
    () => render({onConfirm: () => false, onCancel: action('cancel')})
  )
  .add(
    'with nested Popover',
    () => renderNested()
  )
  .add(
     'with dynamic updates',
    () => renderDynamic()
  )
  .add(
     'disableEscKey:true',
    () => render({disableEscKey: true, autoFocusButton: 'confirm', title: 'Requires Confirmation'})
  )
  .add(
    'backdropClickable: true',
   () => render({backdropClickable: true})
  )
  .add(
    'lifecycle methods',
    () => render({
      onConfirm: action('confirm'),
      onCancel: action('cancel'),
      onShow: action('show'),
      onEnter: action('enter'),
      onEntering: action('entering'),
      onEntered: action('entered'),
      onExit: action('exit'),
      onExiting: action('exiting'),
      onExited: action('exited'),
      onHide: action('hide'),
      onClose: action('close'),
      onEscapeKeyDown: action('escapeKeyDown'),
      onBackdropClick: action('backdropClick')
    }),
    {info: 'Modal supports [react-overlay](https://react-bootstrap.github.io/react-overlays/#modals) lifecycle methods for Modals as props on the Dialog.'}
  );


const render = (props = {}) => (
  <ModalTrigger>
    <Button label="Click Me" variant="primary" modalTrigger />
    <Dialog
      modalContent
      title="The title"
      confirmLabel="Do it"
      size="S"
      cancelLabel={props.disableEscKey ? null : 'close'}
      {...props}>
      <span>the modal dialog content goes here</span>
    </Dialog>
  </ModalTrigger>
);

const renderNested = (props = {}) => (
  <ModalTrigger>
    <Button label="Click Me" variant="primary" modalTrigger />
    <Dialog
      modalContent
      title="The title"
      confirmLabel="Do it"
      size="S"
      cancelLabel="close"
      {...props}>
      <Datepicker
        type="time"
        placeholder="Choose a time"
        autoFocus />
    </Dialog>
  </ModalTrigger>
);

class DynamicDialog extends React.Component {
  constructor() {
    super();
    this.state = {
      counter: 1
    };
  }

  render() {
    return (
      <Dialog
        modalContent
        title={`Title ${this.state.counter}`}
        confirmLabel="Do It"
        size="S"
        cancelLabel="close"
        {...this.props}>
        <Button
          label="Update Title"
          variant="cta"
          onClick={_ => {
            this.setState({counter: this.state.counter + 1});
          }} />
      </Dialog>
    );
  }
}

const renderDynamic = (props = {}) => (
  <ModalTrigger>
    <Button
      label="Click Me"
      variant="primary"
      modalTrigger />
    <DynamicDialog backdropClickable />
  </ModalTrigger>
);
