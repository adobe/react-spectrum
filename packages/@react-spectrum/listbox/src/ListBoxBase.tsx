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

import {AriaLabelingProps, DOMProps, FocusStrategy, Node, StyleProps} from '@react-types/shared';
import {classNames, useStyleProps} from '@react-spectrum/utils';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListBoxContext} from './ListBoxContext';
import {ListBoxOption} from './ListBoxOption';
import {ListBoxSection} from './ListBoxSection';
import {ListLayout} from '@react-stately/layout';
import {ListState} from '@react-stately/list';
import {mergeProps} from '@react-aria/utils';
import {ProgressCircle} from '@react-spectrum/progress';
import React, {HTMLAttributes, ReactElement, ReactNode, RefObject, useMemo} from 'react';
import {ReusableView} from '@react-stately/virtualizer';
import styles from '@adobe/spectrum-css-temp/components/menu/vars.css';
import {useCollator, useMessageFormatter} from '@react-aria/i18n';
import {useListBox} from '@react-aria/listbox';
import {useProvider} from '@react-spectrum/provider';
import {Virtualizer, VirtualizerItem} from '@react-aria/virtualizer';

interface ListBoxBaseProps<T> extends DOMProps, AriaLabelingProps, StyleProps {
  layout: ListLayout<T>,
  state: ListState<T>,
  autoFocus?: boolean | FocusStrategy,
  shouldFocusWrap?: boolean,
  shouldSelectOnPressUp?: boolean,
  focusOnPointerEnter?: boolean,
  domProps?: HTMLAttributes<HTMLElement>,
  disallowEmptySelection?: boolean,
  shouldUseVirtualFocus?: boolean,
  transitionDuration?: number,
  isLoading?: boolean,
  onLoadMore?: () => void,
  renderEmptyState?: () => ReactNode
}

/** @private */
export function useListBoxLayout<T>(state: ListState<T>) {
  let {scale} = useProvider();
  let collator = useCollator({usage: 'search', sensitivity: 'base'});
  let layout = useMemo(() =>
    new ListLayout<T>({
      estimatedRowHeight: scale === 'large' ? 48 : 32,
      estimatedHeadingHeight: scale === 'large' ? 33 : 26,
      padding: scale === 'large' ? 5 : 4, // TODO: get from DNA
      collator
    })
  , [collator, scale]);

  layout.collection = state.collection;
  layout.disabledKeys = state.disabledKeys;
  return layout;
}

/** @private */
function ListBoxBase<T>(props: ListBoxBaseProps<T>, ref: RefObject<HTMLDivElement>) {
  let {layout, state, shouldSelectOnPressUp, focusOnPointerEnter, shouldUseVirtualFocus, domProps = {}, transitionDuration = 0, onScroll} = props;
  let {listBoxProps} = useListBox({
    ...props,
    ...domProps,
    keyboardDelegate: layout,
    isVirtualized: true
  }, state, ref);
  let {styleProps} = useStyleProps(props);
  let formatMessage = useMessageFormatter(intlMessages);

  // Sync loading state into the layout.
  layout.isLoading = props.isLoading;

  // This overrides collection view's renderWrapper to support heirarchy of items in sections.
  // The header is extracted from the children so it can receive ARIA labeling properties.
  type View = ReusableView<Node<T>, unknown>;
  let renderWrapper = (parent: View, reusableView: View, children: View[], renderChildren: (views: View[]) => ReactElement[]) => {
    if (reusableView.viewType === 'section') {
      return (
        <ListBoxSection
          key={reusableView.key}
          reusableView={reusableView}
          header={children.find(c => c.viewType === 'header')}>
          {renderChildren(children.filter(c => c.viewType === 'item'))}
        </ListBoxSection>
      );
    }

    return (
      <VirtualizerItem
        key={reusableView.key}
        reusableView={reusableView}
        parent={parent} />
    );
  };

  return (
    <ListBoxContext.Provider value={state}>
      <Virtualizer
        {...styleProps}
        {...mergeProps(listBoxProps, domProps)}
        ref={ref}
        focusedKey={state.selectionManager.focusedKey}
        sizeToFit="height"
        scrollDirection="vertical"
        className={
          classNames(
            styles,
            'spectrum-Menu',
            styleProps.className
          )
        }
        layout={layout}
        collection={state.collection}
        renderWrapper={renderWrapper}
        transitionDuration={transitionDuration}
        isLoading={props.isLoading}
        onLoadMore={props.onLoadMore}
        shouldUseVirtualFocus={shouldUseVirtualFocus}
        onScroll={onScroll}>
        {(type, item: Node<T>) => {
          if (type === 'item') {
            return (
              <ListBoxOption
                item={item}
                shouldSelectOnPressUp={shouldSelectOnPressUp}
                shouldFocusOnHover={focusOnPointerEnter}
                shouldUseVirtualFocus={shouldUseVirtualFocus} />
            );
          } else if (type === 'loader') {
            return (
              // aria-selected isn't needed here since this option is not selectable.
              // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
              <div role="option" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>
                <ProgressCircle
                  isIndeterminate
                  size="S"
                  aria-label={state.collection.size > 0 ? formatMessage('loadingMore') : formatMessage('loading')}
                  UNSAFE_className={classNames(styles, 'spectrum-Dropdown-progressCircle')} />
              </div>
            );
          } else if (type === 'placeholder') {
            let emptyState = props.renderEmptyState ? props.renderEmptyState() : null;
            if (emptyState == null) {
              return null;
            }

            return (
              <div
                // aria-selected isn't needed here since this option is not selectable.
                // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
                role="option">
                {emptyState}
              </div>
            );
          }
        }}
      </Virtualizer>
    </ListBoxContext.Provider>
  );
}

// forwardRef doesn't support generic parameters, so cast the result to the correct type
// https://stackoverflow.com/questions/58469229/react-with-typescript-generics-while-using-react-forwardref
const _ListBoxBase = React.forwardRef(ListBoxBase) as <T>(props: ListBoxBaseProps<T> & {ref?: RefObject<HTMLDivElement>}) => ReactElement;
export {_ListBoxBase as ListBoxBase};
