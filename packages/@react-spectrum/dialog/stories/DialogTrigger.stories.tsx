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
import AlertMedium from '@spectrum-icons/ui/AlertMedium';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {chain} from '@react-aria/utils';
import {Checkbox} from '@react-spectrum/checkbox';
import {Content, Footer, Header, View} from '@react-spectrum/view';
import {Divider} from '@react-spectrum/divider';
import {Flex, Grid} from '@react-spectrum/layout';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {Provider} from '@react-spectrum/provider';
import React, {useState} from 'react';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import {TranslateDialog} from './../chromatic/DialogLanguages.stories';

export default {
  title: 'DialogTrigger',
  providerSwitcher: {status: 'notice'},
  argTypes: {
    crossOffset: {
      control: {
        type: 'number'
      }
    },
    offset: {
      control: {
        type: 'number'
      }
    },
    placement: {
      type: 'select',
      defaultValue: 'top',
      options: [
        'bottom',
        'bottom left',
        'bottom right',
        'bottom start',
        'bottom end',
        'top',
        'top left',
        'top right',
        'top start',
        'top end',
        'left',
        'left top',
        'left bottom',
        'start',
        'start top',
        'start bottom',
        'right',
        'right top',
        'right bottom',
        'end',
        'end top',
        'end bottom'
      ]
    },
    buttonHeight: {
      control: {
        type: 'number'
      }
    },
    buttonWidth: {
      control: {
        type: 'number'
      }
    },
    shouldFlip: {
      control: {type: 'boolean'}
    },
    isKeyboardDismissDisabled: {
      control: {type: 'boolean'}
    },
    containerPadding: {
      control: {
        type: 'number'
      }
    }
  }
};

export const Default = (args) => render(args);

Default.story = {
  name: 'default'
};

export const TypePopover = (args) => renderPopover({type: 'popover', ...args});

TypePopover.story = {
  name: 'type: popover'
};

export const TypeModal = (args) => render({type: 'modal', ...args});

TypeModal.story = {
  name: 'type: modal'
};

export const TypeModalIsDismissable = (args) =>
  render({type: 'modal', isDismissable: true, ...args});

TypeModalIsDismissable.story = {
  name: 'type: modal isDismissable'
};

export const TypeFullscreen = (args) => render({type: 'fullscreen', ...args});

TypeFullscreen.story = {
  name: 'type: fullscreen'
};

export const TypeFullscreenTakeover = (args) => render({type: 'fullscreenTakeover', ...args});

TypeFullscreenTakeover.story = {
  name: 'type: fullscreenTakeover'
};

export const TypeTray = (args) => renderPopover({type: 'tray', ...args});

TypeTray.story = {
  name: 'type: tray'
};

export const MobileTypeFullscreen = (args) =>
  render({type: 'modal', mobileType: 'fullscreen', ...args});

MobileTypeFullscreen.story = {
  name: 'mobileType: fullscreen'
};

export const MobileTypeFullscreenTakeover = (args) =>
  render({type: 'modal', mobileType: 'fullscreenTakeover', ...args});

MobileTypeFullscreenTakeover.story = {
  name: 'mobileType: fullscreenTakeover'
};

export const PopoverWithMobileTypeModal = (args) =>
  renderPopover({type: 'popover', mobileType: 'modal', ...args});

PopoverWithMobileTypeModal.story = {
  name: 'popover with mobileType: modal'
};

export const PopoverWithMobileTypeTray = (args) =>
  renderPopover({type: 'popover', mobileType: 'tray', ...args});

PopoverWithMobileTypeTray.story = {
  name: 'popover with mobileType: tray'
};

export const NestedModals = () => (
  <div style={{paddingTop: 100}}>
    <input aria-label="test input" />
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
  name: 'popover inside scroll view',
  parameters: {
    a11y: {
      config: {
        rules: [{id: 'scrollable-region-focusable', enabled: false}]
      }
    }
  }
};

export const ShouldFlipWithWidth = (args) =>
  renderPopover({type: 'popover', width: 'calc(100vh - 100px)', ...args});

ShouldFlipWithWidth.story = {
  name: 'shouldFlip with width'
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique
              risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis
              parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non
              condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum
              elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque
              lectus commodo ornare.
            </Text>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={chain(close, action('cancel'))}>
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

export const TargetRef = (args) => <TriggerWithRef type="popover" {...args} />;

TargetRef.story = {
  name: 'targetRef'
};

export const _AlertDialog = (args) => renderAlert(args);

_AlertDialog.story = {
  name: 'alert dialog'
};

export const CrossoffsetExamples = () => (
  <Flex gap="size-200" alignSelf="center">
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Top</span>
      <div>
        <span>-50</span>
        {renderPopover({type: 'popover', placement: 'left top', crossOffset: -50}, false)}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left top'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover({type: 'popover', placement: 'left top', crossOffset: 50}, false)}
      </div>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left</span>
      <div>
        <span>-50</span>
        {renderPopover({type: 'popover', placement: 'left', crossOffset: -50}, false)}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover({type: 'popover', placement: 'left', crossOffset: 50}, false)}
      </div>
    </Flex>
    <Flex gap="size-200" direction="column" alignItems="start">
      <span>Left Bottom</span>
      <div>
        <span>-50</span>
        {renderPopover({type: 'popover', placement: 'left bottom', crossOffset: -50}, false)}
      </div>
      <div>
        <span>0</span>
        {renderPopover({type: 'popover', placement: 'left bottom'}, false)}
      </div>
      <div>
        <span>50</span>
        {renderPopover({type: 'popover', placement: 'left bottom', crossOffset: 50}, false)}
      </div>
    </Flex>
  </Flex>
);

CrossoffsetExamples.story = {
  name: 'crossoffset examples'
};

export const TriggerVisibleThroughUnderlay = (args) => renderTriggerNotCentered(args);

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

export const _AdjustableDialog = () => <AdjustableDialog />;

_AdjustableDialog.story = {
  name: 'adjustable dialog'
};

export const WithTooltip = () => (
  <div style={{display: 'flex', width: 'auto', margin: '100px 0'}}>
    <DialogTrigger isDismissable>
      <ActionButton>Trigger</ActionButton>
      <Dialog>
        <Heading>Has tooltip</Heading>
        <Divider />
        <Content>
          <p>Pressing escape when Tooltip is open closes Tooltip and not Dialog too.</p>
          <TooltipTrigger>
            <Button variant="cta">Has tooltip</Button>
            <Tooltip>Press escape</Tooltip>
          </TooltipTrigger>
        </Content>
      </Dialog>
    </DialogTrigger>
  </div>
);

WithTooltip.story = {
  name: 'with tooltip inside'
};

export const WithTooltipTrigger = () => (
  <Flex direction="row" gap={10}>
    <DialogTrigger>
      <ActionButton>DialogTrigger only</ActionButton>
      {close => <CustomDialog close={close} />}
    </DialogTrigger>

    <TooltipTrigger>
      <ActionButton>TooltipTrigger only</ActionButton>
      <Tooltip>This is a tooltip</Tooltip>
    </TooltipTrigger>

    <TooltipTrigger>
      <ActionButton isDisabled>TooltipTrigger only</ActionButton>
      <Tooltip>This is a tooltip</Tooltip>
    </TooltipTrigger>

    <DialogTrigger>
      <TooltipTrigger>
        <ActionButton>DialogTrigger + TooltipTrigger</ActionButton>
        <Tooltip>This is a tooltip</Tooltip>
      </TooltipTrigger>
      {close => <CustomDialog close={close} />}
    </DialogTrigger>

    <DialogTrigger>
      <TooltipTrigger>
        <ActionButton isDisabled>DialogTrigger + TooltipTrigger</ActionButton>
        <Tooltip>This is a tooltip</Tooltip>
      </TooltipTrigger>
      {close => <CustomDialog close={close} />}
    </DialogTrigger>
  </Flex>
);

WithTooltipTrigger.story = {
  name: 'with tooltip wrapper'
};

function CustomDialog({close}) {
  return (
    <Dialog>
      <Content>
        Dialog content
      </Content>
      <ButtonGroup>
        <Button variant="cta" onPress={close}>Close</Button>
      </ButtonGroup>
    </Dialog>
  );
}

export const WithTranslations = () => <TranslateDialog />;

WithTranslations.story = {
  name: 'with translations',
  parameters: {description: {data: 'Translations included for: Arabic, English, Hebrew, Japanese, Korean, Simplified Chinese, and Traditional Chinese.'}}
};

export const TriggersOnEdges = () => (
  <View width="100%" overflow="auto">
    <Grid
      areas={[
        'top    top',
        'start  end',
        'bottom bottom'
      ]}
      columns={['auto', 'auto']}
      rows={['size-450', 'auto', 'size-450']}
      height="1600px"
      width="calc(100vw + 100px)"
      marginTop="20px"
      marginBottom="20px"
      gap="size-100">
      <View gridArea="top" justifySelf="center">
        <DialogTrigger type="popover" placement="end" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="end top" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End Top</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="end bottom" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End Bottom</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start top" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start Top</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start bottom" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start Bottom</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="bottom" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Bottom</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>No Placement (default is bottom)</Content></Dialog>
        </DialogTrigger>
      </View>
      <View gridArea="start" justifySelf="start" alignSelf="center" paddingStart="20px">
        <DialogTrigger type="popover" placement="top" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="top start" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top Start</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="top end" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top End</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom start" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom Start</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom end" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom End</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="end" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement End</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>No Placement (default is bottom)</Content></Dialog>
        </DialogTrigger>
      </View>
      <View gridArea="end" justifySelf="end" alignSelf="center" paddingEnd="20px">
        <DialogTrigger type="popover" placement="top" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="top end" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top End</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="top start" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Top Start</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom end" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom End</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="bottom start" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Bottom Start</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" placement="start" shouldFlip={false}>
          <ActionButton>T</ActionButton>
          <Dialog><Content>Placement Start</Content></Dialog>
        </DialogTrigger>
        <br />
        <DialogTrigger type="popover" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>No Placement (default is bottom)</Content></Dialog>
        </DialogTrigger>
      </View>
      <View gridArea="bottom" justifySelf="center">
        <DialogTrigger type="popover" placement="end" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="end bottom" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End Bottom</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="end top" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement End Top</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start bottom" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start Bottom</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="start top" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement Start top</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" placement="top" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>Placement top</Content></Dialog>
        </DialogTrigger>
        <DialogTrigger type="popover" shouldFlip={false}>
          <ActionButton>Trigger</ActionButton>
          <Dialog><Content>No Placement (default is bottom)</Content></Dialog>
        </DialogTrigger>
      </View>
    </Grid>
  </View>
);

TriggersOnEdges.story = {
  name: 'popover triggers on edges'
};

function render(props) {
  let {width = 'auto', ...otherProps} = props;

  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger {...otherProps} onOpenChange={action('open change')}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog>
            <Heading id="foo">The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
            {!props.isDismissable &&
              <ButtonGroup>
                <Button variant="secondary" onPress={chain(close, action('cancel'))}>Cancel</Button>
                <Button variant="cta" onPress={chain(close, action('confirm'))}>Confirm</Button>
              </ButtonGroup>}
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderTriggerNotCentered(props) {
  let {buttonHeight, buttonWidth, ...otherProps} = props;

  return (
    <div style={{position: 'absolute', top: '100px', left: '100px'}}>
      <div>action button shouldn't get any events if the underlay is up and you try to click it through the underlay</div>
      <DialogTrigger {...otherProps} isDismissable onOpenChange={action('open change')}>
        <ActionButton height={buttonHeight} width={buttonWidth} onPressStart={action('onPressStart')} onPress={action('onPress')} onPressEnd={action('onPressEnd')}>Trigger</ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}

function renderPopover(props, withMargin = true) {
  let {width = 'auto', buttonHeight, buttonWidth, ...otherProps} = props;

  return (
    <div style={{display: 'flex', width, margin: withMargin ? '100px 0' : undefined}}>
      <DialogTrigger {...otherProps} onOpenChange={action('open change')}>
        <ActionButton height={buttonHeight} width={buttonWidth}>Trigger</ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}

let TriggerWithRef = (props) => {
  let {buttonHeight, buttonWidth, ...otherProps} = props;
  let ref = React.useRef(null);
  return (
    <div style={{display: 'flex'}}>
      <DialogTrigger {...otherProps} targetRef={ref} onOpenChange={action('open change')}>
        <ActionButton height={buttonHeight} width={buttonWidth}>Trigger</ActionButton>
        <Dialog>
          <Heading>The Heading</Heading>
          <Header>The Header</Header>
          <Divider />
          <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
        </Dialog>
      </DialogTrigger>
      <span ref={ref} style={{marginInlineStart: '200px'}}>Popover appears over here</span>
    </div>
  );
};


function renderAlert(props) {
  let {buttonHeight, buttonWidth, width = 'auto', ...otherProps} = props;

  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger {...otherProps} onOpenChange={action('open change')}>
        <ActionButton height={buttonHeight} width={buttonWidth}>Trigger</ActionButton>
        {(close) => (
          <AlertDialog title="Alert! Danger!" variant="error" primaryActionLabel="Accept" secondaryActionLabel="Whoa" cancelLabel="Cancel" onCancel={chain(close, action('cancel'))} onPrimaryAction={chain(close, action('primary'))} onSecondaryAction={chain(close, action('secondary'))}>
            <Text>Fine! No, absolutely fine. It's not like I don't have, you know, ten thousand other test subjects begging me to help them escape. You know, it's not like this place is about to EXPLODE.</Text>
          </AlertDialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function AdjustableDialog() {
  let headingStrings = ['The Heading', 'The Heading of Maximum Truth That is Really Long to Go On and On a a a a a Again and Wraps'];
  let [showHero, setShowHero] = useState(false);
  let [heading, setHeading] = useState(headingStrings[0]);
  let [showHeader, setShowHeader] = useState(false);
  let [showTypeIcon, setShowTypeIcon] = useState(false);
  let [isDismissable, setIsDismissable] = useState(false);
  let [showFooter, setShowFooter] = useState(false);
  let [longButtonLabels, setLongButtonLabels] = useState(false);

  return (
    <Flex gap="size-200">
      <Flex direction="column" width="size-2000" gap="size-100">
        <Checkbox onChange={setShowHero}>Show Hero</Checkbox>
        <Checkbox onChange={(isChecked) => {isChecked ? setHeading(headingStrings[1]) : setHeading(headingStrings[0]);}}>Toggle Heading Values</Checkbox>
        <Checkbox onChange={setShowHeader}>Show Header</Checkbox>
        <Checkbox onChange={setShowTypeIcon}>Show TypeIcon</Checkbox>
        <Checkbox onChange={setIsDismissable}>Show Dismissable</Checkbox>
        <Checkbox onChange={setShowFooter}>Show Footer</Checkbox>
        <Checkbox onChange={setLongButtonLabels}>Show Long Button Labels</Checkbox>
      </Flex>
      <DialogTrigger isDismissable={isDismissable}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog>
            {showHero && <Image slot="hero" alt="" src="https://i.imgur.com/Z7AzH2c.png" objectFit="cover" />}
            <Heading>{heading}</Heading>
            {showHeader && <Header>This is a long header</Header>}
            {showTypeIcon && <AlertMedium
              slot="typeIcon"
              aria-label="Alert" />}
            <Divider />
            <Content><Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text></Content>
            {showFooter && <Footer><Checkbox>I have read and accept the terms of use and privacy policy</Checkbox></Footer>}
            <ButtonGroup>
              <Button variant="secondary" onPress={chain(close, action('cancel'))}>Cancel {longButtonLabels && 'and close this dialog'}</Button>
              <Button variant="cta" onPress={chain(close, action('confirm'))}>Confirm {longButtonLabels && 'and close this dialog'}</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </Flex>
  );
}
