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
    () => render({align: 'start'})
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
    'multiple menus',
    () => (
      <div>
        <MenuTrigger onOpenChange={action('onOpenChange')} onSelect={action('select')}>
          <Button
            onKeyDown={action('onKeyDown')}
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button #1
          </Button>
          <Menu>
            <li><span>hi</span></li>
            <li>hi2</li>
            <li>hi3</li>
          </Menu>
        </MenuTrigger>
        <MenuTrigger onOpenChange={action('onOpenChange')}>
          <Button
            onKeyDown={action('onKeyDown')}
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button #2
          </Button>
          <Menu>
            <li><span>bye</span></li>
            <li>bye2</li>
            <li>bye3</li>
          </Menu>
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
            onKeyDown={action('onKeyDown')}
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
              onKeyDown={action('onKeyDown')}
              onPress={action('press')}
              onPressStart={action('pressstart')}
              onPressEnd={action('pressend')}>
                Menu Button
            </Button>
            <Menu role="menu">
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
          onKeyDown={action('onKeyDown')}
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
