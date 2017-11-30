import {action, storiesOf} from '@storybook/react';
import InlineEditor from '../src/InlineEditor';
import React from 'react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('InlineEditor', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', width: '350px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => <InlineEditor defaultValue="test" onChange={action('onChange')} />,
    {inline: true}
  )
  .addWithInfo(
    'disabled',
    () => <InlineEditor defaultValue="test" disabled onChange={action('onChange')} />,
    {inline: true}
  )
  .addWithInfo(
    'controlled',
    () => <InlineEditor value="test" onChange={action('onChange')} />,
    {inline: true}
  );
