import {action, storiesOf} from '@storybook/react';
import Bell from '../src/Icon/Bell';
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Button', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'variant: cta',
    () => render({variant: 'cta'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: primary',
    () => render({variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: secondary',
    () => render({variant: 'secondary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: warning',
    () => render({variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    ),
    {inline: true}
  )
  .addWithInfo(
    'variant: action',
    () => renderSelected({variant: 'action'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: action with holdAffordance',
    () => renderSelected({variant: 'action', holdAffordance: true, onLongClick: action('longClick')}),
    {inline: true}
  )
  .addWithInfo(
    'variant: tool',
    () => renderSelected({variant: 'tool', label: null, icon: <Brush />}),
    {inline: true}
  )
  .addWithInfo(
    'variant: tool with holdAffordance',
    () => renderSelected({variant: 'tool', label: null, icon: <Brush />, holdAffordance: true, onLongClick: action('longClick')}),
    {inline: true}
  )
  .addWithInfo(
    'variant: action icon only',
    () => renderSelected({variant: 'action', label: null, icon: <Bell />}),
    {inline: true}
  )
  .addWithInfo(
    'logic variant: and',
    () => render({logic: true, variant: 'and', label: 'and'}),
    {inline: true}
  )
  .addWithInfo(
    'logic variant: or',
    () => render({logic: true, variant: 'or', label: 'or'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, variant: primary',
    () => render({quiet: true, variant: 'primary'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: secondary',
    () => render({quiet: true, variant: 'secondary'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: warning',
    () => render({quiet: true, variant: 'warning'}),
    {inline: true}
  )
  .addWithInfo(
    'quiet: true, variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({quiet: true, variant: 'overBackground'})}
      </div>
    ),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: action',
    () => renderSelected({quiet: true, variant: 'action'}),
    {inline: true}
  )
 .addWithInfo(
    'quiet: true, variant: action icon only',
    () => renderSelected({quiet: true, variant: 'action', label: null, icon: <Bell />}),
    {inline: true}
  )
  .addWithInfo(
    'icon: bell',
    () => render({icon: <Bell />, variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'selected: true',
    () => render({selected: true, variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'element: a',
    () => render({element: 'a', href: 'http://example.com'}),
    {inline: true}
  )
  .addWithInfo(
    'shift focus on mouseDown',
    'In Safari, buttons don\'t receive focus following mousedown/mouseup events. React-spectrum provides a workaround for this issue so that components like the ButtonGroup will be navigable using the keyboard after receiving focus with the mouse. This story tests whether it is still possible to shift focus on mousedown without using preventDefault to prevent focus from being reclaimed by the button being clicked.',
    () => renderShiftFocusOnMouseDown({variant: 'secondary'}),
    {inline: true}
  );

function renderSelected(props = {}) {
  return (
    <div>
      <Button
        label="React"
        onClick={action('click')}
        {...props} />
      <Button
        label="React"
        onClick={action('click')}
        selected
        {...props} />
      <Button
        label="React"
        onClick={action('click')}
        disabled
        {...props} />
    </div>
  );
}

function render(props = {}) {
  return (
    <div>
      <Button
        label="React"
        onClick={action('click')}
        {...props} />
      <Button
        label="React"
        onClick={action('click')}
        disabled
        {...props} />
    </div>
  );
}

function renderShiftFocusOnMouseDown(props = {}) {
  const buttons = [];
  return (
    <div>
      <Button
        label="Focus next button"
        ref={b => buttons.push(b)}
        onMouseDown={e => {e.preventDefault(); buttons[1].focus();}}
        onClick={action('click')}
        {...props} />
      <Button
        label="Focus previous button"
        ref={b => buttons.push(b)}
        onMouseDown={e => {e.preventDefault(); buttons[0].focus();}}
        onClick={action('click')}
        {...props} />
      <Button
        label="preventDefault"
        ref={b => buttons.push(b)}
        onMouseDown={e => e.preventDefault()}
        onClick={action('click')}
        {...props} />
    </div>
  );
}
