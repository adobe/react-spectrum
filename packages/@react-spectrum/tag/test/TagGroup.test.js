import {cleanup, render} from '@testing-library/react';
import {fireEvent} from '@testing-library/react';
import React from 'react';
import {Tag, TagGroup} from '../src';
import {TagList} from '@react/react-spectrum/TagList';

describe('TagGroup', function () {
  let onRemoveSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onRemoveSpy.mockClear();
  });

  it('provides context for Tag component', function () {
    let {container} = render(
      <TagGroup onRemove={onRemoveSpy}>
        <div>
          <Tag isRemovable>Tag 1</Tag>
        </div>
        <div>
          <Tag isRemovable>Tag 2</Tag>
        </div>
        <div>
          <Tag isRemovable>Tag 3</Tag>
        </div>
      </TagGroup>
    );
    let tags = container.querySelectorAll('[role="row"');
    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledWith(['Tag 2']);
  });

  it.each`
   Name           | Component         | props
   ${'TagGroup'}  | ${TagGroup}       | ${{isReadOnly: true, isRemovable: true, onRemove: onRemoveSpy}}
   ${'TagList'}   | ${TagList}        | ${{readOnly: true, onClose: onRemoveSpy}}
  `('$Name can be read only', ({Component, props}) => {
    let {getByText} = render(
      <Component {...props}>
        <Tag>Tag 1</Tag>
      </Component>
    );
    let tag = getByText('Tag 1');
    fireEvent.keyDown(tag, {key: 'Delete', keyCode: 46});
    expect(onRemoveSpy).not.toHaveBeenCalledWith('Tag 1', expect.anything());
  });

  it.each`
   Name           | Component         | props
   ${'TagGroup'}  | ${TagGroup}       | ${{}}
  `('$Name have correct accessibility roles', ({Component, props}) => {
    let {container, getByText} = render(
      <Component {...props}>
        <Tag>Tag 1</Tag>
      </Component>
    );
    let tagGroup = container.children[0];
    expect(tagGroup).toHaveAttribute('role', 'grid');
    let tag = tagGroup.children[0];
    expect(tag).toHaveAttribute('role', 'row');
    let tagContent = getByText('Tag 1');
    expect(tagContent).toHaveAttribute('role', 'gridcell');
  });
});
