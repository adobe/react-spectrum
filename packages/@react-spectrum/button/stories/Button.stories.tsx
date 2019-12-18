import {action} from '@storybook/addon-actions';
import Bell from '@spectrum-icons/workflow/Bell';
import {Button} from '../';
import React from 'react';
import {storiesOf} from '@storybook/react';

storiesOf('Button', module)
  .add(
    'variant: cta',
    () => render({variant: 'cta'})
  )
  .add(
    'with icon',
    () => render({icon: <Bell />, variant: 'primary'})
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
    'variant: primary',
    () => render({variant: 'primary'})
  )
  .add(
    'variant: secondary',
    () => render({variant: 'secondary'})
  )
  .add(
    'variant: negative',
    () => render({variant: 'negative'})
  )
  .add(
    'element: a',
    () => render({elementType: 'a', variant: 'primary'})
  )
  .add(
    'element: a, href: \'//example.com\', target: \'_self\'',
    () => render({elementType: 'a', href: '//example.com', target: '_self', variant: 'primary'})
  );

function render(props: any = {}) {
  return (
    <div>
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}
        {...props}>
        Default
      </Button>
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}
        isDisabled
        {...props}>
        Disabled
      </Button>
      {props.variant !== 'cta' && (
      <Button
        onPress={action('press')}
        onPressStart={action('pressstart')}
        onPressEnd={action('pressend')}
        onHover={action('hover')}
        onHoverStart={action('hoverstart')}
        onHoverEnd={action('hoverend')}
        isQuiet
        {...props}>
        Quiet
      </Button>
      )}
    </div>
  );
}
