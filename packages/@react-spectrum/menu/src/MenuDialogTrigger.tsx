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
import {MenuDialogContext, useMenuStateContext} from './context';
import {Modal, Popover} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import {useOverlayTriggerState} from '@react-stately/overlays';

export interface SpectrumMenuDialogTriggerProps<T> extends ItemProps<T> {
  isUnavailable?: boolean,
  targetKey: Key
}

function MenuDialogTrigger<T>(props: SpectrumMenuDialogTriggerProps<T>): ReactElement {
  let {isUnavailable} = props;

  let {state: menuState} = useMenuStateContext();
  let state = useOverlayTriggerState({isOpen: menuState.expandedKeys.has(props.targetKey), onOpenChange: (val) => {
    if (!val) {
      if (menuState.expandedKeys.has(props.targetKey)) {
        menuState.toggleKey(props.targetKey);
      }
    }
  }});
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
  let triggerRef = useRef<HTMLLIElement>(null);
  return (
    <>
      <MenuDialogContext.Provider value={{isUnavailable, triggerRef}}>{trigger}</MenuDialogContext.Provider>
      <SlotProvider slots={slots}>
        {
          isMobile ? (
            <Modal state={state} isDismissable>
              <DismissButton onDismiss={state.close} />
              {content}
              <DismissButton onDismiss={state.close} />
            </Modal>
          ) : (
            <Popover state={state} triggerRef={triggerRef} placement="end top" hideArrow offset={-10} isNonModal shouldContainFocus={false}>{content}</Popover>
          )
        }
      </SlotProvider>
    </>
  );
}

MenuDialogTrigger.getCollectionNode = function* getCollectionNode<T>(props: ItemProps<T>) {
  let [trigger] = React.Children.toArray(props.children) as ReactElement[];
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props, hasChildItems: true}),
    wrapper: (element) => (
      <MenuDialogTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </MenuDialogTrigger>
    )
  };
};

let _Item = MenuDialogTrigger as <T>(props: ItemProps<T> & {isUnavailable?: boolean}) => JSX.Element;
export {_Item as MenuDialogTrigger};
