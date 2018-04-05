import ComboBox from '../src/ComboBox';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {storiesOf} from '@storybook/react';
import Textfield from '../src/Textfield';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('FieldLabel', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({label: 'React'}),
    {inline: true}
  )
  .addWithInfo(
    'labelFor: foo',
    () => (
      <FieldLabel label="React" labelFor="foo">
        <Textfield placeholder="React" id="foo" />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'labelFor ComboBox',
    () => (
      <FieldLabel label="React" labelFor="bar">
        <ComboBox options={['Chocolate', 'Vanilla', 'Strawberry']} placeholder="Combo Box" id="bar" />
      </FieldLabel>
    ),
    {inline: true}
  )
  .addWithInfo(
    'position: left',
    () => render({label: 'React', position: 'left'}),
    {inline: true}
  )
  .addWithInfo(
    'label only',
    () => (
      <div>
        <FieldLabel label="React" labelFor="test" />
        <Textfield placeholder="React" id="test" />
      </div>
    )
  );

function render(props = {}) {
  return (<FieldLabel {...props}><Textfield placeholder="React" /></FieldLabel>);
}
