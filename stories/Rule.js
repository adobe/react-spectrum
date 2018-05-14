import Heading from '../src/Heading';
import React from 'react';
import Rule from '../src/Rule';
import {storiesOf} from '@storybook/react';
import {VerticalCenter} from '../.storybook/layout';

storiesOf('Rule', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    () => (
      <section>
        <Heading variant="subtitle1">Main Section</Heading>
        <Rule />
        <p>Body text</p>
      </section>
    ),
    {inline: true}
  );
