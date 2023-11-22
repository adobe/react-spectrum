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

import {classNames, SlotProvider, unwrapDOMRef, useIsMobileDevice} from '@react-spectrum/utils';
import {FocusScope} from '@react-aria/focus';
import {getInteractionModality} from '@react-aria/interactions';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
import {ItemProps, Key} from '@react-types/shared';
import {Popover} from '@react-spectrum/overlays';
import React, {ReactElement, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {SubmenuTriggerContext, useMenuStateContext} from './context';
import {TrayHeaderWrapper} from './Menu';
import {UNSTABLE_useSubmenuTrigger} from '@react-aria/menu';
import {UNSTABLE_useSubmenuTriggerState} from '@react-stately/menu';
import {useLayoutEffect} from '@react-aria/utils';

interface MenuDialogTriggerProps {
  /** Whether the menu item is currently unavailable. */
  isUnavailable?: boolean,
  /** The triggering Item and the Dialog, respectively. */
  children: [ReactElement, ReactElement]
}

interface InternalMenuDialogTriggerProps extends MenuDialogTriggerProps {
  targetKey: Key
}

export interface SpectrumMenuDialogTriggerProps extends MenuDialogTriggerProps {}

function ContextualHelpTrigger(props: InternalMenuDialogTriggerProps): ReactElement {
  let {isUnavailable = false, targetKey} = props;

  let triggerRef = useRef<HTMLLIElement>(null);
  let popoverRef = useRef(null);
  let {popoverContainerRef, trayContainerRef, rootMenuTriggerState, menu: parentMenuRef, state} = useMenuStateContext();
  let triggerNode = state.collection.getItem(targetKey);
  let submenuTriggerState = UNSTABLE_useSubmenuTriggerState({triggerKey: targetKey}, {...rootMenuTriggerState, ...state});
  let submenuRef = unwrapDOMRef(popoverRef);
  let {submenuTriggerProps, popoverProps} = UNSTABLE_useSubmenuTrigger({
    node: triggerNode,
    parentMenuRef,
    submenuRef,
    type: 'dialog',
    isDisabled: !isUnavailable
  }, submenuTriggerState, triggerRef);
  let isMobile = useIsMobileDevice();
  let slots = {};
  if (isUnavailable) {
    slots = {
      dialog: {
        UNSAFE_className: classNames(
          helpStyles,
          'react-spectrum-ContextualHelp-dialog',
          {
            'react-spectrum-ContextualHelp-dialog--isMobile': isMobile
          },
          classNames(
            styles,
            {
              'spectrum-Menu-subdialog': !isMobile
            }
          )
        )
      },
      content: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-content']},
      footer: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-footer']}
    };
  }
  let [trigger] = React.Children.toArray(props.children);
  let [, content] = props.children as [ReactElement, ReactElement];

  let onBlurWithin = (e) => {
    if (e.relatedTarget && popoverRef.current && (!popoverRef?.current?.UNSAFE_getDOMNode()?.contains(e.relatedTarget) && !(e.relatedTarget === triggerRef.current && getInteractionModality() === 'pointer'))) {
      if (submenuTriggerState.isOpen) {
        submenuTriggerState.close();
      }
    }
  };

  let overlay;
  let tray;
  let onBackButtonPress = () => {
    submenuTriggerState.close();
    if (parentMenuRef.current && !parentMenuRef.current.contains(document.activeElement)) {
      parentMenuRef.current.focus();
    }
  };
  let [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    if (parentMenuRef.current) {
      setOffset(-1 * parseInt(window?.getComputedStyle(parentMenuRef?.current).getPropertyValue('--spectrum-submenu-offset-distance-x'), 10));
    }
  }, [parentMenuRef]);

  if (isMobile) {
    delete submenuTriggerProps.onBlur;
    delete submenuTriggerProps.onHoverChange;
    if (trayContainerRef.current && submenuTriggerState.isOpen) {
      let subDialogKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case 'Escape':
            e.stopPropagation();
            onBackButtonPress();
            break;
        }
      };

      tray = (
        <TrayHeaderWrapper
          isSubmenu
          parentMenuTreeState={state}
          rootMenuTriggerState={rootMenuTriggerState}
          wrapperKeyDown={subDialogKeyDown}
          onBackButtonPress={onBackButtonPress}>
          {content}
        </TrayHeaderWrapper>
      );

      overlay = ReactDOM.createPortal(tray, trayContainerRef.current);
    }
  } else {
    let onDismissButtonPress = () => {
      submenuTriggerState.close();
      parentMenuRef.current?.focus();
    };

    overlay = (
      <Popover
        {...popoverProps}
        UNSAFE_style={{clipPath: 'unset', overflow: 'visible', filter: 'unset', borderWidth: '0px'}}
        UNSAFE_className={classNames(styles, 'spectrum-Submenu-popover')}
        onDismissButtonPress={onDismissButtonPress}
        onBlurWithin={onBlurWithin}
        container={popoverContainerRef.current}
        state={submenuTriggerState}
        ref={popoverRef}
        triggerRef={triggerRef}
        placement="end top"
        containerPadding={0}
        crossOffset={offset - 1}
        offset={offset}
        hideArrow
        enableBothDismissButtons>
        <FocusScope restoreFocus>
          {content}
        </FocusScope>
      </Popover>
    );
  }

  return (
    <>
      <SubmenuTriggerContext.Provider value={{isUnavailable, triggerRef, ...submenuTriggerProps}}>{trigger}</SubmenuTriggerContext.Provider>
      <SlotProvider slots={slots}>
        {submenuTriggerState.isOpen && overlay}
      </SlotProvider>
    </>
  );
}

ContextualHelpTrigger.getCollectionNode = function* getCollectionNode<T>(props: ItemProps<T>) {
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
      <ContextualHelpTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </ContextualHelpTrigger>
    )
  };
};

let _Item = ContextualHelpTrigger as (props: SpectrumMenuDialogTriggerProps) => React.JSX.Element;
export {_Item as ContextualHelpTrigger};
