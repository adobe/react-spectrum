/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {classNames, useIsMobileDevice} from '@react-spectrum/utils';
import {MenuContext, MenuDialogContext, useMenuStateContext} from './context';
import {Placement} from '@react-types/overlays';
import {Popover, Tray} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import {SpectrumMenuTriggerProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useMenuTriggerState} from '@react-stately/menu';

// TODO: Change from MenuTrigger, omit 'trigger' since we don't want to support long press on a submenu
interface SpectrumSubMenuTriggerProps extends Omit<SpectrumMenuTriggerProps, 'trigger' | 'isOpen' | 'defaultOpen'> {
  targetKey: Key
}

// TODO: for now, copies MenuTrigger and pulls some stuff from ContextualHelpTrigger. After getting stuff rendering
// evaluate if we could instead just modify MenuTrigger and reuse it
// TODO: Think about if it should reuse the same state MenuTrigger uses or use its own
// how to control it so that only one submenu can be open at once
// TODO: got rid of user provided ref support since it doesn't really make sense for submenus IMO
function SubMenuTrigger(props: SpectrumSubMenuTriggerProps) {
  let triggerRef = useRef<HTMLLIElement>();
  let menuRef = useRef<HTMLUListElement>();
  let {
    children,
    align = 'start',
    shouldFlip = true,
    direction = 'bottom',
    closeOnSelect
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  // TODO: maybe don't need useMenuTriggerState and borrow what ContextualHelpTrigger does
  // If we have each SubMenuTrigger create its own open/close state, then how do we make sure only one menu is open at a single time
  // For now grab the tree state from the parent, decide later if we instead want each level of MenuTrigger to have a state tracking the
  // expanded state of its immediate children and thus enfore that only a single one is open at a time. Each MenuTrigger would then have its own open state
  // enforced by the expandedKeys state of its parent trigger.

  // TODO: Change from MenuTrigger, will need to disable the SubMenuTrigger if disabledKey includes the wrapped item? Test in story
  // Actually already handled in useMenuItem for submenus?
  // let {menuTriggerProps, menuProps} = useMenuTrigger({isDisabled: false}, state, menuTriggerRef);

  let {state: menuState, container, menu: parentMenu} = useMenuStateContext();
  // TODO where does targetKey get set even? Check ContextualHelpTrigger
  // call useMenuTriggerState in place of useOverlayTriggerState since they are basically the same except for focusStrategy
  let state = useMenuTriggerState({isOpen: menuState.expandedKeys.has(props.targetKey), onOpenChange: (val) => {
    if (!val) {
      if (menuState.expandedKeys.has(props.targetKey)) {
        menuState.toggleKey(props.targetKey);
      }
    }
  }});

  // TODO: double check if I really need the below
  let onExit = () => {
    // if focus was already moved back to a menu item, don't need to do anything
    if (!parentMenu.current.contains(document.activeElement)) {
      // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
      // this leads to blur never being fired nor focus on the body
      triggerRef.current.focus();
    }
  };
  // TODO: figure out what this is for
  // let onBlurWithin = (e) => {
  //   if (e.relatedTarget && popoverRef.current && !popoverRef.current?.UNSAFE_getDOMNode().contains(e.relatedTarget)) {
  //     if (menuState.expandedKeys.has(props.targetKey)) {
  //       menuState.toggleKey(props.targetKey);
  //     }
  //   }
  // };

  // TODO: Not calling useMenuTriggerState and useMenuTrigger because we have the submenu open state from the parent menu's expandedKeys
  // and useMenuTrigger introduces some extra keydown handlers that we don't want (arrow down) and useMenuItem will handle that stuff for us


  let initialPlacement: Placement;
  switch (direction) {
    case 'left':
    case 'right':
    case 'start':
    case 'end':
      initialPlacement = `${direction} ${align === 'end' ? 'bottom' : 'top'}` as Placement;
      break;
    case 'bottom':
    case 'top':
    default:
      initialPlacement = `${direction} ${align}` as Placement;
  }

  let isMobile = useIsMobileDevice();
  // TODO: figure out what exactly we need to propagate down
  let menuContext = {
    // TODO: doesn't have menuProps from useMenuTrigger, does it need any? Perhaps autoFocus and aria-labelledBy?
    state,
    ref: menuRef,
    // TODO: don't think we need onClose right now
    // onClose: state.close,
    closeOnSelect,
    // TODO: we don't call useMenuTrigger so need an autofocus value for when the submenu is opened by keyboard/hover/press
    // useMenuItem currently handles opening the submenu, perhaps copy over the pressProps/some of the keydown stuff from useMenuTrigger's implementation
    // and move it to a useSubMenuTrigger hook or modify useMenuTrigger so it can distingush between the typical menuTrigger stuff. Then pass that stuff
    // via context to useMenuItem or have useMenuItem have that logic baked in?
    // autoFocus: state.focusStrategy || true,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : undefined,
    UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile})
  };


  let overlay;
  // TODO: handle tray experience later
  if (isMobile) {
    overlay = (
      <Tray state={state}>
        {menu}
      </Tray>
    );
  } else {
    overlay = (
      <Popover
        // Props from ContextualHelpTrigger implementation
        onExit={onExit}
        // TODO add onBlurWithin and popoverRef once I figure out what it is for
         // ref={popoverRef}
        container={container.current}

        // TODO: for now placement is customizable by user as per discussion, may still need offset
        // placement="end top"
        // offset={-10}
        isNonModal
        enableBothDismissButtons
        disableFocusManagement

        // Props from MenuTriggerImplementation
        UNSAFE_style={{clipPath: 'unset'}}
        state={state}
        triggerRef={triggerRef}
        scrollRef={menuRef}
        placement={initialPlacement}
        hideArrow
        shouldFlip={shouldFlip}>
        {menu}
      </Popover>
    );
  }

  return (
    <>
      {/* TODO rename MenuDialogContext to something more generic */}
      <MenuDialogContext.Provider value={{triggerRef}}>{menuTrigger}</MenuDialogContext.Provider>

      <MenuContext.Provider value={menuContext}>
        {overlay}
      </MenuContext.Provider>
    </>
  );
}

// TODO: update the below props
SubMenuTrigger.getCollectionNode = function* (props: SpectrumSubMenuTriggerProps) {
  let [trigger] = React.Children.toArray(props.children) as ReactElement[];
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props, hasChildItems: true}),
    wrapper: (element) => (
      <SubMenuTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </SubMenuTrigger>
    )
  };
};

let _SubMenuTrigger = SubMenuTrigger as (props: SpectrumSubMenuTriggerProps) => JSX.Element;
export {_SubMenuTrigger as SubMenuTrigger};
