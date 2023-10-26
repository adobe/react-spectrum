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
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useOverlayTriggerState} from '@react-stately/overlays';

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
  let {isUnavailable} = props;

  let triggerRef = useRef<HTMLLIElement>(null);
  let popoverRef = useRef(null);
  let {state: menuState, container, menu} = useMenuStateContext();
  let state = useOverlayTriggerState({isOpen: menuState.expandedKeys.has(props.targetKey), onOpenChange: (val) => {
    if (!val) {
      if (menuState.expandedKeys.has(props.targetKey)) {
        menuState.toggleKey(props.targetKey);
      }
    }
  }});
  let isMobile = useIsMobileDevice();
  let slots = {};
  if (isUnavailable) {
    slots = {
      dialog: {UNSAFE_className: classNames(helpStyles, 'react-spectrum-ContextualHelp-dialog', classNames(styles, !isMobile ? 'spectrum-Menu-subdialog' : ''))},
      content: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-content']},
      footer: {UNSAFE_className: helpStyles['react-spectrum-ContextualHelp-footer']}
    };
  }
  let [trigger] = React.Children.toArray(props.children);
  let [, content] = props.children as [ReactElement, ReactElement];

  let onExit = () => {
    // if focus was already moved back to a menu item, don't need to do anything
    if (!menu.current.contains(document.activeElement)) {
      // need to return focus to the trigger because hitting Esc causes focus to go to the subdialog, which is then unmounted
      // this leads to blur never being fired nor focus on the body
      triggerRef.current.focus();
    }
  };
  let onBlurWithin = (e) => {
    if (e.relatedTarget && popoverRef.current && !popoverRef.current?.UNSAFE_getDOMNode().contains(e.relatedTarget)) {
      if (menuState.expandedKeys.has(props.targetKey)) {
        menuState.toggleKey(props.targetKey);
      }
    }
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
            <Popover
              UNSAFE_style={{clipPath: 'unset', overflow: 'visible', filter: 'unset', borderWidth: '0px'}}
              onExit={onExit}
              onBlurWithin={onBlurWithin}
              container={container.current}
              state={state}
              ref={popoverRef}
              triggerRef={triggerRef}
              placement="end top"
              offset={-10}
              hideArrow
              isNonModal
              enableBothDismissButtons
              disableFocusManagement>
              {content}
            </Popover>
          )
        }
      </SlotProvider>
    </>
  );
}

ContextualHelpTrigger.getCollectionNode = function* getCollectionNode<T>(props: ItemProps<T>) {
  let [trigger] = React.Children.toArray(props.children) as ReactElement[];
  let [, content] = props.children as [ReactElement, ReactElement];

  yield {
    element: React.cloneElement(trigger, {...trigger.props, hasChildItems: true}),
    wrapper: (element) => (
      <ContextualHelpTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </ContextualHelpTrigger>
    )
  };
};

let _Item = ContextualHelpTrigger as (props: SpectrumMenuDialogTriggerProps) => JSX.Element;
export {_Item as ContextualHelpTrigger};
