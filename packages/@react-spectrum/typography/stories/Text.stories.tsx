import React from 'react';
import {storiesOf} from '@storybook/react';
import {Text, TextProps} from '../';

storiesOf('Text', module)
  .add(
    'default',
    () => render()
  );

function render(props:TextProps = {} as any) {
  return (
    <Text {...props}>
      Hello
    </Text>
  );
}
