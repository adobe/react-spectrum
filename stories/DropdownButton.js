/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import {action} from '@storybook/addon-actions';
import Dialog from '../src/Dialog';
import DropdownButton from '../src/DropdownButton';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import {MenuItem} from '../src/Menu';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import SocialNetwork from '../src/Icon/SocialNetwork';
import {storiesOf} from '@storybook/react';
import Twitter from '../src/Icon/Twitter';

const note = 'A `ModalTrigger` opening a `Dialog` wraps the `MenuItem` labelled "Instagram…". \n\n\
  Note that the `Dialog` uses the following `onHide` event handler to restore focus to the `DropdownButton` by `id` when it closes: \n\n\
  `onHide={() => document.getElementById(dropdownButtonId).focus()}`.';

storiesOf('DropdownButton', module)
  .add(
    'Default',
    () => render({label: 'Action'}),
    {info: `A basic demonstration of a DropdownButton. \n\n${note}`}
  )
  .add(
    'Icon only',
    () => render({icon: <SocialNetwork alt="Social Network" />}),
    {info: `An icon-only DropdownButton. \n\n${note}`}
  )
  .add(
    'alignRight',
    () => render({label: 'Action', alignRight: true}),
    {info: `A DropdownButton where the menu aligns to the right of the target button. \n\n${note}`}
  )
  .add(
    'disabled',
    () => render({label: 'Action', disabled: true}),
    {info: 'A disabled DropdownButton.'}
  )
  .add(
    'Stay open on select',
    () => render({label: 'Action', closeOnSelect: false}),
    {info: `A DropdownButton that remains expanded after a menu item is selected. \n\n${note}`}
  )
  .add(
    'holdAffordance',
    () => render({holdAffordance: true}),
    {info: `A DropdownButton where the menu expands following a 250ms delay while holding the mouse down on the button. Alt+ArrowDown serves as a keyboard accessible way to expand the menu. \n\n${note}`}
  );

function render(props = {}) {
  let dropdownButtonId = 'dropdown-button-id';
  return (
    <DropdownButton id={dropdownButtonId} {...props} onClick={action('click')} onSelect={action('select')}>
      <MenuItem icon={<Twitter />} value="twitter">Twitter</MenuItem>
      <MenuItem icon={<Facebook />} onClick={action('click')} value="facebook">Facebook</MenuItem>
      <ModalTrigger>
        <MenuItem onClick={action('click')} icon={<Instagram />} value="instagram">Instagram…</MenuItem>
        <Dialog
          onHide={() => document.getElementById(dropdownButtonId).focus()}
          modalContent
          title="Instagram"
          confirmLabel="Do it"
          size="S"
          cancelLabel="close"
          {...props}>
          Do you want to Instagram?
        </Dialog>
      </ModalTrigger>
    </DropdownButton>
  );
}
