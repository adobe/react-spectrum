'use client';
import {mergeProps} from 'react-aria/mergeProps';
import {useButton} from 'react-aria/useButton';
import {useDisclosure, type AriaDisclosureProps} from 'react-aria/useDisclosure';
import {useFocusRing} from 'react-aria/useFocusRing';
import {useHover} from 'react-aria/useHover';
import {useDisclosureState} from 'react-stately/useDisclosureState';
import {ChevronRight} from 'lucide-react';
import {useRef} from 'react';
import type {ReactNode} from 'react';
import './Disclosure.css';
import './Content.css';

export function Disclosure(props: AriaDisclosureProps & {title?: ReactNode; children?: ReactNode}) {
  let state = useDisclosureState(props);
  let panelRef = useRef<HTMLDivElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
  /*- begin highlight -*/
  let {buttonProps, panelProps} = useDisclosure(props, state, panelRef);
  /*- end highlight -*/
  let {buttonProps: pressProps, isPressed} = useButton(buttonProps, buttonRef);
  let {hoverProps, isHovered} = useHover({});
  let {focusProps, isFocusVisible} = useFocusRing();

  return (
    <div className="react-aria-Disclosure" data-expanded={state.isExpanded || undefined}>
      <h3 className="react-aria-Heading">
        <button
          {...mergeProps(pressProps, hoverProps, focusProps)}
          ref={buttonRef}
          slot="trigger"
          className="disclosure-button"
          data-pressed={isPressed || undefined}
          data-hovered={isHovered || undefined}
          data-focus-visible={isFocusVisible || undefined}
          data-disabled={props.isDisabled || undefined}>
          <ChevronRight size={16} />
          <span>{props.title}</span>
        </button>
      </h3>
      <div {...panelProps} ref={panelRef} className="react-aria-DisclosurePanel">
        <div>{props.children}</div>
      </div>
    </div>
  );
}
