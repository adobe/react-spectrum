import {action, storiesOf} from '@storybook/react';
import Button from '../src/Button';
import Datepicker from '../src/Datepicker';
import Dialog from '../src/Dialog';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('ModalTrigger', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'with onConfirm',
    () => render({onConfirm: action('confirm')}),
    {inline: true}
  )
  .addWithInfo(
    'with onConfirm () => false',
    () => render({onConfirm: () => false}),
    {inline: true}
  )
  .addWithInfo(
    'with nested Popover',
    () => renderNested(),
    {inline: true}
  )
  .addWithInfo(
     'with dynamic updates',
    () => renderDynamic(),
    {inline: true}
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


