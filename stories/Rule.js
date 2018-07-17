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
  .addWithInfo('Large (Default)',
    () => (
      <section>
        <Heading variant="subtitle1">Large</Heading>
        <Rule />
        <p>Page or Section Titles.</p>
      </section>
    ),
    {inline: true}
  )
  .addWithInfo('Medium',
  () => (
    <section>
      <Heading variant="subtitle2">Medium</Heading>
      <Rule variant="medium" />
      <p>Divide subsections, or divide different groups of elements (between panels, rails, etc.)</p>
    </section>
  ),
  {inline: true}
  )
  .addWithInfo('Small',
  () => (
    <section>
      <Heading variant="subtitle3">Small</Heading>
      <Rule variant="small" />
      <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
    </section>
  ),
  {inline: true}
  );
