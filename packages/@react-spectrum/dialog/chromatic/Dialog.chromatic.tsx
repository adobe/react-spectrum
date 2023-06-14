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

import {ActionButton, Button} from '@react-spectrum/button';
import {ButtonGroup} from '@react-spectrum/buttongroup';
import {Checkbox} from '@react-spectrum/checkbox';
import {Content, Footer, Header} from '@react-spectrum/view';
import {Dialog, DialogTrigger} from '../';
import {Divider} from '@react-spectrum/divider';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import {Heading, Text} from '@react-spectrum/text';
import {Image} from '@react-spectrum/image';
import {Radio, RadioGroup} from '@react-spectrum/radio';
import React from 'react';
import {TextField} from '@react-spectrum/textfield';

export default {
  title: 'Dialog',
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['medium'], disableAnimations: true, express: false}
  },
  excludeStories: ['singleParagraph', 'renderTriggerProps']
};

export const Default = () => render({});

Default.story = {
  name: 'default'
};

export const IsDismissable = () => render({isDismissable: true});

IsDismissable.story = {
  name: 'isDismissable'
};

export const LongContent = () => renderLongContent({});

LongContent.story = {
  name: 'long content'
};

export const LongContentMobileViewport = () => renderLongContent({});

LongContentMobileViewport.story = {
  name: 'long content, mobile viewport',
  parameters: {chromatic: {viewports: [320]}}
};

export const WithHero = () => renderHero({});

WithHero.story = {
  name: 'with hero'
};

export const WithHeroIsDimissable = () => renderHero({isDismissable: true});

WithHeroIsDimissable.story = {
  name: 'with hero, isDimissable'
};

export const WithFooter = () => renderFooter({});

WithFooter.story = {
  name: 'with footer'
};

export const Small = () => render({size: 'S'});

Small.story = {
  name: 'small'
};

export const Medium = () => render({size: 'M'});

Medium.story = {
  name: 'medium'
};

export const Large = () => render({size: 'L'});

Large.story = {
  name: 'large'
};

export const _Form = () => renderWithForm({});

_Form.story = {
  name: 'form'
};

export const FullscreenTakeoverForm = () => renderWithForm({type: 'fullscreenTakeover'});

FullscreenTakeoverForm.story = {
  name: 'fullscreenTakeover form'
};

export const FullscreenTakeoverFormMobileViewport = () => renderWithForm({type: 'fullscreenTakeover'});

FullscreenTakeoverFormMobileViewport.story = {
  name: 'fullscreenTakeover form, mobile viewport',
  parameters: {chromatic: {viewports: [320]}}
};

export const ThreeButtons = () => renderWithThreeButtons({});

ThreeButtons.story = {
  name: 'three buttons'
};

export const ThreeButtonsVerticalOrientation = () => renderWithThreeButtonsVertical({});

ThreeButtonsVerticalOrientation.story = {
  name: 'three buttons, vertical orientation'
};

export const ThreeButtonsFooter = () => renderWithThreeButtons({showFooter: true});

ThreeButtonsFooter.story = {
  name: 'three buttons, footer'
};

export const ThreeButtonsFooterExtraLabel = () => renderWithThreeButtons({showFooter: true, extraLabel: ': This is the extra text'});

ThreeButtonsFooterExtraLabel.story = {
  name: 'three buttons, footer, extraLabel'
};

export const ClearedContent = () => renderWithDividerInContent({});

ClearedContent.story = {
  name: 'cleared content'
};

export const ExtraLongFooter = () => renderWithOptions({extraFooterLabel: 'This is all the extra text for a long footer to get it to wrap'});

ExtraLongFooter.story = {
  name: 'extra long footer'
};

export const ShowHeaderLongerHeadingAndHeader = () => renderWithOptions({showHeader: true, extraHeadering: ' This is extra text for long heading and header'});

ShowHeaderLongerHeadingAndHeader.story = {
  name: 'showHeader, longer heading and header'
};

export const ExtraLongFooterLongerHeadingAndHeader = () => renderWithOptions({extraFooterLabel: 'This is all the extra text for a long footer to get it to wrap', extraHeadering: ' This is extra text for long heading that wraps to make sure it fills the width'});

ExtraLongFooterLongerHeadingAndHeader.story = {
  name: 'extra long footer, longer heading and header'
};

export const ExtraLongFooterShowHeaderLongerHeadingAndHeader = () => renderWithOptions({extraFooterLabel: 'This is all the extra text for a long footer to get it to wrap', showHeader: true, extraHeadering: ' This is extra text for long heading and header'});

ExtraLongFooterShowHeaderLongerHeadingAndHeader.story = {
  name: 'extra long footer, showHeader, longer heading and header'
};

export const Tray = () => renderTriggerProps({type: 'tray'});

Tray.story = {
  name: 'tray',
  parameters: {
    chromatic: {viewports: [320, 1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['large'], disableAnimations: true}
  }
};

export const Popover = () => renderTriggerProps({type: 'popover'});

Popover.story = {
  name: 'popover',
  parameters: {
    chromatic: {viewports: [320, 1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['large'], disableAnimations: true}
  }
};

export const PopoverCrossOffset50 = () => renderTriggerProps({type: 'popover', crossOffset: 50});

PopoverCrossOffset50.story = {
  name: 'popover: crossOffset50',
  parameters: {
    chromatic: {viewports: [1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['large'], disableAnimations: true}
  }
};

export const PopoverCrossOffset200 = () => renderTriggerProps({type: 'popover', crossOffset: 200});

PopoverCrossOffset200.story = {
  name: 'popover: crossOffset200',
  parameters: {
    chromatic: {viewports: [1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['large'], disableAnimations: true}
  }
};

export const PopoverCrossOffset1000 = () => renderTriggerProps({type: 'popover', crossOffset: 1000});

PopoverCrossOffset1000.story = {
  name: 'popover: crossOffset1000',
  parameters: {
    chromatic: {viewports: [1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['large'], disableAnimations: true}
  }
};

export const PopoverContainerPadding = () => renderTriggerProps({type: 'popover', containerPadding: 30, shouldFlip: false, placement: 'top'});

PopoverContainerPadding.story = {
  name: 'popover: containerPadding',
  parameters: {
    chromatic: {viewports: [1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['en-US'], scales: ['large'], disableAnimations: true}
  }
};

export const MobileTypeFullscreenTakeoverModal = () => renderTriggerProps({type: 'modal', mobileType: 'fullscreenTakeover'});

MobileTypeFullscreenTakeoverModal.story = {
  name: 'mobileType fullscreenTakeover, modal',
  parameters: {
    chromatic: {viewports: [320, 1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['large'], disableAnimations: true}
  }
};

export const MobileTypeModalPopover = () => renderTriggerProps({type: 'popover', mobileType: 'modal'});

MobileTypeModalPopover.story = {
  name: 'mobileType: modal, popover',
  parameters: {
    chromatic: {viewports: [320, 1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['large'], disableAnimations: true}
  }
};

export const MobileTypeTrayPopover = () => renderTriggerProps({type: 'popover', mobileType: 'tray'});

MobileTypeTrayPopover.story = {
  name: 'mobileType: tray, popover',
  parameters: {
    chromatic: {viewports: [320, 1200]},
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['large'], disableAnimations: true}
  }
};

function render({width = 'auto', isDismissable = undefined, ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger isDismissable={isDismissable} defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            {!isDismissable &&
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>Cancel</Button>
                <Button variant="cta" onPress={close}>Confirm</Button>
              </ButtonGroup>}
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

export function renderTriggerProps({width = 'auto', isDismissable = undefined, ...triggerProps}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger isDismissable={isDismissable} defaultOpen {...triggerProps}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog>
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            {!isDismissable &&
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>Cancel</Button>
                <Button variant="cta" onPress={close}>Confirm</Button>
              </ButtonGroup>}
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderHero({width = 'auto', isDismissable = undefined, ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger isDismissable={isDismissable} defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Image slot="hero" alt="" src="https://i.imgur.com/Z7AzH2c.png" objectFit="cover" />
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            {!isDismissable &&
              <ButtonGroup>
                <Button variant="secondary" onPress={close}>Cancel</Button>
                <Button variant="cta" onPress={close}>Confirm</Button>
              </ButtonGroup>}
          </Dialog>
          )}
      </DialogTrigger>
    </div>
  );
}

function renderFooter({width = 'auto', isDismissable = undefined, ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger isDismissable={isDismissable} defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            <Footer><Checkbox>I accept</Checkbox></Footer>
            {!isDismissable &&
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="cta" onPress={close}>Confirm</Button>
            </ButtonGroup>}
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderWithForm({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen type={props.type}>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>
              <Form>
                <TextField label="Last Words" autoFocus />
                <Checkbox>Acknowledge robot overlords</Checkbox>
                <RadioGroup label="Preferred Job" name="jobs">
                  <Radio value="battery">Battery</Radio>
                  <Radio value="storage">Information Storage</Radio>
                  <Radio value="processor">Processor</Radio>
                  <Radio value="zoo">Zoo stock</Radio>
                  <Radio value="translator">Emotional Translator</Radio>
                  <Radio value="hunter">Bounty Hunter</Radio>
                  <Radio value="actor">Actor</Radio>
                  <Radio value="tester">Waterslide Tester</Radio>
                  <Radio value="psychiatrist">Psychiatrist</Radio>
                </RadioGroup>
              </Form>
            </Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="cta" onPress={close}>Confirm</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}
export let singleParagraph = () => <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin sit amet tristique risus. In sit amet suscipit lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. In condimentum imperdiet metus non condimentum. Duis eu velit et quam accumsan tempus at id velit. Duis elementum elementum purus, id tempus mauris posuere a. Nunc vestibulum sapien pellentesque lectus commodo ornare.</Text>;
let fiveParagraphs = () => (
  <React.Fragment>
    <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi proin sed libero enim. Mattis ullamcorper velit sed ullamcorper morbi tincidunt. Sed enim ut sem viverra aliquet eget sit amet tellus. Diam quis enim lobortis scelerisque fermentum dui faucibus in ornare. Diam quam nulla porttitor massa id. Eleifend mi in nulla posuere sollicitudin. Turpis nunc eget lorem dolor sed viverra ipsum nunc. Faucibus in ornare quam viverra. Risus commodo viverra maecenas accumsan lacus vel facilisis volutpat est. Nam libero justo laoreet sit amet cursus sit. Netus et malesuada fames ac. Dictum fusce ut placerat orci nulla pellentesque dignissim enim sit. Eros donec ac odio tempor orci. Ut etiam sit amet nisl purus in mollis nunc. Nisl rhoncus mattis rhoncus urna neque viverra. Convallis aenean et tortor at risus. Diam phasellus vestibulum lorem sed risus ultricies.</Text>
    <Text>Eleifend quam adipiscing vitae proin sagittis nisl. Diam donec adipiscing tristique risus. In fermentum posuere urna nec tincidunt praesent semper. Suspendisse in est ante in. Egestas diam in arcu cursus euismod quis viverra nibh cras. Aliquam sem fringilla ut morbi tincidunt augue interdum. Lacus sed turpis tincidunt id aliquet risus feugiat. Praesent semper feugiat nibh sed pulvinar proin. In massa tempor nec feugiat nisl pretium fusce id velit. Non nisi est sit amet facilisis. Mi in nulla posuere sollicitudin aliquam ultrices. Morbi leo urna molestie at elementum. Laoreet non curabitur gravida arcu ac tortor dignissim convallis. Risus quis varius quam quisque id. Platea dictumst quisque sagittis purus. Etiam non quam lacus suspendisse faucibus interdum posuere. Semper feugiat nibh sed pulvinar proin gravida hendrerit lectus.</Text>
    <Text>Risus ultricies tristique nulla aliquet enim tortor at. Ac placerat vestibulum lectus mauris. Sed viverra tellus in hac habitasse platea dictumst vestibulum rhoncus. Suspendisse ultrices gravida dictum fusce ut placerat orci nulla pellentesque. Sit amet nulla facilisi morbi tempus iaculis urna. Ut etiam sit amet nisl purus in. Risus at ultrices mi tempus imperdiet. Magna fermentum iaculis eu non diam phasellus. Orci sagittis eu volutpat odio. Volutpat blandit aliquam etiam erat velit scelerisque in dictum non. Amet nulla facilisi morbi tempus iaculis urna id. Iaculis eu non diam phasellus. Eu lobortis elementum nibh tellus molestie nunc. At tempor commodo ullamcorper a lacus vestibulum sed. Mi sit amet mauris commodo quis. Tellus elementum sagittis vitae et leo duis. Vel risus commodo viverra maecenas accumsan lacus.</Text>
    <Text>Ut porttitor leo a diam sollicitudin tempor id eu nisl. Tristique senectus et netus et malesuada fames ac turpis egestas. Tellus in hac habitasse platea dictumst vestibulum rhoncus est. Integer feugiat scelerisque varius morbi enim nunc faucibus a. Tempus quam pellentesque nec nam aliquam sem et. Quam viverra orci sagittis eu volutpat odio facilisis mauris. Nunc lobortis mattis aliquam faucibus purus in massa tempor. Tincidunt dui ut ornare lectus sit amet est. Magna fermentum iaculis eu non. Posuere sollicitudin aliquam ultrices sagittis orci a scelerisque. Vitae aliquet nec ullamcorper sit amet risus nullam eget felis. Vitae proin sagittis nisl rhoncus mattis rhoncus. Nunc vel risus commodo viverra maecenas. Diam in arcu cursus euismod. Dolor morbi non arcu risus quis varius quam. Amet nisl suscipit adipiscing bibendum. Nulla pellentesque dignissim enim sit amet venenatis. Nunc congue nisi vitae suscipit tellus mauris a diam maecenas. In hac habitasse platea dictumst vestibulum rhoncus est pellentesque elit</Text>
    <Text>Cras semper auctor neque vitae tempus quam pellentesque nec. Maecenas ultricies mi eget mauris pharetra et ultrices neque ornare. Vulputate enim nulla aliquet porttitor lacus luctus accumsan tortor posuere. Pellentesque habitant morbi tristique senectus et. Ipsum dolor sit amet consectetur adipiscing elit pellentesque. Sem et tortor consequat id porta nibh venenatis. Viverra nibh cras pulvinar mattis nunc sed blandit. Urna porttitor rhoncus dolor purus. Vivamus arcu felis bibendum ut. Cras sed felis eget velit aliquet. Sed tempus urna et pharetra pharetra. Viverra adipiscing at in tellus integer feugiat scelerisque varius morbi. Ac tortor vitae purus faucibus ornare suspendisse sed nisi lacus. Ultrices neque ornare aenean euismod elementum nisi quis eleifend quam. Vel turpis nunc eget lorem. Quisque egestas diam in arcu cursus euismod quis viverra. At tempor commodo ullamcorper a lacus vestibulum sed. Id aliquet lectus proin nibh nisl condimentum id venenatis. Quis viverra nibh cras pulvinar. Purus in mollis nunc sed.</Text>
  </React.Fragment>
);

function renderLongContent({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading is also very long and demonstrates what happens if there is no Header</Heading>
            <Divider />
            <Content>{fiveParagraphs()}</Content>
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Cancel</Button>
              <Button variant="cta" onPress={close}>Confirm</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderWithThreeButtons({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading{props.extraLabel}</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>{singleParagraph()}</Content>
            {props.showFooter && <Footer><Checkbox>I have read and accept{props.extraLabel}</Checkbox></Footer>}
            <ButtonGroup>
              <Button variant="secondary" onPress={close}>Secondary</Button>
              <Button variant="primary" onPress={close}>Primary{props.extraLabel}</Button>
              <Button variant="cta" onPress={close} autoFocus>CTA{props.extraLabel}</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderWithThreeButtonsVertical({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading</Heading>
            <Divider />
            <Content>{singleParagraph()}</Content>
            <ButtonGroup orientation="vertical">
              <Button variant="secondary" onPress={close}>Secondary</Button>
              <Button variant="primary" onPress={close}>Primary</Button>
              <Button variant="cta" onPress={close} autoFocus>CTA</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderWithDividerInContent({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading</Heading>
            <Header>The Header</Header>
            <Divider />
            <Content>
              <Flex UNSAFE_style={{padding: '10px'}}>
                <Text flexGrow={1} flexBasis={0}>Column number one. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                <Divider flexShrink={0} marginStart={10} marginEnd={10} orientation="vertical" size="S" />
                <Text flexGrow={1} flexBasis={0}>Column number two. Eleifend quam adipiscing vitae proin sagittis nisl. Diam donec adipiscing tristique risus.</Text>
              </Flex>
            </Content>
            <ButtonGroup>
              <Button variant="primary" onPress={close}>Primary</Button>
              <Button variant="cta" onPress={close} autoFocus>CTA</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}

function renderWithOptions({width = 'auto', ...props}) {
  return (
    <div style={{display: 'flex', width, margin: '100px 0'}}>
      <DialogTrigger defaultOpen>
        <ActionButton>Trigger</ActionButton>
        {(close) => (
          <Dialog {...props}>
            <Heading>The Heading{props.extraHeadering}</Heading>
            {props.showHeader && <Header>The Header{props.extraHeadering}</Header>}
            <Divider />
            <Content>{singleParagraph()}</Content>
            {props.extraFooterLabel && <Footer><Checkbox>I have read and accept{props.extraFooterLabel}</Checkbox></Footer>}
            <ButtonGroup>
              <Button variant="primary" onPress={close}>Primary</Button>
              <Button variant="cta" onPress={close} autoFocus>CTA</Button>
            </ButtonGroup>
          </Dialog>
        )}
      </DialogTrigger>
    </div>
  );
}
