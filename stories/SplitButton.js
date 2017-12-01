import {action, storiesOf} from '@storybook/react';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import {MenuItem} from '../src/Menu';
import React from 'react';
import SplitButton from '../src/SplitButton';
import Twitter from '../src/Icon/Twitter';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('SplitButton', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'variant: primary',
    () => render({label: 'Action', variant: 'primary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: secondary',
    () => render({label: 'Action', variant: 'secondary'}),
    {inline: true}
  )
  .addWithInfo(
    'variant: cta',
    () => render({label: 'Action', variant: 'cta'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <SplitButton {...props} onClick={action('click')} onSelect={action('select')}>
      <MenuItem icon={<Twitter />} value="twitter">Twitter</MenuItem>
      <MenuItem icon={<Facebook />} value="facebook">Facebook</MenuItem>
      <MenuItem icon={<Instagram />} value="instagram">Instagram</MenuItem>
    </SplitButton>
  );
}
