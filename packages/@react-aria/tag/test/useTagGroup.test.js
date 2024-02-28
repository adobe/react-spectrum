/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Item} from '@react-stately/collections';
import {pointerMap, render, within} from '@react-spectrum/test-utils-internal';
import React from 'react';
import {useButton} from '@react-aria/button';
import {useListState} from '@react-stately/list';
import userEvent from '@testing-library/user-event';
import {useTag, useTagGroup} from '../';

function TagGroup(props) {
  let ref = React.useRef(null);
  let state = useListState(props);
  let {gridProps} = useTagGroup(props, state, ref);

  return (
    <div ref={ref} className="tag-group">
      <div {...gridProps}>
        {[...state.collection].map((item) => (
          <Tag
            key={item.key}
            item={item}
            state={state}>
            {item.rendered}
          </Tag>
        ))}
      </div>
    </div>
  );
}

function Tag(props) {
  let {item, state} = props;
  let ref = React.useRef(null);
  let {rowProps, gridCellProps, removeButtonProps, allowsRemoving} = useTag(props, state, ref);

  return (
    <div ref={ref} {...rowProps}>
      <div {...gridCellProps}>
        {item.rendered}
        {allowsRemoving && <Button {...removeButtonProps}>x</Button>}
      </div>
    </div>
  );
}

function Button(props) {
  let ref = React.useRef(null);
  let {buttonProps} = useButton(props, ref);
  return <button {...buttonProps} ref={ref}>{props.children}</button>;
}

describe('useTagGroup', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });
  it('should support selection', async () => {
    let onRemove = jest.fn();
    let {getAllByRole} = render(
      <TagGroup
        label="Amenities"
        selectionMode="multiple"
        defaultSelectedKeys={['parking']}
        onRemove={onRemove}>
        <Item key="laundry">Laundry</Item>
        <Item key="fitness">Fitness center</Item>
        <Item key="parking">Parking</Item>
        <Item key="pool">Swimming pool</Item>
        <Item key="breakfast">Breakfast</Item>
      </TagGroup>
    );

    let tags = getAllByRole('row');
    expect(tags).toHaveLength(5);
    expect(tags[0]).toHaveAttribute('aria-selected', 'false');
    expect(tags[1]).toHaveAttribute('aria-selected', 'false');
    expect(tags[2]).toHaveAttribute('aria-selected', 'true');
    expect(tags[3]).toHaveAttribute('aria-selected', 'false');
    expect(tags[4]).toHaveAttribute('aria-selected', 'false');

    await user.click(tags[3]);
    expect(tags[0]).toHaveAttribute('aria-selected', 'false');
    expect(tags[1]).toHaveAttribute('aria-selected', 'false');
    expect(tags[2]).toHaveAttribute('aria-selected', 'true');
    expect(tags[3]).toHaveAttribute('aria-selected', 'true');
    expect(tags[4]).toHaveAttribute('aria-selected', 'false');

    await user.keyboard('{Backspace}');
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['parking', 'pool']));

    await user.click(tags[0]);
    await user.keyboard('{Backspace}');

    expect(onRemove).toHaveBeenCalledTimes(2);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['laundry', 'parking', 'pool']));

    let button = within(tags[3]).getByRole('button');
    await user.click(button);

    expect(onRemove).toHaveBeenCalledTimes(3);
    expect(onRemove).toHaveBeenLastCalledWith(new Set(['pool']));
  });
});
