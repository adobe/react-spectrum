import {action} from '@storybook/addon-actions';
import React from 'react';
import {storiesOf} from '@storybook/react';
import {Tag, TagGroup} from '../src';

storiesOf('TagGroup', module)
  .add(
    'default',
    () => render({})
  ).add(
    'with remove',
    () => render({
      isRemovable: true,
      onRemove: action('onRemove')
    })
  ).add(
    'is Disabled',
    () => render({
      isDisabled: true
    })
  ).add(
    'with child wrapper, disabled',
    () => (
      <TagGroup isDisabled>
        <div>
          <Tag>Tag 1</Tag>
          <Tag isDisabled={false}>Tag 2</Tag>
          <Tag>Tag 3</Tag>
        </div>
      </TagGroup>
    )
  );

function render(props: any = {}) {
  return (
    <TagGroup {...props}>
      <Tag>Cool Tag 1</Tag>
      <Tag>Cool Tag 2</Tag>
      <Tag>Cool Tag 3</Tag>
    </TagGroup>
  );
}
