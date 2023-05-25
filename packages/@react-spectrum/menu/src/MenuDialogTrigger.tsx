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
import {Modal} from '@react-spectrum/overlays';
import {Popover} from './SubDialogPopover';
import React, {Key, ReactElement, useRef} from 'react';
import {useOverlayTriggerState} from '@react-stately/overlays';

export interface SpectrumMenuDialogTriggerProps<T> extends ItemProps<T> {
  isUnavailable?: boolean,
  targetKey: Key
}

function MenuDialogTrigger<T>(props: SpectrumMenuDialogTriggerProps<T>): ReactElement {
  let {isUnavailable} = props;

  let triggerRef = useRef<HTMLLIElement>(null);
  let {state: menuState, container} = useMenuStateContext();
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

  let onExit = () => {
    // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
    // this leads to blur never being fired nor focus on the body
    triggerRef.current.focus();
  };
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
            <Popover onExit={onExit} container={container.current} state={state} triggerRef={triggerRef} placement="end top" offset={-10} isNonModal shouldContainFocus={false} shouldRestoreFocus={false}>
              {content}
            </Popover>
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
