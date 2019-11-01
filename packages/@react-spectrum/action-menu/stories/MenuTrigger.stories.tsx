import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import {MenuTrigger, MenuTriggerProps} from '../';
import {Popover} from '@react-spectrum/overlays';
import React from 'react';
import {storiesOf} from '@storybook/react';

import {Menu} from '../';

storiesOf('MenuTrigger', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'align="start"',
    // () => render({align: 'start'})
    () => render({align: 'left'})
  )
  .add(
    'align="end"',
    // () => render({align: 'end'})
    () => render({align: 'right'})
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
    'multiple menus',
    () => (
      <div>
        <MenuTrigger onToggle={action('toggle')}>
          <Button
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button #1
          </Button>
          <Popover>
            <div>Hi</div>
          </Popover>
        </MenuTrigger>
        <MenuTrigger onToggle={action('toggle')}>
          <Button
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button #2
          </Button>
          <Popover>
            <div>Hi2</div>
          </Popover>
        </MenuTrigger>
      </div>
    )
  )
  .add(
    'menu+submenus TODO out of scope',
    () => render()
  )
  .add(
    'popup with role=list',
    () => (
      <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')} onSelect={action('select')}>
          <Button
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button
          </Button>
          <Menu role="listbox">
            <li><span>ewagawg</span></li>
            <li>galwengklwnealkgnlk</li>
            <li>gawenglkawengklawengk</li>
          </Menu>
        </MenuTrigger>
      </div>
    )
  )
  .add(
    'menu closes on scroll',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto'}}>
          <div style={{height: 200}}>
            <MenuTrigger onOpenChange={action('onOpenChange')} onSelect={action('select')}>
            <Button
              onPress={action('press')}
              onPressStart={action('pressstart')}
              onPressEnd={action('pressend')}>
                Menu Button
            </Button>
            <Menu role="list">
              <li><span>ewagawg</span></li>
              <li>galwengklwnealkgnlk</li>
              <li>gawenglkawengklawengk</li>
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
  )
  

function render(props:MenuTriggerProps = {}) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <MenuTrigger onOpenChange={action('onOpenChange')} onSelect={action('select')} {...props}>
        <Button
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
            Menu Button
        </Button>
        <Menu>
          <li><span>ewagawg</span></li>
          <li>galwengklwnealkgnlk</li>
          <li>gawenglkawengklawengk</li>
        </Menu>
      </MenuTrigger>
    </div>
  );
}
