import {ActionButton} from '@react-spectrum/button';
import {Dialog, DialogTrigger} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('DialogTrigger', module)
  .add(
    'default',
    () => render({})
  )
  .add(
    'type: popover',
    () => render({type: 'popover'})
  )
  .add(
    'type: modal',
    () => render({type: 'modal'})
  )
  .add(
    'type: tray',
    () => render({type: 'tray'})
  )
  .add(
    'popover with mobileType: modal',
    () => render({type: 'popover', mobileType: 'modal'})
  )
  .add(
    'popover with mobileType: tray',
    () => render({type: 'popover', mobileType: 'tray'})
  )
  .add(
    'nested modals',
    () => (
      <div style={{paddingTop: 100}}>
        <input />
        <Provider colorScheme="dark" style={{padding: 40, marginTop: 10}}>
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
    )
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
    )
  )
  .add(
    'popover inside scroll view',
    () => (
      <div style={{height: 100, display: 'flex'}}>
        <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1}}>
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
    )
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
    <div style={{display: 'flex', width}}>
      <DialogTrigger {...props}>
        <ActionButton>Trigger</ActionButton>
        <Dialog>
          Contents
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
