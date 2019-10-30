import {chain, useId} from '@react-aria/utils';
import {Overlay} from '@react-spectrum/overlays';
import {useOverlayPosition, useOverlayTrigger} from '@react-aria/overlays';
import {PressResponder} from '@react-aria/interactions';
import React, {Fragment, useRef, ReactElement} from 'react';
import {useControlledState} from '@react-stately/utils';


export interface MenuTriggerProps {
  children: ReactElement,
  trigger: 'press' | 'longPress',
  align?: 'start' | 'end',
  direction?: 'bottom' | 'top', // left right?
  isOpen?: boolean,
  defaultOpen?: boolean,
  onOpenChange?: (isOpen: boolean) => void,
  // The below aren't in the dropbox doc
  onToggle?: () => void, 
  shouldFlip?: boolean,
  onSelect?: (...args) => void
}

// Things todo:
// Address RTL: ex: if align
// Add Accessibility from v2 Dropdown (onClick/onPress, onKeyDownTrigger)
// Add accessibility behavior like keyboard interaction focus stuff, roles and stuff
// All here: https://github.com/adobe/react-spectrum-v3/pull/25/files?short_path=7f28627#diff-7f286272a2fabd4d97fd8b3a9950550d


export function MenuTrigger(props: MenuTriggerProps) {
  let containerRef = useRef<HTMLDivElement>();
  let menuRef = useRef<HTMLElement>();
  let menuTriggerRef = useRef<HTMLElement>();
  let {
    children,
    trigger = "press", // TODO: actually use this prop when longPress is implemented
    onToggle,
    align = "start", // Should this be "start" or "end" by default? 
    shouldFlip,
    direction = "bottom",
    ...otherProps
  } = props;
  
  // Split into menuTrigger and menu
  let [menuTrigger, menu] = React.Children.toArray(children);
  
  // TODO: move id generation and all the aria stuff into a MenuTrigger aria hook if I don't end up using 
  // useOverlayTrigger + modifications
  let menuId = useId(menu.props.id);
  let menuTriggerId = useId(menuTrigger.props.id);
 
  // TODO outofscope: handle mobile, but see DialogTrigger for inspiration

  // Initialize "open" state (controlled vs uncontrolled), default closed
  let [isOpen, setOpen] = useControlledState(props.isOpen, props.defaultOpen || false, props.onToggle);

  // Press handler for menuTrigger
  let onPress = (e) => {
    // Forced to do this check since onPress triggers on Enter/Space, any other way to get around it?
    // Not entirely sure how to handle the onPress stuff and keyboard commands, how do I get the arrow commands to 
    // trigger onPress stuff?
    if (e.pointerType !== 'keyboard') {
      setOpen(!isOpen);
    }
  }

  // menu item selection handler
  // Is this still required/desired? wasn't in the prop list
  let onSelect = (...args) => {
    if (otherProps.onSelect) {
      otherProps.onSelect(...args);
    }
  }

  let onKeyDownTrigger = (e) => {
    if ((typeof e.isDefaultPrevented === 'function' && e.isDefaultPrevented()) || e.defaultPrevented) {
      return;
    }

    if (menuTriggerRef && menuTriggerRef.current) {
      switch (e.key) {
        case 'Enter': 
        case 'ArrowDown':
        case 'ArrowUp':
        case ' ':
          e.preventDefault();
          e.stopPropagation();
          onPress(e);
          // setOpen(!isOpen); // call this instead on onPress?
          break;
      }
    }
  }
  console.log('placement', `${direction} ${align}`)
  let {overlayProps, placement, arrowProps} = useOverlayPosition({
    containerRef,
    targetRef: menuTriggerRef,
    overlayRef: menuRef,
    placement: `${direction} ${align}`, // Legit?
    shouldFlip: shouldFlip,
    isOpen
  })

  // Do I need to use useOverlayTrigger to handle scrolling?
  // I could use it to get the aria triggerProps (will need to add some addition aria-haspopup stuff to it)
  let menuTriggerProps = {
    id: menuTriggerId,
    role: 'button',
    'aria-haspopup': menuTrigger.props['aria-haspopup'] || menu.props.role || 'true', // Double check this logic, can I just do menu.props.role?
    'aria-expanded': isOpen,
    'aria-controls': (isOpen ? menuId : null),
    onKeyDown: chain(menuTrigger.props.onKeyDown, onKeyDownTrigger),  // TODO how to chain with menuTriggers prop.onkeyDown?
    ref: menuTriggerRef
  }

  // Can use cloneElement? Depends on how Menu component will be structured. If it is
  // a Popover containing a ul, then I guess I could use a context so that the popover only gets the positioning bits and
  // the ul gets the id/aria stuff
  // Clone menu and pass positioning props to it and other things (aria role)
  menu = React.cloneElement(menu, {
    ...overlayProps, 
    placement, 
    // arrowProps,
    ref: menuRef,
    onSelect: onSelect,
    id: menuId,
    role: menu.props['role'] || 'menu',
    'aria-labelledby': menu.props['aria-labelledby'] || menuTriggerId
  });
  // console.log('menu', menu);
  // console.log('containerRef', containerRef.current);
  // console.log('menuTriggerRef', menuTriggerRef.current);
  // console.log('menuRef', menuRef.current);
  // console.log('overlayprops e.g. styles', overlayProps);

  return (
    <Fragment>
      <PressResponder
        {...menuTriggerProps}
        onPress={onPress}
        isPressed={isOpen}>
        {menuTrigger}
      </PressResponder>
      <Overlay isOpen={isOpen} ref={containerRef}>
        {menu}
      </Overlay> 
    </Fragment>
  );
};
