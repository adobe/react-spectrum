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
import {MenuContext, SubMenuTriggerContext, useMenuStateContext} from './context';
import {Popover} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useSubMenuTrigger} from '@react-aria/menu';
import {useSubMenuTriggerState} from '@react-stately/menu';

// TODO: Add shouldFlip and closeOnSelect if we feel like those should be customizable for SubMenuTrigger
// Other MenuTriggerProps like onOpenChange and positioning stuff have been removed as per discussion
interface SubMenuTriggerProps {
  /**
   * The contents of the SubMenuTrigger - a Item and a Menu.
   */
  children: ReactElement[],
  targetKey: Key
}

export interface SpectrumSubMenuTriggerProps extends Omit<SubMenuTriggerProps, 'targetKey'> {}

// TODO: got rid of user provided ref support since it doesn't really make sense for submenus IMO
function SubMenuTrigger(props: SubMenuTriggerProps) {
  let triggerRef = useRef<HTMLDivElement>();
  let menuRef = useRef<HTMLDivElement>();
  let {
    children,
    targetKey
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  let {popoverContainerRef, trayContainerRef, menu: parentMenuRef, menuTreeState, state} = useMenuStateContext();
  let triggerNode = state.collection.getItem(targetKey);
  let subMenuTriggerState = useSubMenuTriggerState({triggerKey: targetKey}, {...menuTreeState, ...state});
  let {subMenuTriggerProps, subMenuProps, popoverProps, overlayProps} = useSubMenuTrigger({
    node: triggerNode,
    parentMenuRef,
    subMenuRef: menuRef
  }, subMenuTriggerState, triggerRef);
  let isMobile = useIsMobileDevice();
  let onBackButtonPress = () => {
    subMenuTriggerState.close();
    if (parentMenuRef.current && !parentMenuRef.current.contains(document.activeElement)) {
      // TODO: needs a delay for the parent menu in the tray to no longer be display: none
      requestAnimationFrame(() => parentMenuRef.current.focus());
    }
  };

  let overlay;
  if (isMobile)  {
    delete subMenuTriggerProps.onBlur;
    delete subMenuTriggerProps.onHoverChange;
    subMenuProps.autoFocus ??= true;
    if (trayContainerRef.current && subMenuTriggerState.isOpen) {
      // TODO: Will need the same SSR stuff as Overlay? Might not since this trigger should theoretically only be mounted if a parent menu is mounted and thus we aren't in a SSR state
      // TODO: Deleting uneeded handlers for Tray experience since Tray is a Spectrum specific implementation detail
      overlay = ReactDOM.createPortal(menu, trayContainerRef.current);
    }
  } else {
    overlay = (
      <Popover
        {...popoverProps}
        {...overlayProps}
        container={popoverContainerRef.current}
        offset={-10}
        containerPadding={0}
        crossOffset={-5}
        enableBothDismissButtons
        UNSAFE_style={{clipPath: 'unset', overflow: 'visible'}}
        state={subMenuTriggerState}
        triggerRef={triggerRef}
        scrollRef={menuRef}
        placement="end top"
        hideArrow>
        {menu}
      </Popover>
    );
  }

  let menuContext = {
    ...subMenuProps,
    ref: menuRef,
    UNSAFE_style: isMobile ? {
      width: '100%',
      maxHeight: 'inherit'
    } : undefined,
    UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile}),
    ...(isMobile && {
      onBackButtonPress
    })
  };

  return (
    <>
      <SubMenuTriggerContext.Provider value={{triggerRef, ...subMenuTriggerProps}}>{menuTrigger}</SubMenuTriggerContext.Provider>
      <MenuContext.Provider value={menuContext}>
        {overlay}
      </MenuContext.Provider>
    </>
  );
}

SubMenuTrigger.getCollectionNode = function* (props: SpectrumSubMenuTriggerProps) {
  let childArray: ReactElement[] = [];
  React.Children.forEach(props.children, child => {
    if (React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger] = childArray;
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props, hasChildItems: true, isTrigger: true}),
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
