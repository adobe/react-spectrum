import React from 'react';
import { storiesOf, action } from '@kadira/storybook';

import Accordion from '../Accordion';
import AccordionItem from '../AccordionItem';

storiesOf('Accordion', module)
  .addDecorator(story => (
    <div style={ { textAlign: 'left', margin: '0 100px' } }>
      { story() }
    </div>
  ))
  .add('Default', () => render())
  .add('multiselectable: true', () => render({ multiselectable: true }))
  .add('defaultSelectedKey: 1', () => render({ defaultSelectedKey: '1' }))
  .add('selectedKey: 1', () => render({ selectedKey: '1' }))
  .add('variant: quiet', () => render({ variant: 'quiet' }))
  .add('variant: large', () => render({ variant: 'large' }));

function render(props = {}) {
  return (
    <Accordion { ...props } onChange={ action('onChange') }>
      <AccordionItem header="Header 1">Item 1</AccordionItem>
      <AccordionItem header="Header 2">Item 2</AccordionItem>
    </Accordion>
  );
}
