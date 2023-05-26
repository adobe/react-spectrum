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
import {AriaLabelingProps, DOMProps, DOMRef, Node, StyleProps} from '@react-types/shared';
import buttonStyles from '@adobe/spectrum-css-temp/components/button/vars.css';
import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';
import {
  classNames,
  ClearSlots,
  SlotProvider,
  useDOMRef,
  useSlotProps,
  useStyleProps
} from '@react-spectrum/utils';
import {filterDOMProps, mergeProps, useId, useLayoutEffect, useResizeObserver, useValueEffect} from '@react-aria/utils';
import {FocusScope} from '@react-aria/focus';
import {Item, Menu, MenuTrigger} from '@react-spectrum/menu';
import {ListState, useListState} from '@react-stately/list';
import More from '@spectrum-icons/workflow/More';
import {PressResponder, useHover} from '@react-aria/interactions';
import {Provider} from '@react-spectrum/provider';
import React, {forwardRef, Key, ReactElement, ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import {SpectrumActionGroupProps} from '@react-types/actiongroup';
import styles from '@adobe/spectrum-css-temp/components/actiongroup/vars.css';
import {Text} from '@react-spectrum/text';
import {Tooltip, TooltipTrigger} from '@react-spectrum/tooltip';
import {useActionGroup} from '@react-aria/actiongroup';
import {useActionGroupItem} from '@react-aria/actiongroup';
import {useProviderProps} from '@react-spectrum/provider';

function ActionGroup<T extends object>(props: SpectrumActionGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useSlotProps(props, 'actionGroup');

  let {
    isEmphasized,
    density,
    isJustified,
    isDisabled,
    orientation = 'horizontal',
    isQuiet,
    staticColor,
    overflowMode = 'wrap',
    onAction,
    buttonLabelBehavior,
    summaryIcon,
    ...otherProps
  } = props;

  let domRef = useDOMRef(ref);
  let wrapperRef = useRef<HTMLDivElement>(null);
  let state = useListState({...props, suppressTextValueWarning: true});
  let {actionGroupProps} = useActionGroup(props, state, domRef);
  let isVertical = orientation === 'vertical';
  let providerProps = {isEmphasized, isDisabled, isQuiet};
  let {styleProps} = useStyleProps(props);

  // Only hide button text if every item contains more than just plain text (we assume an icon).
  let isIconCollapsible = useMemo(() => [...state.collection].every(item => typeof item.rendered !== 'string'), [state.collection]);
  let [{visibleItems, hideButtonText, isMeasuring}, setVisibleItems] = useValueEffect({
    visibleItems: state.collection.size,
    hideButtonText: buttonLabelBehavior === 'hide' && isIconCollapsible,
    isMeasuring: false
  });

  let selectionMode = state.selectionManager.selectionMode;
  let updateOverflow = useCallback(() => {
    if (overflowMode === 'wrap') {
      return;
    }

    if (orientation === 'vertical' && selectionMode !== 'none') {
      // Collapsing vertical action groups with selection is currently unsupported by Spectrum.
      return;
    }

    let computeVisibleItems = (visibleItems: number) => {
      if (domRef.current && wrapperRef.current) {
        let listItems = Array.from(domRef.current.children) as HTMLLIElement[];
        let containerSize = orientation === 'horizontal' ? wrapperRef.current.offsetWidth : wrapperRef.current.offsetHeight;
        let isShowingMenu = visibleItems < state.collection.size;
        let calculatedSize = 0;
        let newVisibleItems = 0;

        if (isShowingMenu) {
          let item = listItems.pop();
          if (item) {
            calculatedSize += orientation === 'horizontal'
              ? outerWidth(item, false, true)
              : outerHeight(item, false, true);
          }
        }

        for (let [i, item] of listItems.entries()) {
          calculatedSize += orientation === 'horizontal'
            ? outerWidth(item, i === 0, i === listItems.length - 1)
            : outerHeight(item, i === 0, i === listItems.length - 1);
          if (calculatedSize <= containerSize) {
            newVisibleItems++;
          } else {
            break;
          }
        }

        // If selection is enabled, and not all of the items fit, collapse all of them into a dropdown
        // immediately rather than having some visible and some not.
        if (selectionMode !== 'none' && newVisibleItems < state.collection.size) {
          return 0;
        }

        return newVisibleItems;
      }
      return visibleItems;
    };

    setVisibleItems(function *() {
      let hideButtonText = buttonLabelBehavior === 'hide' && isIconCollapsible;

      // Update to show all items.
      yield {
        visibleItems: state.collection.size,
        hideButtonText,
        isMeasuring: true
      };

      // Measure, and update to show the items that fit.
      let newVisibleItems = computeVisibleItems(state.collection.size);
      let isMeasuring = newVisibleItems < state.collection.size && newVisibleItems > 0;

      // If not all of the buttons fit, and buttonLabelBehavior is 'collapse', then first try hiding
      // the button text and only showing icons. Only if that still doesn't fit collapse into a menu.
      if (newVisibleItems < state.collection.size && buttonLabelBehavior === 'collapse' && isIconCollapsible) {
        yield {
          visibleItems: state.collection.size,
          hideButtonText: true,
          isMeasuring: true
        };

        newVisibleItems = computeVisibleItems(state.collection.size);
        isMeasuring = newVisibleItems < state.collection.size && newVisibleItems > 0;
        hideButtonText = true;
      }

      yield {
        visibleItems: newVisibleItems,
        hideButtonText,
        isMeasuring
      };

      // If the number of items is less than the number of children,
      // then update again to ensure that the menu fits.
      if (isMeasuring) {
        yield {
          visibleItems: computeVisibleItems(newVisibleItems),
          hideButtonText,
          isMeasuring: false
        };
      }
    });
  }, [domRef, state.collection, setVisibleItems, overflowMode, selectionMode, buttonLabelBehavior, isIconCollapsible, orientation]);

  // Watch the parent element for size changes. Watching only the action group itself may not work
  // in all scenarios because it may not shrink when available space is reduced.
  let parentRef = useMemo(() => ({
    get current() {
      return wrapperRef.current?.parentElement;
    }
  }), [wrapperRef]);
  useResizeObserver({ref: overflowMode !== 'wrap' ? parentRef : undefined, onResize: updateOverflow});
  useLayoutEffect(updateOverflow, [updateOverflow, state.collection]);

  let children = [...state.collection];
  let menuItem: ReactElement | null = null;
  let menuProps = {};

  // If there are no visible items, don't apply any props to the action group container
  // and pass all aria labeling props through to the menu button.
  if (overflowMode === 'collapse' && visibleItems === 0) {
    menuProps = filterDOMProps(props, {labelable: true});
    actionGroupProps = {};
  }

  if (overflowMode === 'collapse' && visibleItems < state.collection.size) {
    let menuChildren = children.slice(visibleItems);
    children = children.slice(0, visibleItems);
    menuItem = (
      <ActionGroupMenu
        {...menuProps}
        items={menuChildren}
        onAction={onAction}
        isDisabled={isDisabled}
        isEmphasized={isEmphasized}
        staticColor={staticColor}
        state={state}
        summaryIcon={summaryIcon}
        hideButtonText={hideButtonText}
        isOnlyItem={visibleItems === 0}
        orientation={orientation} />
    );
  }

  let style = {
    ...styleProps.style,
    // While measuring, take up as much space as possible.
    flexBasis: isMeasuring ? '100%' : undefined
  };

  return (
    <FocusScope>
      <div {...styleProps} style={style} className={classNames(styles, 'flex-container', styleProps.className)} ref={wrapperRef}>
        <div
          {...actionGroupProps}
          ref={domRef}
          className={
            classNames(
              styles,
              'flex-gap',
              'spectrum-ActionGroup',
              {
                'spectrum-ActionGroup--quiet': isQuiet,
                'spectrum-ActionGroup--vertical': isVertical,
                'spectrum-ActionGroup--compact': density === 'compact',
                'spectrum-ActionGroup--justified': isJustified && !isMeasuring,
                'spectrum-ActionGroup--overflowCollapse': overflowMode === 'collapse'
              },
              otherProps.UNSAFE_className
            )
          }>
          <Provider {...providerProps}>
            {children.map((item) => (
              <ActionGroupItem
                key={item.key}
                onAction={onAction}
                isDisabled={isDisabled}
                isEmphasized={isEmphasized}
                staticColor={staticColor}
                item={item}
                state={state}
                hideButtonText={hideButtonText}
                orientation={orientation} />
            ))}
            {menuItem}
          </Provider>
        </div>
      </div>
    </FocusScope>
  );
}

/**
 * An ActionGroup is a grouping of ActionButtons that are related to one another.
 */
const _ActionGroup = forwardRef(ActionGroup) as <T>(props: SpectrumActionGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_ActionGroup as ActionGroup};

interface ActionGroupItemProps<T> extends DOMProps, StyleProps {
  item: Node<T>,
  state: ListState<T>,
  isDisabled?: boolean,
  isEmphasized?: boolean,
  staticColor?: 'white' | 'black',
  hideButtonText?: boolean,
  orientation?: 'horizontal' | 'vertical',
  onAction?: (key: Key) => void
}

function ActionGroupItem<T>({item, state, isDisabled, isEmphasized, staticColor, onAction, hideButtonText, orientation}: ActionGroupItemProps<T>) {
  let ref = useRef(null);
  let {buttonProps} = useActionGroupItem({key: item.key}, state);
  isDisabled = isDisabled || state.disabledKeys.has(item.key);
  let isSelected = state.selectionManager.isSelected(item.key);
  let {hoverProps, isHovered} = useHover({isDisabled});
  let domProps = filterDOMProps(item.props);

  if (onAction && !isDisabled) {
    buttonProps = mergeProps(buttonProps, {
      onPress: () => onAction(item.key)
    });
  }

  // If button text is hidden, we need to show it as a tooltip instead, so
  // go find the text element in the DOM after rendering.
  let textId = useId();
  let [textContent, setTextContent] = useState<string | null | undefined>('');
  useLayoutEffect(() => {
    if (hideButtonText) {
      setTextContent(document.getElementById(textId)?.textContent);
    }
  }, [hideButtonText, item.rendered, textId]);

  let button = (
    // Use a PressResponder to send DOM props through.
    // ActionButton doesn't allow overriding the role by default.
    <PressResponder {...mergeProps(buttonProps, hoverProps, domProps)}>
      <ClearSlots>
        <SlotProvider
          slots={{
            text: {
              id: hideButtonText ? textId : null,
              isHidden: hideButtonText
            }
          }}>
          <ActionButton
            ref={ref}
            UNSAFE_className={
              classNames(
                styles,
                'spectrum-ActionGroup-item',
                {
                  'is-selected': isSelected,
                  'is-hovered': isHovered,
                  'spectrum-ActionGroup-item--iconOnly': hideButtonText,
                  'spectrum-ActionGroup-item--isDisabled': isDisabled
                },
                classNames(
                  buttonStyles,
                  {
                    'spectrum-ActionButton--emphasized': isEmphasized,
                    'is-selected': isSelected
                  }
                )
              )
            }
            isDisabled={isDisabled}
            staticColor={staticColor}
            aria-label={item['aria-label']}
            aria-labelledby={item['aria-label'] == null && hideButtonText ? textId : undefined}>
            {item.rendered}
          </ActionButton>
        </SlotProvider>
      </ClearSlots>
    </PressResponder>
  );

  if (hideButtonText && textContent) {
    button = (
      <TooltipTrigger placement={orientation === 'vertical' ? 'end' : 'top'}>
        {button}
        <Tooltip>{textContent}</Tooltip>
      </TooltipTrigger>
    );
  }

  if (item.wrapper) {
    button = item.wrapper(button);
  }

  return button;
}

interface ActionGroupMenuProps<T> extends AriaLabelingProps {
  state: ListState<T>,
  isDisabled?: boolean,
  isEmphasized?: boolean,
  staticColor?: 'white' | 'black',
  items: Node<T>[],
  hideButtonText?: boolean,
  summaryIcon?: ReactNode,
  isOnlyItem?: boolean,
  orientation?: 'horizontal' | 'vertical',
  onAction?: (key: Key) => void
}

function ActionGroupMenu<T>({state, isDisabled, isEmphasized, staticColor, items, onAction, summaryIcon, hideButtonText, isOnlyItem, orientation, ...otherProps}: ActionGroupMenuProps<T>) {
  // Use the key of the first item within the menu as the key of the button.
  // The key must actually exist in the collection for focus to work correctly.
  let key = items[0].key;
  let {buttonProps} = useActionGroupItem({key}, state);

  // The menu button shouldn't act like an actual action group item.
  delete buttonProps.onPress;
  delete buttonProps.role;
  delete buttonProps['aria-checked'];

  let {hoverProps, isHovered} = useHover({isDisabled});

  // If no aria-label or aria-labelledby is given, provide a default one.
  let ariaLabel = otherProps['aria-label'] || (otherProps['aria-labelledby'] ? undefined : '…');
  let ariaLabelledby = otherProps['aria-labelledby'];
  let textId = useId();
  let id = useId();

  // Summary icon only applies when selection is enabled.
  if (state.selectionManager.selectionMode === 'none') {
    summaryIcon = null;
  }

  let iconOnly = false;

  // If there is a selection, show the selected state on the menu button.
  let isSelected = state.selectionManager.selectionMode !== 'none' && !state.selectionManager.isEmpty;

  // If single selection and empty selection is not allowed, swap the contents of the button to the selected item (like a Picker).
  if (!summaryIcon && state.selectionManager.selectionMode === 'single' && state.selectionManager.disallowEmptySelection && state.selectionManager.firstSelectedKey != null) {
    let selectedItem = state.collection.getItem(state.selectionManager.firstSelectedKey);
    if (selectedItem) {
      summaryIcon = selectedItem.rendered;
      if (typeof summaryIcon === 'string') {
        summaryIcon = <Text>{summaryIcon}</Text>;
      }
      iconOnly = !!hideButtonText;
      ariaLabelledby = `${ariaLabelledby ?? id} ${textId}`;
    }
  }

  if (summaryIcon) {
    // If there's a custom summary icon, also add a chevron.
    summaryIcon = (
      <>
        <ChevronDownMedium UNSAFE_className={classNames(styles, 'spectrum-ActionGroup-menu-chevron')} />
        <span className={classNames(styles, 'spectrum-ActionGroup-menu-contents', {'spectrum-ActionGroup-item--iconOnly': iconOnly})}>
          {summaryIcon}
        </span>
      </>
    );
  }

  return (
    // Use a PressResponder to send DOM props through.
    <MenuTrigger align={isOnlyItem ? 'start' : 'end'} direction={orientation === 'vertical' ? 'end' : 'bottom'}>
      <SlotProvider
        slots={{
          text: {
            id: hideButtonText ? textId : null,
            isHidden: hideButtonText,
            UNSAFE_className: classNames(styles, 'spectrum-ActionGroup-menu-text')
          }
        }}>
        <PressResponder {...mergeProps(buttonProps, hoverProps)}>
          <ActionButton
            {...otherProps}
            id={id}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            UNSAFE_className={
              classNames(
                styles,
                'spectrum-ActionGroup-item',
                'spectrum-ActionGroup-menu',
                {
                  'is-hovered': isHovered,
                  'is-selected': isSelected
                },
                classNames(
                  buttonStyles,
                  {
                    'is-selected': isSelected,
                    'spectrum-ActionButton--emphasized': isEmphasized
                  }
                )
              )
            }
            isDisabled={isDisabled}
            staticColor={staticColor}>
            {summaryIcon || <More />}
          </ActionButton>
        </PressResponder>
      </SlotProvider>
      <Menu
        items={items}
        disabledKeys={state.disabledKeys}
        selectionMode={state.selectionManager.selectionMode}
        selectedKeys={state.selectionManager.selectedKeys}
        disallowEmptySelection={state.selectionManager.disallowEmptySelection}
        onSelectionChange={(keys) => state.selectionManager.setSelectedKeys(keys)}
        onAction={onAction}>
        {node => <Item textValue={node.textValue} {...filterDOMProps(node.props)}>{node.rendered}</Item>}
      </Menu>
    </MenuTrigger>
  );
}

function outerWidth(element: HTMLElement, ignoreLeftMargin: boolean, ignoreRightMargin: boolean) {
  let style = window.getComputedStyle(element);
  return element.offsetWidth + (ignoreLeftMargin ? 0 : toNumber(style.marginLeft)) + (ignoreRightMargin ? 0 : toNumber(style.marginRight));
}


function outerHeight(element: HTMLElement, ignoreTopMargin: boolean, ignoreBottomMargin: boolean) {
  let style = window.getComputedStyle(element);
  return element.offsetHeight + (ignoreTopMargin ? 0 : toNumber(style.marginTop)) + (ignoreBottomMargin ? 0 : toNumber(style.marginBottom));
}

function toNumber(value: string) {
  let parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}
