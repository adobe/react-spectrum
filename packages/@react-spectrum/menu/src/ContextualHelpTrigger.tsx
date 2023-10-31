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

import {ActionButton} from '@react-spectrum/button';
import ArrowDownSmall from '@spectrum-icons/ui/ArrowDownSmall';
import {classNames, SlotProvider, useIsMobileDevice} from '@react-spectrum/utils';
import {FocusScope} from '@react-aria/focus';
import {getInteractionModality} from '@react-aria/interactions';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ItemProps} from '@react-types/shared';
import {Popover} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {SubmenuTriggerContext, useMenuStateContext} from './context';
import {UNSTABLE_useSubmenuTrigger} from '@react-aria/menu';
import {UNSTABLE_useSubmenuTriggerState} from '@react-stately/menu';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

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
  let {isUnavailable, targetKey} = props;

  let triggerRef = useRef<HTMLLIElement>(null);
  let popoverRef = useRef(null);
  let {popoverContainerRef, trayContainerRef, rootMenuTriggerState, menu: parentMenuRef, state} = useMenuStateContext();
  let triggerNode = state.collection.getItem(targetKey);
  let submenuTriggerState = UNSTABLE_useSubmenuTriggerState({triggerKey: targetKey}, {...rootMenuTriggerState, ...state});
  let {submenuTriggerProps, popoverProps, overlayProps} = UNSTABLE_useSubmenuTrigger({
    node: triggerNode,
    parentMenuRef,
    submenuRef: popoverRef,
    submenuType: 'dialog',
    isDisabled: !isUnavailable
  }, submenuTriggerState, triggerRef);
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

  let onBlurWithin = (e) => {
    if (e.relatedTarget && popoverRef.current && (!popoverRef?.current?.UNSAFE_getDOMNode()?.contains(e.relatedTarget) && !(e.relatedTarget === triggerRef.current && getInteractionModality() === 'pointer'))) {
      if (submenuTriggerState.isOpen) {
        submenuTriggerState.close();
      }
    }
  };

  let overlay;
  let tray;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {direction} = useLocale();
  let backButtonText = state?.collection.getItem(rootMenuTriggerState.UNSTABLE_expandedKeysStack.slice(-1)[0])?.textValue;
  let backButtonLabel = stringFormatter.format('backButton', {
    prevMenuButton: backButtonText
  });
  let onBackButtonPress = () => {
    submenuTriggerState.close();
    if (parentMenuRef.current && !parentMenuRef.current.contains(document.activeElement)) {
      // Delay for the parent menu in the tray to no longer be display: none so focus can properly be moved to it
      requestAnimationFrame(() => parentMenuRef.current.focus());
    }
  };

  if (isMobile) {
    if (trayContainerRef.current && submenuTriggerState.isOpen) {
      // TODO: would be nice to centralize this wrapper div and header so that Menu and ContextualHelpTrigger don't duplicate it
      // TODO: update this so that the back button is a heading and the wrapper is a dialog? Are nested dialogs allowed? Otherwise overwrite the role on
      // the inner dialog via slots? Or maybe just have the dismiss button handle it? Ask accessibility team if having two nested dialogs is a problem
      tray = (
        <div
          className={
            classNames(
              styles,
              'spectrum-Menu-wrapper',
              'spectrum-Menu-trayWrapper'
            )
        }>
          <div className={classNames(styles, 'spectrum-Submenu-headingWrapper')}>
            <ActionButton
              aria-label={backButtonLabel}
              isQuiet
              onPress={onBackButtonPress}>
              {/* We don't have a ArrowLeftSmall so make due with ArrowDownSmall and transforms */}
              {direction === 'rtl' ? <ArrowDownSmall UNSAFE_style={{rotate: '270deg'}} /> : <ArrowDownSmall UNSAFE_style={{rotate: '90deg'}} />}
            </ActionButton>
            <h2 className={classNames(styles, 'spectrum-Submenu-heading')}>{backButtonText}</h2>
          </div>
          {content}
        </div>
      );

      overlay = ReactDOM.createPortal(tray, trayContainerRef.current);
    }
  } else {
    overlay = (
      <Popover
        UNSAFE_style={{clipPath: 'unset', overflow: 'visible', filter: 'unset', borderWidth: '0px'}}
        {...popoverProps}
        {...overlayProps}
        onBlurWithin={onBlurWithin}
        container={popoverContainerRef.current}
        state={submenuTriggerState}
        ref={popoverRef}
        triggerRef={triggerRef}
        placement="end top"
        containerPadding={0}
        crossOffset={-5}
        offset={-10}
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

let _Item = ContextualHelpTrigger as (props: SpectrumMenuDialogTriggerProps) => JSX.Element;
export {_Item as ContextualHelpTrigger};
