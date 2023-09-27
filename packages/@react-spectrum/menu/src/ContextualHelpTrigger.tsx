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
import {getInteractionModality} from '@react-aria/interactions';
import helpStyles from '@adobe/spectrum-css-temp/components/contextualhelp/vars.css';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ItemProps} from '@react-types/shared';
import {Popover} from '@react-spectrum/overlays';
import React, {Key, ReactElement, useRef} from 'react';
import ReactDOM from 'react-dom';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {SubMenuTriggerContext, useMenuStateContext} from './context';
import {UNSTABLE_useSubMenuTrigger} from '@react-aria/menu';
import {UNSTABLE_useSubMenuTriggerState} from '@react-stately/menu';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

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
  let popoverRef = useRef(null);
  let {popoverContainerRef, trayContainerRef, rootMenuTriggerState, menu: parentMenuRef, state} = useMenuStateContext();
  let triggerNode = state.collection.getItem(targetKey);
  let subMenuTriggerState = UNSTABLE_useSubMenuTriggerState({triggerKey: targetKey}, {...rootMenuTriggerState, ...state});
  let {subMenuTriggerProps, popoverProps, overlayProps} = UNSTABLE_useSubMenuTrigger({
    node: triggerNode,
    parentMenuRef,
    subMenuRef: popoverRef,
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
    if (e.relatedTarget && popoverRef.current && (!popoverRef.current?.UNSAFE_getDOMNode().contains(e.relatedTarget) && !(e.relatedTarget === triggerRef.current && getInteractionModality() === 'pointer'))) {
      if (subMenuTriggerState.isOpen) {
        subMenuTriggerState.close();
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
    subMenuTriggerState.close();
    if (parentMenuRef.current && !parentMenuRef.current.contains(document.activeElement)) {
      // Delay for the parent menu in the tray to no longer be display: none so focus can properly be moved to it
      requestAnimationFrame(() => parentMenuRef.current.focus());
    }
  };

  if (isMobile) {
    if (trayContainerRef.current && subMenuTriggerState.isOpen) {
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
          <div className={classNames(styles, 'spectrum-SubMenu-headerWrapper')}>
            <ActionButton
              aria-label={backButtonLabel}
              isQuiet
              onPress={onBackButtonPress}>
              {/* We don't have a ArrowLeftSmall so make due with ArrowDownSmall and transforms */}
              {direction === 'rtl' ? <ArrowDownSmall UNSAFE_style={{rotate: '270deg'}} /> : <ArrowDownSmall UNSAFE_style={{rotate: '90deg'}} />}
            </ActionButton>
            <span className={classNames(styles, 'spectrum-SubMenu-header')}>{backButtonText}</span>
          </div>
          {content}
        </div>
      );

      overlay = ReactDOM.createPortal(tray, trayContainerRef.current);
    }
  } else {
    overlay = (
      <Popover
        {...popoverProps}
        {...overlayProps}
        onBlurWithin={onBlurWithin}
        container={popoverContainerRef.current}
        state={subMenuTriggerState}
        ref={popoverRef}
        triggerRef={triggerRef}
        placement="end top"
        containerPadding={0}
        crossOffset={-5}
        offset={-10}
        hideArrow
        enableBothDismissButtons>
        {content}
      </Popover>
    );
  }

  return (
    <>
      <SubMenuTriggerContext.Provider value={{isUnavailable, triggerRef, ...subMenuTriggerProps}}>{trigger}</SubMenuTriggerContext.Provider>
      <SlotProvider slots={slots}>
        {overlay}
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
