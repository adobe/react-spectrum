import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import {Menu} from '../';
import {MenuTrigger} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('MenuTrigger', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'align="end"',
    () => render({align: 'end'})
  )
  .add(
    'direction="top"',
    () => render({direction: 'top'})
  )
  .add(
    'shouldFlip',
    () => render({shouldFlip: true})
  )
  .add(
    'isOpen',
    () => render({isOpen: true})
  )
  .add(
    'defaultOpen',
    () => render({defaultOpen: true})
  )
  .add(
    'trigger="longPress" TODO out of scope',
    () => render()
  )
  .add(
    'menu+submenus TODO out of scope',
    () => render()
  )
  .add(
    'popup with role=listbox',
    () => render({}, {role: 'listbox'})
  )
  .add(
    'menu closes on scroll',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto'}}>
          <div style={{height: 200}}>
            <MenuTrigger onOpenChange={action('onOpenChange')} defaultOpen>
              <Button
                onKeyDown={action('onKeyDown')}
                onPress={action('press')}
                onPressStart={action('pressstart')}
                onPressEnd={action('pressend')}>
                  Menu Button
              </Button>
              <Menu>
                <li>MenuItem1111111111111111</li>
                <li>MenuItem22222222222222222</li>
                <li>MenuItem33333333333333333</li>
              </Menu>
            </MenuTrigger>
          </div>
        </div>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1}}>
          <div style={{height: 200}}>
            other
          </div>
        </div>
      </div>
    )
  );
  
function render(props = {}, menuProps = {}) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
        <Button
          onKeyDown={action('onKeyDown')}
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
            Menu Button
        </Button>
        <Menu {...menuProps}>
          <li>MenuItem1111111111111111</li>
          <li>MenuItem22222222222222222</li>
          <li>MenuItem33333333333333333</li>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
