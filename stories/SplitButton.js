import {action} from '@storybook/addon-actions';
import Facebook from '../src/Icon/Facebook';
import Instagram from '../src/Icon/Instagram';
import {MenuItem} from '../src/Menu';
import React from 'react';
import SplitButton from '../src/SplitButton';
import {storiesOf} from '@storybook/react';
import Twitter from '../src/Icon/Twitter';

storiesOf('SplitButton', module)
  .add(
    'variant: primary',
    () => render({label: 'Action', variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({label: 'Action', variant: 'secondary'})
  )
  .add(
    'variant: cta',
    () => render({label: 'Action', variant: 'cta'})
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
