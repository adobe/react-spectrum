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
import {Key} from '@react-types/shared';
import {MenuContext, SubmenuTriggerContext, useMenuStateContext} from './context';
import {mergeProps} from '@react-aria/utils';
import {Popover} from '@react-spectrum/overlays';
import React, {type JSX, ReactElement, useRef} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useLocale} from '@react-aria/i18n';
import {useSubmenuTrigger} from '@react-aria/menu';
import {useSubmenuTriggerState} from '@react-stately/menu';

interface SubmenuTriggerProps {
  /**
   * The contents of the SubmenuTrigger - an Item and a Menu.
   */
  children: ReactElement<any>[],
  targetKey: Key
}

export interface SpectrumSubmenuTriggerProps extends Omit<SubmenuTriggerProps, 'targetKey'> {}

function SubmenuTrigger(props: SubmenuTriggerProps) {
  let triggerRef = useRef<HTMLDivElement>(null);
  let {
    children,
    targetKey
  } = props;

  let [menuTrigger, menu] = React.Children.toArray(children);
  let {popoverContainer, trayContainerRef, menu: parentMenuRef, submenu: menuRef, rootMenuTriggerState} = useMenuStateContext()!;
  let submenuTriggerState = useSubmenuTriggerState({triggerKey: targetKey}, rootMenuTriggerState!);
  let {submenuTriggerProps, submenuProps, popoverProps} = useSubmenuTrigger({
    parentMenuRef,
    submenuRef: menuRef
  }, submenuTriggerState, triggerRef);
  let isMobile = useIsMobileDevice();
  let onBackButtonPress = () => {
    submenuTriggerState.close();
    if (parentMenuRef.current && !parentMenuRef.current.contains(document.activeElement)) {
      parentMenuRef.current.focus();
    }
  };

  let {direction} = useLocale();
  let mobileSubmenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        if (direction === 'ltr') {
          triggerRef.current?.focus();
        }
        break;
      case 'ArrowRight':
        if (direction === 'rtl') {
          triggerRef.current?.focus();
        }
        break;
    }
  };

  let overlay;

  if (isMobile)  {
    delete submenuTriggerProps.onBlur;
    delete submenuTriggerProps.onHoverChange;
    submenuProps.autoFocus ??= true;
    if (trayContainerRef.current && submenuTriggerState.isOpen) {
      overlay = ReactDOM.createPortal(menu, trayContainerRef.current);
    }
  } else {
    let onDismissButtonPress = () => {
      submenuTriggerState.close();
      parentMenuRef.current?.focus();
    };

    overlay = (
      <Popover
        {...popoverProps}
        onDismissButtonPress={onDismissButtonPress}
        UNSAFE_className={classNames(styles, 'spectrum-Submenu-popover')}
        container={popoverContainer!}
        containerPadding={0}
        enableBothDismissButtons
        UNSAFE_style={{clipPath: 'unset', overflow: 'visible', borderWidth: '0px'}}
        state={submenuTriggerState}
        triggerRef={triggerRef}
        scrollRef={menuRef}
        placement="end top"
        hideArrow>
        {menu}
      </Popover>
    );
  }

  let menuContext = {
    ...mergeProps(submenuProps, {
      ref: menuRef,
      UNSAFE_style: isMobile ? {
        width: '100%',
        maxHeight: 'inherit'
      } : undefined,
      UNSAFE_className: classNames(styles, {'spectrum-Menu-popover': !isMobile}),
      ...(isMobile && {
        onBackButtonPress,
        onKeyDown: mobileSubmenuKeyDown
      })
    })
  };

  return (
    <>
      <SubmenuTriggerContext.Provider value={{triggerRef, ...submenuTriggerProps}}>{menuTrigger}</SubmenuTriggerContext.Provider>
      <MenuContext.Provider value={menuContext}>
        {overlay}
      </MenuContext.Provider>
    </>
  );
}

SubmenuTrigger.getCollectionNode = function* (props: SpectrumSubmenuTriggerProps) {
  let childArray: ReactElement[] = [];
  React.Children.forEach(props.children, child => {
    if (React.isValidElement(child)) {
      childArray.push(child);
    }
  });
  let [trigger] = childArray;
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props as any, hasChildItems: true, isTrigger: true}),
    wrapper: (element) => (
      <SubmenuTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </SubmenuTrigger>
    )
  };
};

let _SubmenuTrigger = SubmenuTrigger as unknown as (props: SpectrumSubmenuTriggerProps) => JSX.Element;
export {_SubmenuTrigger as SubmenuTrigger};
