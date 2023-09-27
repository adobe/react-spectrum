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

import {classNames, SlotProvider, useIsMobileDevice} from '@react-spectrum/utils';
import {DismissButton} from '@react-aria/overlays';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
import {ItemProps} from '@react-types/shared';
import {Modal, Popover} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import {SubMenuTriggerContext, useMenuStateContext} from './context';
import {UNSTABLE_useSubMenuTrigger} from '@react-aria/menu';
import {UNSTABLE_useSubMenuTriggerState} from '@react-stately/menu';

interface MenuDialogTriggerProps<T> extends ItemProps<T> {
  /** Whether the menu item is currently unavailable. */
  isUnavailable?: boolean,
  /** The triggering Item and the Dialog, respectively. */
  children: [ReactElement, ReactElement],
  targetKey: Key
}

export interface SpectrumMenuDialogTriggerProps<T> extends Omit<MenuDialogTriggerProps<T>, 'targetKey' | 'title' | 'textValue' | 'childItems' | 'hasChildItems'> {}

function ContextualHelpTrigger<T>(props: MenuDialogTriggerProps<T>): ReactElement {
  let {isUnavailable, targetKey} = props;
  let triggerRef = useRef<HTMLLIElement>(null);
  let {popoverContainerRef, menuTreeState, menu: parentMenuRef, state, submenu: submenuRef} = useMenuStateContext();
  let triggerNode = state.collection.getItem(targetKey);
  let subMenuTriggerState = UNSTABLE_useSubMenuTriggerState({triggerKey: targetKey}, {...menuTreeState, ...state});
  let {subMenuTriggerProps, popoverProps, overlayProps} = UNSTABLE_useSubMenuTrigger({
    node: triggerNode,
    parentMenuRef,
    subMenuRef: submenuRef,
    subMenuType: 'dialog',
    isDisabled: !isUnavailable
  }, subMenuTriggerState, triggerRef);
  let slots = {};
  if (isUnavailable) {
    slots = {
      dialog: {UNSAFE_className: classNames(helpStyles, 'react-spectrum-ContextualHelp-dialog')},
      content: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-content']},
      footer: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-footer']}
    };
  }
  let [trigger] = React.Children.toArray(props.children);
  let [, content] = props.children as [ReactElement, ReactElement];

  let isMobile = useIsMobileDevice();
  let onBlurWithin = (e) => {
    if (e.relatedTarget && submenuRef.current && (!submenuRef?.current?.contains(e.relatedTarget) && !(e.relatedTarget === triggerRef.current && getInteractionModality() === 'pointer'))) {
      if (subMenuTriggerState.isOpen) {
        subMenuTriggerState.close();
      }
    }
  };
  return (
    <>
      <SubMenuTriggerContext.Provider value={{isUnavailable, triggerRef, ...subMenuTriggerProps}}>{trigger}</SubMenuTriggerContext.Provider>
      <SlotProvider slots={slots}>
        {
          isMobile ? (
            <Modal state={subMenuTriggerState} isDismissable>
              <DismissButton onDismiss={subMenuTriggerState.close} />
              {content}
              <DismissButton onDismiss={subMenuTriggerState.close} />
            </Modal>
          ) : (
            <Popover
              {...popoverProps}
              {...overlayProps}
              onBlurWithin={onBlurWithin}
              container={popoverContainerRef.current}
              state={subMenuTriggerState}
              scrollRef={submenuRef}
              triggerRef={triggerRef}
              placement="end top"
              containerPadding={0}
              crossOffset={-5}
              offset={-10}
              hideArrow
              enableBothDismissButtons>
              {content}
            </Popover>
          )
        }
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

let _Item = ContextualHelpTrigger as <T>(props: SpectrumMenuDialogTriggerProps<T>) => JSX.Element;
export {_Item as ContextualHelpTrigger};
