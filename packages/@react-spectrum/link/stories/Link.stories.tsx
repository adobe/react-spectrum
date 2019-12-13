import {action} from '@storybook/addon-actions';
import {Link} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Link', module)
  .add(
    'Default',
    () => render({})
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary'})
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground'})}
      </div>
    )
  )
  .add(
    'isQuiet: true',
    () => render({isQuiet: true})
  )
  .add(
    'isQuiet: true, variant: secondary',
    () => render({isQuiet: true, variant: 'secondary'})
  )
  .add(
    'children: a',
    () => renderWithChildren({})
  )
  .add(
    'onPress',
    () => render({onPress: action('press')})
  );

function render(props = {}) {
  return (
    <Link {...props}>
      This is a React Spectrum Link
    </Link>
  );
}

function renderWithChildren(props = {}) {
  return (
    <Link {...props}>
      <a href="//example.com" target="_self">This is a React Spectrum Link</a>
    </Link>
  );
}
