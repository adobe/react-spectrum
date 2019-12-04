import {action} from '@storybook/addon-actions';
import {Button} from '@react-spectrum/button';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames} from '@react-spectrum/utils';
import {Menu} from '../';
import {MenuTrigger} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from '@adobe/spectrum-css-temp/components/splitbutton/vars.css';

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
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', background: 'antiquewhite'}}>
          <div style={{height: 200}}>
            <div>Scrolling here will close the Menu</div>
            <MenuTrigger onOpenChange={action('onOpenChange')} defaultOpen>
              <Button
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
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1, background: 'grey'}}>
          <div style={{height: 200}}>
            Scrolling here won't close the Menu
          </div>
        </div>
      </div>
    )
  )
  .add(
    'more than 2 children (split button)',
    () => (
      <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
        <Button
          onPress={action('press 1')}
          onPressStart={action('pressstart 1')}
          onPressEnd={action('pressend 1')}
          UNSAFE_className={classNames(
            styles,
            'spectrum-SplitButton-action'
          )}>
          Hi
        </Button>
        <MenuTrigger onOpenChange={action('onOpenChange')}>
          <Button
            onPress={action('press 2')}
            onPressStart={action('pressstart 2')}
            onPressEnd={action('pressend 2')}
            UNSAFE_className={classNames(
              styles,
              'spectrum-SplitButton-trigger'
            )}>
            <ChevronDownMedium />
          </Button>
          <Menu>
            <li>MenuItem1111111111111111</li>
            <li>MenuItem22222222222222222</li>
            <li>MenuItem33333333333333333</li>
          </Menu>
        </MenuTrigger>
      </div>
    )
  );
  
function render(props = {}, menuProps = {}) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
      <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
        <Button
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
