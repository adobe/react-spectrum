import {ActionButton, Button} from '@react-spectrum/button';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '../';
import isChromatic from 'storybook-chromatic/isChromatic';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text} from '@react-spectrum/typography';
import {Divider} from '@react-spectrum/divider';

storiesOf('DialogTrigger', module)
  // DialogTrigger isn't affected by color scheme, so only visual test light, and ensure animations work properly.
  .addParameters({chromaticProvider: {colorSchemes: ['light']}, chromatic: {pauseAnimationAtEnd: true}})
  .add(
    'default',
    () => render({}),
    {chromaticProvider: {scales: ['medium'], height: 1000}} // modals overlap if multiple are open at the same time
  )
  .add(
    'type: popover',
    () => render({type: 'popover'})
  )
  .add(
    'type: modal',
    () => render({type: 'modal'}),
    {chromaticProvider: {scales: ['medium'], height: 1000}}
  )
  .add(
    'type: tray',
    () => render({type: 'tray'}),
    {chromaticProvider: {scales: ['medium'], height: 1000}}
  )
  .add(
    'popover with mobileType: modal',
    () => render({type: 'popover', mobileType: 'modal'}),
    {chromaticProvider: {scales: ['medium'], height: 1000}, chromatic: {viewports: [350]}}
  )
  .add(
    'popover with mobileType: tray',
    () => render({type: 'popover', mobileType: 'tray'}),
    {chromaticProvider: {scales: ['medium'], height: 1000}, chromatic: {viewports: [350]}}
  )
  .add(
    'nested modals',
    () => (
      <div style={{paddingTop: 100}}>
        <input />
        <Provider colorScheme="dark" UNSAFE_style={{padding: 40, marginTop: 10}}>
          <DialogTrigger>
            <ActionButton>Trigger</ActionButton>
            <Dialog>
              <input />
              <input />
              <DialogTrigger>
                <ActionButton>Trigger</ActionButton>
                <Dialog>
                  <input />
                  <input />
                </Dialog>
              </DialogTrigger>
            </Dialog>
          </DialogTrigger>
        </Provider>
      </div>
    ),
    {chromatic: {disable: true}}
  )
  .add(
    'nested popovers',
    () => (
      <div style={{paddingTop: 100}}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>
            <input />
            <input />
            <DialogTrigger type="popover">
              <ActionButton>Trigger</ActionButton>
              <Dialog>Hi!</Dialog>
            </DialogTrigger>
          </Dialog>
        </DialogTrigger>
      </div>
    ),
    {chromatic: {disable: true}}
  )
  .add(
    'popover inside scroll view',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto'}}>
          <div style={{height: 200}}>
            <DialogTrigger type="popover">
              <ActionButton>Trigger</ActionButton>
              <Dialog>
                <input />
                <input />
              </Dialog>
            </DialogTrigger>
          </div>
        </div>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1}}>
          <div style={{height: 200}}>
            other
          </div>
        </div>
      </div>
    ),
    {chromatic: {disable: true}}
  )
  .add(
    'placement="left"',
    () => render({type: 'popover', placement: 'left'})
  )
  .add(
    'placement="left top"',
    () => render({type: 'popover', placement: 'left top'})
  )
  .add(
    'placement="left bottom"',
    () => render({type: 'popover', placement: 'left bottom'})
  )
  .add(
    'placement="right"',
    () => render({type: 'popover', placement: 'right'})
  )
  .add(
    'placement="right top"',
    () => render({type: 'popover', placement: 'right top'})
  )
  .add(
    'placement="right bottom"',
    () => render({type: 'popover', placement: 'right bottom'})
  )
  .add(
    'placement="bottom"',
    () => render({type: 'popover', placement: 'bottom'})
  )
  .add(
    'placement="bottom left"',
    () => render({type: 'popover', placement: 'bottom left'})
  )
  .add(
    'placement="bottom right"',
    () => render({type: 'popover', placement: 'bottom right'})
  )
  .add(
    'placement="top"',
    () => render({type: 'popover', placement: 'top'})
  )
  .add(
    'placement="top left"',
    () => render({type: 'popover', placement: 'top left'})
  )
  .add(
    'placement="top right"',
    () => render({type: 'popover', placement: 'top right'})
  )
  .add(
    'offset',
    () => render({type: 'popover', offset: 50})
  )
  .add(
    'crossOffset',
    () => render({type: 'popover', crossOffset: 50})
  )
  .add(
    'shouldFlip: true',
    () => render({type: 'popover', placement: 'left', shouldFlip: true, width: 'calc(100vh - 100px)'})
  )
  .add(
    'shouldFlip: false',
    () => render({type: 'popover', placement: 'left', shouldFlip: false, width: 'calc(100vh - 100px)'})
  )
  .add(
    'containerPadding',
    () => render({type: 'popover', placement: 'bottom', width: 'calc(100vh - 100px)', containerPadding: 20})
  );

function render({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger {...props} defaultOpen={isChromatic()}>
        <ActionButton>Trigger</ActionButton>
        <Dialog>
          <Header><Text slot="title">The Title</Text></Header>
          <Divider size="M" />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
          <Footer><Button variant="secondary">Cancel</Button><Button variant="cta">Confirm</Button></Footer>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
