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

import {ActionButton} from '@react-spectrum/button';
import ArrowDownSmall from '@spectrum-icons/ui/ArrowDownSmall';
import {classNames, useDOMRef, useIsMobileDevice, useStyleProps} from '@react-spectrum/utils';
import {DOMRef} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {MenuContext, MenuStateContext, useMenuStateContext} from './context';
import {MenuItem} from './MenuItem';
import {MenuSection} from './MenuSection';
import {mergeProps, useLayoutEffect, useSlotId, useSyncRef} from '@react-aria/utils';
import React, {ReactElement, useContext, useRef, useState} from 'react';
import {SpectrumMenuProps} from '@react-types/menu';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useMenu} from '@react-aria/menu';
import {useTreeState} from '@react-stately/tree';

function Menu<T extends object>(props: SpectrumMenuProps<T>, ref: DOMRef<HTMLDivElement>) {
  let isSubmenu = true;
  let contextProps = useContext(MenuContext);
  let parentMenuContext = useMenuStateContext();
  let {rootMenuTriggerState, state: parentMenuTreeState} = parentMenuContext || {};
  if (!parentMenuContext) {
    rootMenuTriggerState = contextProps.state;
    isSubmenu = false;
  }
  let completeProps = {
    ...mergeProps(contextProps, props)
  };
  let domRef = useDOMRef(ref);
  let popoverContainerRef = useRef(null);
  let trayContainerRef = useRef(null);
  let state = useTreeState(completeProps);
  let submenuRef = useRef<HTMLDivElement>(null);
  let {menuProps} = useMenu(completeProps, state, domRef);
  let {styleProps} = useStyleProps(completeProps);
  useSyncRef(contextProps, domRef);
  let [leftOffset, setLeftOffset] = useState({left: 0});
  useLayoutEffect(() => {
    let {left} = popoverContainerRef.current.getBoundingClientRect();
    setLeftOffset({left: -1 * left});
  }, []);

  let menuLevel = contextProps.level || 0;
  let hasOpenSubmenu = state.collection.getItem(rootMenuTriggerState?.UNSTABLE_expandedKeysStack[menuLevel]) != null;
  // TODO: add slide transition
  return (
    <MenuStateContext.Provider value={{popoverContainerRef, trayContainerRef, menu: domRef, submenu: submenuRef, rootMenuTriggerState, state}}>
      <div ref={trayContainerRef} />
      <FocusScope>
        <TrayHeaderWrapper
          onBackButtonPress={contextProps.onBackButtonPress}
          hasOpenSubmenu={hasOpenSubmenu}
          isSubmenu={isSubmenu}
          parentMenuTreeState={parentMenuTreeState}
          rootMenuTriggerState={rootMenuTriggerState}>
          <div
            {...menuProps}
            style={mergeProps(styleProps.style, menuProps.style)}
            ref={domRef}
            className={
              classNames(
                styles,
                'spectrum-Menu',
                styleProps.className
              )
            }>
            {[...state.collection].map(item => {
              if (item.type === 'section') {
                return (
                  <MenuSection
                    key={item.key}
                    item={item}
                    state={state}
                    onAction={completeProps.onAction} />
                );
              }

              let menuItem = (
                <MenuItem
                  key={item.key}
                  item={item}
                  state={state}
                  onAction={completeProps.onAction} />
              );

              if (item.wrapper) {
                menuItem = item.wrapper(menuItem);
              }

              return menuItem;
            })}
          </div>
        </TrayHeaderWrapper>
        {/* Make the portal container for submenus wide enough so that the submenu items can render as wide as they need to be */}
        <div ref={popoverContainerRef} style={{width: '100vw', position: 'absolute', top: -5, ...leftOffset}} />
      </FocusScope>
    </MenuStateContext.Provider>
  );
}

export function TrayHeaderWrapper(props) {
  let {children, isSubmenu, hasOpenSubmenu, parentMenuTreeState, rootMenuTriggerState, onBackButtonPress, wrapperKeyDown} = props;
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let backButtonText = parentMenuTreeState?.collection.getItem(rootMenuTriggerState?.UNSTABLE_expandedKeysStack.slice(-1)[0])?.textValue;
  let backButtonLabel = stringFormatter.format('backButton', {
    prevMenuButton: backButtonText
  });
  let headingId = useSlotId();
  let isMobile = useIsMobileDevice();
  let {direction} = useLocale();

  return (
    <div style={{display: 'flex', overflow: 'hidden'}} role="presentation" onKeyDown={wrapperKeyDown}>
      <div
        role={headingId ? 'dialog' : undefined}
        aria-labelledby={headingId}
        aria-hidden={isMobile && hasOpenSubmenu}
        className={
          classNames(
            styles,
            'spectrum-Menu-wrapper',
            {
              'spectrum-Menu-trayWrapper': isMobile,
              'is-expanded': hasOpenSubmenu
            }
          )
        }>
        {isMobile && isSubmenu && !hasOpenSubmenu && (
          <div className={classNames(styles, 'spectrum-Submenu-headingWrapper')}>
            <ActionButton
              aria-label={backButtonLabel}
              isQuiet
              onPress={onBackButtonPress}>
              {/* We don't have a ArrowLeftSmall so make due with ArrowDownSmall and transforms */}
              {direction === 'rtl' ? <ArrowDownSmall UNSAFE_style={{rotate: '270deg'}} /> : <ArrowDownSmall UNSAFE_style={{rotate: '90deg'}} />}
            </ActionButton>
            <h1 id={headingId} className={classNames(styles, 'spectrum-Submenu-heading')}>{backButtonText}</h1>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * Menus display a list of actions or options that a user can choose.
 */
// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _Menu = React.forwardRef(Menu) as <T>(props: SpectrumMenuProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_Menu as Menu};
