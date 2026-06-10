'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useTagGroup, useTag, type AriaTagGroupProps} from 'react-aria/useTagGroup';
import {useButton, type AriaButtonProps} from 'react-aria/useButton';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import {X} from 'lucide-react';
import './TagGroup.css';

export function TagGroup(
  props: AriaTagGroupProps<object> & ListProps<object> & {label?: ReactNode}
) {
  // useListState builds the collection and manages selection.
  let ref = useRef<HTMLDivElement>(null);
  let state = useListState(props);
  let {gridProps, labelProps} = useTagGroup(props, state, ref);

  return (
    <div className="react-aria-TagGroup">
      {props.label && (
        <span {...labelProps} className="react-aria-Label">
          {props.label}
        </span>
      )}
      <div {...gridProps} ref={ref} className="react-aria-TagList">
        {[...state.collection].map(item => (
          <Tag key={item.key} item={item} state={state} />
        ))}
      </div>
    </div>
  );
}

function Tag({item, state}: {item: Node<object>; state: ListState<object>}) {
  let ref = useRef<HTMLDivElement>(null);
  let {focusProps, isFocusVisible} = useFocusRing();
  let {
    rowProps,
    gridCellProps,
    removeButtonProps,
    allowsRemoving,
    isSelected,
    isDisabled,
    isPressed
  } = useTag({item}, state, ref);

  return (
    <div
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      className="react-aria-Tag button-base"
      data-selected={isSelected || undefined}
      data-disabled={isDisabled || undefined}
      data-pressed={isPressed || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      {/* display: contents lets the row's flex layout apply to the tag content. */}
      <div {...gridCellProps} style={{display: 'contents'}}>
        {item.rendered}
        {allowsRemoving && <RemoveButton {...removeButtonProps} />}
      </div>
    </div>
  );
}

// The remove button reuses the vanilla `.remove-button` styling, driven by useButton.
function RemoveButton(props: AriaButtonProps) {
  let ref = useRef<HTMLButtonElement>(null);
  let {buttonProps, isPressed} = useButton(props, ref);
  let {hoverProps, isHovered} = useHover({});
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <button
      {...mergeProps(buttonProps, hoverProps, focusProps)}
      ref={ref}
      className="remove-button"
      data-pressed={isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focus-visible={isFocusVisible || undefined}>
      <X />
    </button>
  );
}
