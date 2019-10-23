import {action} from '@storybook/addon-actions';
import React, {useState} from 'react';
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
      <TagGroup>
        <div>
          <Tag isSelected>Tag 1</Tag>
          <Tag isDisabled>Tag 2</Tag>
          <Tag validationState="invalid" isSelected>Tag 3</Tag>
          <Tag isRemovable onRemove={action('onRemove')} isSelected>Tag 3</Tag>
        </div>
      </TagGroup>
    )
  ).add(
    'with announcing',
    () => (
      <WithAnnouncing />
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

function WithAnnouncing() {
  let [tags, setTags] = useState(['Tag']);

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'd') {
      e.preventDefault();
      setTags([...tags, 'New Tag']);
    }
  }
  return (
    <React.Fragment>
      {/*
        // @ts-ignore */}
      <TagGroup onKeyDown={handleKeyDown}>
        {tags.map(t => <Tag>{t}</Tag>)}
      </TagGroup>
    </React.Fragment>
  );
}
