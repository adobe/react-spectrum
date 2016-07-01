import React from 'react';
import { storiesOf, action } from '@kadira/storybook';
import { VerticalCenter } from '../../.storybook/layout';

import TagList from '../TagList';
import Tag from '../Tag';

storiesOf('TagList', module)
  .addDecorator(story => <VerticalCenter>{ story() }</VerticalCenter>)
  .add('Default', () => render())
  .add('Read Only', () => render({ readonly: true }))
  .add('Disabled', () => render({ disabled: true }))
  .add('Using Values', () => render({ values: [
    'Mango', 'Turtle', 'Noodles', 'Pluto'
  ] }));

function render(props = {}) {
  return (
    <div>
      <TagList
        onClose={ action('close') }
        { ...props }
      >
        <Tag>Tag 1</Tag>
        <Tag>Tag 2</Tag>
        <Tag>Tag 3</Tag>
        <Tag>Tag 4</Tag>
        <Tag>Tag 5</Tag>
        <Tag>Tag 6</Tag>
        <Tag>Tag 7</Tag>
        <Tag>Tag 8</Tag>
        <Tag>Tag 9</Tag>
        <Tag>Tag 10</Tag>
        <Tag>This is a longer tab</Tag>
        <Tag>This is another longer tab</Tag>
      </TagList>
    </div>
  );
}
