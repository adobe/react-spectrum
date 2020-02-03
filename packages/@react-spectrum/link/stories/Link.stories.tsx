import {action} from '@storybook/addon-actions';
import {Link} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Link', module)
  .add(
    'Default',
    () => render({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: primary',
    () => render({variant: 'primary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'variant: overBackground',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})}
      </div>
    )
  )
  .add(
    'isQuiet: true',
    () => render({isQuiet: true, onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'isQuiet: true, variant: secondary',
    () => render({isQuiet: true, variant: 'secondary', onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'children: a',
    () => renderWithChildren({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'onPress',
    () => render({onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
  )
  .add(
    'onClick',
    () => render({onClick: action('deprecatedOnClick'), onPress: action('press'), onPressStart: action('pressstart'), onPressEnd: action('pressend')})
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
