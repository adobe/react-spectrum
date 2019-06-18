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

storiesOf('DropdownButton', module)
  .add(
    'Default',
    () => render({label: 'Action'})
  )
  .add(
    'Icon only',
    () => render({icon: <SocialNetwork alt="Social Network" />})
  )
  .add(
    'alignRight',
    () => render({label: 'Action', alignRight: true})
  )
  .add(
    'disabled',
    () => render({label: 'Action', disabled: true})
  )
  .add(
    'Stay open on select',
    () => render({label: 'Action', closeOnSelect: false})
  )
  .add(
    'holdAffordance',
    () => render({holdAffordance: true})
  );

function render(props = {}) {
  return (
    <DropdownButton {...props} onClick={action('click')} onSelect={action('select')}>
      <MenuItem icon={<Twitter />} value="twitter">Twitter</MenuItem>
      <MenuItem icon={<Facebook />} onClick={action('click')} value="facebook">Facebook</MenuItem>
      <ModalTrigger>
        <MenuItem onClick={action('click')} icon={<Instagram />} value="instagram">Instagram</MenuItem>
        <Dialog
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
