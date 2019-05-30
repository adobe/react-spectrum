import {action} from '@storybook/addon-actions';
import {chain} from '../src/utils/events';
import Link from '../src/Link';
import React from 'react';
import {storiesOf} from '@storybook/react';

const preventDefault = e => e.preventDefault();

storiesOf('Link', module)
  .add(
    'Default',
    () => render({href: 'https://github.com/adobe/react-spectrum'})
  )
  .add(
    'Quiet',
    () => render({variant: 'quiet', href: 'https://github.com/adobe/react-spectrum'})
  )
  .add(
    'Over background',
    () => (
      <div style={{backgroundColor: 'rgb(15, 121, 125)', color: 'rgb(15, 121, 125)', padding: '15px 20px', display: 'inline-block'}}>
        {render({variant: 'overBackground', href: 'https://github.com/adobe/react-spectrum'})}
      </div>
    )
  )
  .add(
    'onClick with no href attribute',
    () => render({onClick: action('clicked href === undefined')})
  );

function render(props = {}) {
  if (!props.onClick) {
    const actionHandler = chain(preventDefault, action(`clicked href === "${props.href}"`));
    props.onClick = actionHandler;
  }
  return (<Link {...props}>This is a React Spectrum Link</Link>);
}
