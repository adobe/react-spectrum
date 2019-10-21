import {cleanup, render} from '@testing-library/react';
import {fireEvent} from '@testing-library/react';
import React from 'react';
import {Tag, TagGroup} from '../src';

describe('TagGroup', function () {
  let onRemoveSpy = jest.fn();

  afterEach(() => {
    cleanup();
    onRemoveSpy.mockClear();
  });

  it('provides context for Tag component', function () {
    let {container} = render(
      <TagGroup isRemovable onRemove={onRemoveSpy}>
        <div>
          <Tag>Tag 1</Tag>
        </div>
        <div>
          <Tag>Tag 2</Tag>
        </div>
        <div>
          <Tag>Tag 3</Tag>
        </div>
      </TagGroup>
    );
    let tags = container.querySelectorAll('[role=\'row\'');
    expect(tags.length).toBe(3);

    fireEvent.keyDown(tags[1], {key: 'Delete'});
    expect(onRemoveSpy).toHaveBeenCalledWith(['Tag 2']);
  });
});
