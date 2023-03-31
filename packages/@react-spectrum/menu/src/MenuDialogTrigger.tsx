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
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
import {ItemProps} from '@react-types/shared';
import {MenuDialogContext, useMenuContext} from './context';
import {Popover, Tray} from '@react-spectrum/overlays';
import React, {Key, ReactElement} from 'react';
import {SpectrumDialogClose} from '@react-types/dialog';
import {useOverlayTriggerState} from '@react-stately/overlays';

function MenuDialogTrigger<T>(props: ItemProps<T> & {isUnavailable?: boolean, targetKey: Key}): ReactElement {
  let {isUnavailable} = props;

  let {state: menuTriggerState} = useMenuContext();
  let state = useOverlayTriggerState({isOpen: menuTriggerState.openKey === props.targetKey, onOpenChange: (val) => {
    if (!val) {
      menuTriggerState.setOpenKey(null);
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
  let [, content] = props.children as [ReactElement, SpectrumDialogClose];

  let isMobile = useIsMobileDevice();
  return (
    <>
      <MenuDialogContext.Provider value={{isUnavailable}}>{trigger}</MenuDialogContext.Provider>
      <SlotProvider slots={slots}>
        {
          isMobile ? (
            <Tray state={state}>
              {content}
            </Tray>
          ) : (
            <Popover state={state} triggerRef={menuTriggerState.openRef} placement="end top" hideArrow offset={-10} isNonModal>{content}</Popover>
          )
        }
      </SlotProvider>
    </>
  );
}

MenuDialogTrigger.getCollectionNode = function* getCollectionNode<T>(props: ItemProps<T>) {
  let [trigger] = React.Children.toArray(props.children);
  let [, content] = props.children as [ReactElement, SpectrumDialogClose];

  yield {
    element: trigger,
    wrapper: (element) => (
      <MenuDialogTrigger key={element.key} targetKey={element.key} {...props}>
        {element}
        {content}
      </MenuDialogTrigger>
    )
  };
};

let _Item = MenuDialogTrigger as <T>(props: ItemProps<T>) => JSX.Element;
export {_Item as MenuDialogTrigger};
