import {action} from '@storybook/addon-actions';
import Bell from '../src/Icon/Bell';
import Brush from '../src/Icon/Brush';
import Button from '../src/Button';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Button', module)
  .add(
    'variant: cta',
    () => render({variant: 'cta'})
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary'})
  )
  .add(
    'variant: warning',
    () => render({variant: 'warning'})
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    )
  )
  .add(
    'variant: action',
    () => renderSelected({variant: 'action'})
  )
  .add(
    'variant: action with holdAffordance',
    () => renderSelected({variant: 'action', holdAffordance: true, onLongClick: action('longClick')})
  )
  .add(
    'variant: tool',
    () => renderSelected({variant: 'tool', label: null, icon: <Brush />})
  )
  .add(
    'variant: tool with holdAffordance',
    () => renderSelected({variant: 'tool', label: null, icon: <Brush />, holdAffordance: true, onLongClick: action('longClick')})
  )
  .add(
    'variant: action icon only',
    () => renderSelected({variant: 'action', label: null, icon: <Bell />})
  )
  .add(
    'logic variant: and',
    () => render({logic: true, variant: 'and', label: 'and'})
  )
  .add(
    'logic variant: or',
    () => render({logic: true, variant: 'or', label: 'or'})
  )
  .add(
    'quiet: true, variant: primary',
    () => render({quiet: true, variant: 'primary'})
  )
 .add(
    'quiet: true, variant: secondary',
    () => render({quiet: true, variant: 'secondary'})
  )
 .add(
    'quiet: true, variant: warning',
    () => render({quiet: true, variant: 'warning'})
  )
  .add(
    'quiet: true, variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({quiet: true, variant: 'overBackground'})}
      </div>
    )
  )
 .add(
    'quiet: true, variant: action',
    () => renderSelected({quiet: true, variant: 'action'})
  )
 .add(
    'quiet: true, variant: action icon only',
    () => renderSelected({quiet: true, variant: 'action', label: null, icon: <Bell />})
  )
  .add(
    'icon: bell',
    () => render({icon: <Bell />, variant: 'primary'})
  )
  .add(
    'selected: true',
    () => render({selected: true, variant: 'primary'})
  )
  .add(
    'element: a',
    () => render({element: 'a', href: 'http://example.com'})
  )
  .add(
    'shift focus on mouseDown',
    () => renderShiftFocusOnMouseDown({variant: 'secondary'}),
    {info: 'In Safari, buttons don\'t receive focus following mousedown/mouseup events. React-spectrum provides a workaround for this issue so that components like the ButtonGroup will be navigable using the keyboard after receiving focus with the mouse. This story tests whether it is still possible to shift focus on mousedown without using preventDefault to prevent focus from being reclaimed by the button being clicked.'}
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
        onClick={action('click', {depth: 0})}
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
