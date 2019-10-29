import {action} from '@storybook/addon-actions';
import React, {useState} from 'react';
import {storiesOf} from '@storybook/react';
import {Tag, TagGroup} from '../src';

storiesOf('TagGroup', module)
  .add(
    'default',
    () => render({})
  ).add(
    'onRemove',
    () => renderWithRemovableTags({
      onRemove: action('onRemove')
    })
  ).add(
    'is Disabled',
    () => render({
      isDisabled: true
    })
  ).add(
    'isReadOnly',
    () => renderWithRemovableTags({
      isReadOnly: true
    })
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

function renderWithRemovableTags(props: any = {}) {
  return (
    <TagGroup {...props}>
      <Tag isRemovable>Cool Tag 1</Tag>
      <Tag isRemovable>Cool Tag 2</Tag>
      <Tag isRemovable>Cool Tag 3</Tag>
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
        {tags.map((t, index) => <Tag key={index}>{t}</Tag>)}
      </TagGroup>
    </React.Fragment>
  );
}
