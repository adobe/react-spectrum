import {action, storiesOf} from '@storybook/react';
import Dialog from '../src/Dialog';
import DropdownButton from '../src/DropdownButton';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import {MenuItem} from '../src/Menu';
import ModalTrigger from '../src/ModalTrigger';
import React from 'react';
import SocialNetwork from '../src/Icon/SocialNetwork';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('DropdownButton', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 200px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => render({label: 'Action'}),
    {inline: true}
  )
  .addWithInfo(
    'Icon only',
    () => render({icon: <SocialNetwork alt="Social Network" />}),
    {inline: true}
  )
  .addWithInfo(
    'alignRight',
    () => render({label: 'Action', alignRight: true}),
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => render({label: 'Action', disabled: true}),
    {inline: true}
  )
  .addWithInfo(
    'Stay open on select',
    () => render({label: 'Action', closeOnSelect: false}),
    {inline: true}
  )
  .addWithInfo(
    'holdAffordance',
    () => render({holdAffordance: true}),
    {inline: true}
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
