/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {action} from '@storybook/addon-actions';
import {ActionButton, Button} from '@react-spectrum/button';
import {AlertDialog, Dialog, DialogTrigger} from '../';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {chain} from '@react-aria/utils';
import {Content, Header} from '@react-spectrum/view';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Heading, Text} from '@react-spectrum/text';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {Provider} from '@react-spectrum/provider';
import React from 'react';

export default {
  title: 'DialogTrigger',

  parameters: {
    providerSwitcher: {status: 'notice'}
  }
};

export const Default = () => render({});

Default.story = {
  name: 'default'
};

export const TypePopover = () => renderPopover({type: 'popover'});

TypePopover.story = {
  name: 'type: popover'
};

export const TypeModal = () => render({type: 'modal'});

TypeModal.story = {
  name: 'type: modal'
};

export const TypeModalIsDismissable = () =>
  render({type: 'modal', isDismissable: true});

TypeModalIsDismissable.story = {
  name: 'type: modal isDismissable'
};

export const TypeFullscreen = () => render({type: 'fullscreen'});

TypeFullscreen.story = {
  name: 'type: fullscreen'
};

export const TypeFullscreenTakeover = () =>
  render({type: 'fullscreenTakeover'});

TypeFullscreenTakeover.story = {
  name: 'type: fullscreenTakeover'
};

export const TypeTray = () => renderPopover({type: 'tray'});

TypeTray.story = {
  name: 'type: tray'
};

export const MobileTypeFullscreen = () =>
  render({type: 'modal', mobileType: 'fullscreen'});

MobileTypeFullscreen.story = {
  name: 'mobileType: fullscreen'
};

export const MobileTypeFullscreenTakeover = () =>
  render({type: 'modal', mobileType: 'fullscreenTakeover'});

MobileTypeFullscreenTakeover.story = {
  name: 'mobileType: fullscreenTakeover'
};

export const PopoverWithMobileTypeModal = () =>
  renderPopover({type: 'popover', mobileType: 'modal'});

PopoverWithMobileTypeModal.story = {
  name: 'popover with mobileType: modal'
};

export const PopoverWithMobileTypeTray = () =>
  renderPopover({type: 'popover', mobileType: 'tray'});

PopoverWithMobileTypeTray.story = {
  name: 'popover with mobileType: tray'
};

export const NestedModals = () => (
  <div style={{paddingTop: 100}}>
    <input />
    <Provider colorScheme="dark" UNSAFE_style={{padding: 40, marginTop: 10}}>
      <DialogTrigger isDismissable>
        <ActionButton>Trigger</ActionButton>
        <Dialog>
          <Content>
            <input />
            <input />
            <DialogTrigger isDismissable>
              <ActionButton>Trigger</ActionButton>
              <Dialog>
                <Content>
                  <input />
                  <input />
                </Content>
              </Dialog>
            </DialogTrigger>
          </Content>
        </Dialog>
      </DialogTrigger>
    </Provider>
  </div>
);

NestedModals.story = {
  name: 'nested modals'
};

export const NestedModalsFullscreentakeover = () => (
  <DialogTrigger type="fullscreenTakeover">
    <ActionButton>Trigger</ActionButton>
    {(close) => (
      <Dialog>
        <Heading>The Heading</Heading>
        <Header>The Header</Header>
        <Divider />
        <Content>
          <DialogTrigger isDismissable>
            <ActionButton>Trigger</ActionButton>
            <Dialog>
              <Content>
                <input />
                <input />
              </Content>
            </Dialog>
          </DialogTrigger>
        </Content>
        <ButtonGroup>
          <Button variant="secondary" onPress={chain(close, action('cancel'))}>
            Cancel
          </Button>
          <Button variant="cta" onPress={chain(close, action('confirm'))}>
            Confirm
          </Button>
        </ButtonGroup>
      </Dialog>
    )}
  </DialogTrigger>
);

NestedModalsFullscreentakeover.story = {
  name: 'nested modals, fullscreentakeover'
};

export const WithMenuTrigger = () => (
  <DialogTrigger type="popover">
    <ActionButton>Trigger</ActionButton>
    <Dialog>
      <Heading>The Heading</Heading>
      <Content>
        <MenuTrigger>
          <ActionButton>Test</ActionButton>
          <Menu autoFocus="first">
            <Item>Item 1</Item>
            <Item>Item 2</Item>
            <Item>Item 3</Item>
          </Menu>
        </MenuTrigger>
      </Content>
    </Dialog>
  </DialogTrigger>
);

WithMenuTrigger.story = {
  name: 'with menu trigger'
};

export const NestedPopovers = () => (
  <div style={{paddingTop: 100}}>
    <DialogTrigger type="popover">
      <ActionButton>Trigger</ActionButton>
      <Dialog>
        <Content>
          <input />
          <input />
          <DialogTrigger type="popover">
            <ActionButton>Trigger</ActionButton>
            <Dialog>
              <Content>Hi!</Content>
            </Dialog>
          </DialogTrigger>
        </Content>
      </Dialog>
    </DialogTrigger>
  </div>
);

NestedPopovers.story = {
  name: 'nested popovers'
};

export const PopoverInsideScrollView = () => (
  <div style={{height: 100, display: 'flex'}}>
    <div style={{paddingTop: 100, height: 100, overflow: 'auto'}}>
      <div style={{height: 200}}>
        <DialogTrigger type="popover">
          <ActionButton>Trigger</ActionButton>
          <Dialog>
            <Content>
              <input />
              <input />
            </Content>
          </Dialog>
        </DialogTrigger>
      </div>
    </div>
    <div style={{paddingTop: 100, height: 100, overflow: 'auto', flex: 1}}>
      <div style={{height: 200}}>other</div>
    </div>
  </div>
);

PopoverInsideScrollView.story = {
  name: 'popover inside scroll view'
};

export const PlacementLeft = () =>
  renderPopover({type: 'popover', placement: 'left'});

PlacementLeft.story = {
  name: 'placement="left"'
};

export const PlacementLeftTop = () =>
  renderPopover({type: 'popover', placement: 'left top'});

PlacementLeftTop.story = {
  name: 'placement="left top"'
};

export const PlacementLeftBottom = () =>
  renderPopover({type: 'popover', placement: 'left bottom'});

PlacementLeftBottom.story = {
  name: 'placement="left bottom"'
};

export const PlacementRight = () =>
  renderPopover({type: 'popover', placement: 'right'});

PlacementRight.story = {
  name: 'placement="right"'
};

export const PlacementRightTop = () =>
  renderPopover({type: 'popover', placement: 'right top'});

PlacementRightTop.story = {
  name: 'placement="right top"'
};

export const PlacementRightBottom = () =>
  renderPopover({type: 'popover', placement: 'right bottom'});

PlacementRightBottom.story = {
  name: 'placement="right bottom"'
};

export const PlacementBottom = () =>
  renderPopover({type: 'popover', placement: 'bottom'});

PlacementBottom.story = {
  name: 'placement="bottom"'
};

export const PlacementBottomLeft = () =>
  renderPopover({type: 'popover', placement: 'bottom left'});

PlacementBottomLeft.story = {
  name: 'placement="bottom left"'
};

export const PlacementBottomRight = () =>
  renderPopover({type: 'popover', placement: 'bottom right'});

PlacementBottomRight.story = {
  name: 'placement="bottom right"'
};

export const PlacementTop = () =>
  renderPopover({type: 'popover', placement: 'top'});

PlacementTop.story = {
  name: 'placement="top"'
};

export const PlacementTopLeft = () =>
  renderPopover({type: 'popover', placement: 'top left'});

PlacementTopLeft.story = {
  name: 'placement="top left"'
};

export const PlacementTopRight = () =>
  renderPopover({type: 'popover', placement: 'top right'});

PlacementTopRight.story = {
  name: 'placement="top right"'
};

export const Offset = () => renderPopover({type: 'popover', offset: 50});

Offset.story = {
  name: 'offset'
};

export const CrossOffset = () =>
  renderPopover({type: 'popover', crossOffset: 50});

CrossOffset.story = {
  name: 'crossOffset'
};

export const ShouldFlipTrue = () =>
  renderPopover({
    type: 'popover',
    placement: 'start',
    shouldFlip: true,
    width: 'calc(100vh - 100px)'
  });

ShouldFlipTrue.story = {
  name: 'shouldFlip: true'
};

export const ShouldFlipFalse = () =>
  renderPopover({
    type: 'popover',
    placement: 'start',
    shouldFlip: false,
    width: 'calc(100vh - 100px)'
  });

ShouldFlipFalse.story = {
  name: 'shouldFlip: false'
};

export const ShouldFlipTrueWithOffset = () =>
  renderPopover({
    type: 'popover',
    placement: 'start',
    shouldFlip: true,
    offset: 50,
    width: 'calc(100vh - 100px)'
  });

ShouldFlipTrueWithOffset.story = {
  name: 'shouldFlip: true with offset'
};

export const KeyboardDismissDisabledModal = () =>
  render({type: 'modal', isKeyboardDismissDisabled: true});

KeyboardDismissDisabledModal.story = {
  name: 'keyboard dismiss disabled: modal'
};

export const KeyboardDismissDisabledPopover = () =>
  renderPopover({
    type: 'popover',
    placement: 'bottom',
    isKeyboardDismissDisabled: true
  });

KeyboardDismissDisabledPopover.story = {
  name: 'keyboard dismiss disabled: popover'
};

export const KeyboardDismissDisabledTray = () =>
  renderPopover({type: 'tray', isKeyboardDismissDisabled: true});

KeyboardDismissDisabledTray.story = {
  name: 'keyboard dismiss disabled: tray'
};

export const ContainerPadding = () =>
  renderPopover({
    type: 'popover',
    placement: 'bottom',
    width: 'calc(100vh - 100px)',
    containerPadding: 20
  });

ContainerPadding.story = {
  name: 'containerPadding'
};

export const CloseFunctionWithButtonPopover = () => (
  <div style={{display: 'flex', margin: '100px 0'}}>
    <DialogTrigger type="popover" onOpenChange={action('open change')}>
      <ActionButton>Trigger</ActionButton>
      {(close) => (
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit
              amet tristique risus. In sit amet suscipit lorem. Orci varius
              natoque penatibus et magnis dis parturient montes, nascetur
              ridiculus mus. In condimentum imperdiet metus non condimentum.
              Duis eu velit et quam accumsan tempus at id velit. Duis elementum
              elementum purus, id tempus mauris posuere a. Nunc vestibulum
              sapien pellentesque lectus commodo ornare.
            </Text>
          </Content>
          <ButtonGroup>
            <Button
              variant="secondary"
              onPress={chain(close, action('cancel'))}>
              Cancel
            </Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  </div>
);

CloseFunctionWithButtonPopover.story = {
  name: 'Close function with button: popover'
};

export const TargetRef = () => <TriggerWithRef type="popover" />;

TargetRef.story = {
  name: 'targetRef'
};

export const _AlertDialog = () => renderAlert({});

_AlertDialog.story = {
  name: 'alert dialog'
};

export const CrossoffsetExamples = () => (
  <Flex gap="size-200" alignSelf="center">
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Top</span>
      <div>
        <span>-50</span>
        {renderPopover(
          {type: 'popover', placement: 'left top', crossOffset: -50},
          false
        )}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left top'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover(
          {type: 'popover', placement: 'left top', crossOffset: 50},
          false
        )}
      </div>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left</span>
      <div>
        <span>-50</span>
        {renderPopover(
          {type: 'popover', placement: 'left', crossOffset: -50},
          false
        )}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover(
          {type: 'popover', placement: 'left', crossOffset: 50},
          false
        )}
      </div>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Bottom</span>
      <div>
        <span>-50</span>
        {renderPopover(
          {type: 'popover', placement: 'left bottom', crossOffset: -50},
          false
        )}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left bottom'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover(
          {type: 'popover', placement: 'left bottom', crossOffset: 50},
          false
        )}
      </div>
    </Flex>
  </Flex>
);

CrossoffsetExamples.story = {
  name: 'crossoffset examples'
};

export const TriggerVisibleThroughUnderlay = () => renderTriggerNotCentered({});

TriggerVisibleThroughUnderlay.story = {
  name: 'trigger visible through underlay'
};

export const _2Popovers = () => (
  <Flex gap="size-200">
    <DialogTrigger type="popover">
      <ActionButton>Trigger</ActionButton>
      <Dialog>
        <Content>
          <input />
          <input />
        </Content>
      </Dialog>
    </DialogTrigger>
    <DialogTrigger type="popover">
      <ActionButton>Trigger</ActionButton>
      <Dialog>
        <Content>Hi!</Content>
      </Dialog>
    </DialogTrigger>
  </Flex>
);

_2Popovers.story = {
  name: '2 popovers'
};

function render({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger {...props} onOpenChange={action('open change')}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog>
            <Heading id="foo">The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>
              <Text>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
                sit amet tristique risus. In sit amet suscipit lorem. Orci
                varius natoque penatibus et magnis dis parturient montes,
                nascetur ridiculus mus. In condimentum imperdiet metus non
                condimentum. Duis eu velit et quam accumsan tempus at id velit.
                Duis elementum elementum purus, id tempus mauris posuere a. Nunc
                vestibulum sapien pellentesque lectus commodo ornare.
              </Text>
            </Content>
            {!props.isDismissable && (
              <ButtonGroup>
                <Button
                  variant="secondary"
                  onPress={chain(close, action('cancel'))}>
                  Cancel
                </Button>
                <Button variant="cta" onPress={chain(close, action('confirm'))}>
                  Confirm
                </Button>
              </ButtonGroup>
            )}
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderTriggerNotCentered(props) {
  return (
    <div style={{position: 'absolute', top: '100px', left: '100px'}}>
      <div>
        action button shouldn't get any events if the underlay is up and you try
        to click it through the underlay
      </div>
      <DialogTrigger
        {...props}
        isDismissable
        onOpenChange={action('open change')}>
        <ActionButton
          onPressStart={action('onPressStart')}
          onPress={action('onPress')}
          onPressEnd={action('onPressEnd')}>
          Trigger
        </ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit
              amet tristique risus. In sit amet suscipit lorem. Orci varius
              natoque penatibus et magnis dis parturient montes, nascetur
              ridiculus mus. In condimentum imperdiet metus non condimentum.
              Duis eu velit et quam accumsan tempus at id velit. Duis elementum
              elementum purus, id tempus mauris posuere a. Nunc vestibulum
              sapien pellentesque lectus commodo ornare.
            </Text>
          </Content>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}

function renderPopover({width = 'auto', ...props}, withMargin = true) {
  return (
    <div style={{display: 'flex', width, margin: withMargin && '100px 0'}}>
      <DialogTrigger {...props} onOpenChange={action('open change')}>
        <ActionButton>Trigger</ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit
              amet tristique risus. In sit amet suscipit lorem. Orci varius
              natoque penatibus et magnis dis parturient montes, nascetur
              ridiculus mus. In condimentum imperdiet metus non condimentum.
              Duis eu velit et quam accumsan tempus at id velit. Duis elementum
              elementum purus, id tempus mauris posuere a. Nunc vestibulum
              sapien pellentesque lectus commodo ornare.
            </Text>
          </Content>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}

let TriggerWithRef = (props) => {
  let ref = React.useRef();
  return (
    <div style={{display: 'flex'}}>
      <DialogTrigger
        {...props}
        targetRef={ref}
        onOpenChange={action('open change')}>
        <ActionButton>Trigger</ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content>
            <Text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit
              amet tristique risus. In sit amet suscipit lorem. Orci varius
              natoque penatibus et magnis dis parturient montes, nascetur
              ridiculus mus. In condimentum imperdiet metus non condimentum.
              Duis eu velit et quam accumsan tempus at id velit. Duis elementum
              elementum purus, id tempus mauris posuere a. Nunc vestibulum
              sapien pellentesque lectus commodo ornare.
            </Text>
          </Content>
        </Dialog>
      </DialogTrigger>
      <span ref={ref} style={{marginInlineStart: '200px'}}>
        Popover appears over here
      </span>
    </div>
  );
};

function renderAlert({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger {...props} onOpenChange={action('open change')}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <AlertDialog
            title="Alert! Danger!"
            variant="error"
            primaryActionLabel="Accept"
            secondaryActionLabel="Whoa"
            cancelLabel="Cancel"
            onCancel={chain(close, action('cancel'))}
            onPrimaryAction={chain(close, action('primary'))}
            onSecondaryAction={chain(close, action('secondary'))}>
            <Text>
              Fine! No, absolutely fine. It's not like I don't have, you know,
              ten thousand other test subjects begging me to help them escape.
              You know, it's not like this place is about to EXPLODE.
            </Text>
          </AlertDialog>
        )}
      </DialogTrigger>
    </div>
  );
}
