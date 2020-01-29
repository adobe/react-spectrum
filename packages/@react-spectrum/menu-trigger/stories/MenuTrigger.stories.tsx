import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import AlignCenter from '@spectrum-icons/workflow/AlignCenter';
import AlignLeft from '@spectrum-icons/workflow/AlignLeft';
import AlignRight from '@spectrum-icons/workflow/AlignRight';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {classNames} from '@react-spectrum/utils';
import Copy from '@spectrum-icons/workflow/Copy';
import Cut from '@spectrum-icons/workflow/Cut';
import {Item, Menu, MenuTrigger, Section} from '../';
import {Keyboard, Text} from '@react-spectrum/typography';
import Paste from '@spectrum-icons/workflow/Paste';
import React from 'react';
import {storiesOf} from '@storybook/react';
import styles from '@adobe/spectrum-css-temp/components/splitbutton/vars.css';
import {Switch} from '@react-spectrum/switch';

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
    'single selected key (controlled)',
    () => render({}, {selectedKeys: ['Kangaroo']})
  )
  .add(
    'single default selected key (uncontrolled)',
    () => render({}, {defaultSelectedKeys: ['Kangaroo']})
  )
  .add(
    'multiple selected key (controlled)',
    () => render({}, {selectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'})
  )
  .add(
    'multiple default selected key (uncontrolled)',
    () => render({}, {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple'})
  )
  .add(
    'autofocus=false',
    () => render({}, {defaultSelectedKeys: ['Kangaroo', 'Devon'], selectionMode: 'multiple', autoFocus: false})
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
    'isDisabled',
    () => render({isDisabled: true})
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
    'menu with role=listbox',
    () => render({}, {role: 'listbox'})
  )
  .add(
    'multiselect menu',
    () => render({}, {selectionMode: 'multiple'})
  )
  .add(
    'no selection allowed menu',
    () => render({}, {selectionMode: 'none'})
  )
  .add(
    'closeOnSelect=false',
    () => render({closeOnSelect: false}, {})
  )
  .add(
    'menu with semantic elements',
    () => (
      <div style={{display: 'flex', width: 'auto', margin: '250px 0'}}>
        <MenuTrigger onOpenChange={action('onOpenChange')}>
          <ActionButton
            onPress={action('press')}
            onPressStart={action('pressstart')}
            onPressEnd={action('pressend')}>
              Menu Button
          </ActionButton>
          <Menu onSelectionChange={action('onSelectionChange')}>
            <Section title="Section 1">
              <Item>
                <Copy size="S" />
                <Text slot="label">Copy</Text>
                <Keyboard slot="keyboardIcon">⌘C</Keyboard>
              </Item>
              <Item>
                <Cut size="S" />
                <Text slot="label">Cut</Text>
                <Keyboard slot="keyboardIcon">⌘X</Keyboard>
              </Item>
              <Item>
                <Paste size="S" />
                <Text slot="label">Paste</Text>
                <Keyboard slot="keyboardIcon">⌘V</Keyboard>
              </Item>
            </Section>
            <Section title="Section 2">
              <Item>
                <AlignLeft size="S" />
                <Text slot="label">Puppy</Text>
                <Text slot="description">awea</Text>
              </Item>
              <Item>
                <AlignCenter size="S" />
                <Text slot="label">Doggo</Text>
              </Item>
              <Item>
                <AlignRight size="S" />
                <Text slot="label">Floof</Text>
              </Item>
              <Item>
                blah
              </Item>
            </Section>
          </Menu>
        </MenuTrigger>
      </div>
    )
  )
  .add(
    'menu closes on scroll',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', background: 'antiquewhite'}}>
          <div style={{height: 200}}>
            <div>Scrolling here will close the Menu</div>
            <MenuTrigger onOpenChange={action('onOpenChange')} defaultOpen>
              <ActionButton
                onPress={action('press')}
                onPressStart={action('pressstart')}
                onPressEnd={action('pressend')}>
                  Menu Button
              </ActionButton>
              <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
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
          <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')}>
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
      <MenuTrigger onOpenChange={action('onOpenChange')} {...props}>
        <ActionButton
          onPress={action('press')}
          onPressStart={action('pressstart')}
          onPressEnd={action('pressend')}>
            Menu Button
        </ActionButton>
        <Menu items={withSection} itemKey="name" onSelectionChange={action('onSelectionChange')} disabledKeys={['Snake', 'Ross']} {...menuProps}>
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
