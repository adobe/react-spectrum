import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames} from '@react-spectrum/utils';
import {Item, Menu, MenuTrigger, Section} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from '@adobe/spectrum-css-temp/components/splitbutton/vars.css';

let withSection = [
  {name: 'Animals', children: [
    {name: 'Aardvark'},
    {name: 'Kangaroo'},
    {name: 'Snake'}
  ]},
  {name: 'People', children: [
    {name: 'Danni'},
    {name: 'Devon'},
    {name: 'Ross', children: [
      {name: 'Tests', children: [
        {name: 'blah'}
      ]}
    ]}
  ]}
];

storiesOf('MenuTrigger', module)
  .add(
    'default',
    () => render()
  )
  .add(
    'single selected key',
    () => render({}, {selectedKeys: ['Kangaroo']})
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
            <MenuTrigger onSelect={action('onSelect')} onOpenChange={action('onOpenChange')} defaultOpen>
              <ActionButton
                onPress={action('press')}
                onPressStart={action('pressstart')}
                onPressEnd={action('pressend')}>
                  Menu Button
              </ActionButton>
              <Menu items={withSection} itemKey="name">
                {item => (
                  <Section items={item.children} title={item.name}>
                    {item => <Item childItems={item.children}>{item.name}</Item>}
                  </Section>
                )}
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
          variant="primary"
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
            variant="primary"
            onPress={action('press 2')}
            onPressStart={action('pressstart 2')}
            onPressEnd={action('pressend 2')}
            UNSAFE_className={classNames(
              styles,
              'spectrum-SplitButton-trigger'
            )}>
            <ChevronDownMedium />
          </Button>
          <Menu items={withSection} itemKey="name">
            {item => (
              <Section items={item.children} title={item.name}>
                {item => <Item childItems={item.children}>{item.name}</Item>}
              </Section>
            )}
          </Menu>
        </MenuTrigger>
      </div>
    )
  );

function render(props = {}, menuProps = {}) {
  return (
    <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
      <MenuTrigger onSelect={action('onSelect')} onOpenChange={action('onOpenChange')} {...props}>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
            Menu Button
        </ActionButton>
        <Menu items={withSection} itemKey="name" {...menuProps}>
          {item => (
            <Section items={item.children} title={item.name}>
              {item => <Item childItems={item.children}>{item.name}</Item>}
            </Section>
          )}
        </Menu>
      </MenuTrigger>
    </div>
  );
}
