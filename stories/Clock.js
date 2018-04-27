import {action, storiesOf} from '@storybook/react';
import Clock from '../src/Clock';
import createId from '../src/utils/createId';
import FieldLabel from '../src/FieldLabel';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

const clockId = createId();

storiesOf('Clock', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({value: 'today', 'aria-label': 'Start time'}),
    {inline: true}
  )
  .addWithInfo(
    'uncontrolled',
    () => render({defaultValue: 'today', 'aria-label': 'Start time'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet=true',
    () => render({quiet: true, 'aria-label': 'Start time'}),
    {inline: true}
  )
  .addWithInfo(
    'Using aria-labelledby',
    () => render({value: 'today', id: clockId, 'aria-labelledby': clockId + '-label', labelText: 'Start time'}),
    {inline: true}
  );

function renderClock(props = {}) {
  delete props.labelText;
  return (
    <Clock
      onChange={action('change')}
      {...props} />
  );
}

function render(props = {}) {
  return (<div>
    {props.labelText &&
      (<div>
        <FieldLabel label={props.labelText} id={props['aria-labelledby']} labelFor={props.id} />
        {renderClock(props)}
      </div>) ||
      renderClock(props)
    }</div>);
}
