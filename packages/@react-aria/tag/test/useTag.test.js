import {Item} from '@react-stately/collections';
import {pointerMap, render} from '@react-spectrum/test-utils-internal';
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

describe('useTag', function () {
  let user;
  beforeAll(() => {
    user = userEvent.setup({delay: null, pointerMap});
  });

  it('should have tabIndex -1 when tag is disabled', async () => {
    let {getAllByRole} = render(
      <TagGroup
        label="Amenities"
        disabledKeys={['parking']}>
        <Item key="laundry">Laundry</Item>
        <Item key="parking">Parking</Item>
        <Item key="pool">Swimming pool</Item>
      </TagGroup>
    );

    let tags = getAllByRole('row');
    
    // Non-disabled tag should have tabIndex 0
    expect(tags[0]).toHaveAttribute('tabIndex', '0');
    
    // Disabled tag should have tabIndex -1
    expect(tags[1]).toHaveAttribute('tabIndex', '-1');
    
    // Non-disabled tag should have tabIndex 0
    expect(tags[2]).toHaveAttribute('tabIndex', '0');
  });

  it('should skip disabled tag when navigating with keyboard', async () => {
    let {getAllByRole} = render(
      <TagGroup
        label="Amenities"
        disabledKeys={['parking']}>
        <Item key="laundry">Laundry</Item>
        <Item key="parking">Parking</Item>
        <Item key="pool">Swimming pool</Item>
      </TagGroup>
    );

    let tags = getAllByRole('row');
    
    // Focus the grid
    await user.tab();
  
    // First tag should be focused initially
    expect(tags[0]).toHaveFocus();

    // Press right arrow to move to next focusable tag
    await user.keyboard('{ArrowRight}');
    
    // Should skip disabled tag and focus the third tag
    expect(tags[2]).toHaveFocus();
  });
});
