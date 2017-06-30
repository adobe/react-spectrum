import React from 'react';
import {storiesOf, action} from '@kadira/storybook';
import {VerticalCenter} from '../.storybook/layout';

import {Accordion, AccordionItem} from '../src/Accordion';

storiesOf('Accordion', module)
  .addDecorator(story => (
    <VerticalCenter style={{textAlign: 'left', margin: '0 100px 50px', position: 'static', transform: 'none'}}>
      {story()}
    </VerticalCenter>
  ))
  .addWithInfo(
    'Default',
    'This is the basic usage of the Accordion.',
    () => render(),
    {inline: true}
  )
  .addWithInfo(
    'Multiselectable',
    'This is an Accordion where you can open multiple accordion items.',
    () => render({multiselectable: true}),
    {inline: true}
  )
  .addWithInfo(
    'Default selected index',
    'This is an Accordion where the the second accordion item is opened by default.',
    () => render({defaultSelectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'Selected index',
    'This is a controlled Accordion where the the second accordion item is opened by default.',
    () => render({selectedIndex: 1}),
    {inline: true}
  )
  .addWithInfo(
    'Quiet variant',
    'This is a quiet variant of the Accordion.',
    () => render({variant: 'quiet'}),
    {inline: true}
  )
  .addWithInfo(
    'Large variant',
    'This is a large variant of the Accordion.',
    () => render({variant: 'large'}),
    {inline: true}
  );

function render(props = {}) {
  return (
    <Accordion {...props} onChange={action('onChange')}>
      <AccordionItem header="Header 1">Item 1</AccordionItem>
      <AccordionItem header="Header 2">Item 2</AccordionItem>
    </Accordion>
  );
}
