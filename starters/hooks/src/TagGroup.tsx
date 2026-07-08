'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useTagGroup, useTag, type AriaTagGroupProps} from 'react-aria/useTagGroup';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useListState, type ListProps, type ListState} from 'react-stately/useListState';
import type {Node} from '@react-types/shared';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import {Button} from 'react-aria-components/TagGroup';
import {X} from 'lucide-react';
import './TagGroup.css';

export function TagGroup(
  props: AriaTagGroupProps<object> & ListProps<object> & {label?: ReactNode}
) {
  let ref = useRef<HTMLDivElement>(null);
  let state = useListState(props);
  /*- begin highlight -*/
  let {gridProps, labelProps} = useTagGroup(props, state, ref);
  /*- end highlight -*/

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
        {allowsRemoving && (
          <Button {...removeButtonProps} slot="remove" className="remove-button">
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
