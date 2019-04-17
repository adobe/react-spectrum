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
    () => render({onConfirm: action('confirm')})
  )
  .add(
    'with onConfirm () => false',
    () => render({onConfirm: () => false})
  )
  .add(
    'with nested Popover',
    () => renderNested()
  )
  .add(
     'with dynamic updates',
    () => renderDynamic()
  );


const render = (props = {}) => (
  <ModalTrigger>
    <Button label="Click Me" variant="primary" modalTrigger />
    <Dialog
      modalContent
      title="The title"
      confirmLabel="Do it"
      size="S"
      cancelLabel="close"
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


