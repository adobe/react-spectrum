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
import {AriaTagGroupProps, TagKeyboardDelegate, useTagGroup} from '@react-aria/tag';
import {classNames, useDOMRef, useStyleProps} from '@react-spectrum/utils';
import {DOMRef, StyleProps} from '@react-types/shared';
import {FocusScope} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListCollection} from '@react-stately/list';
import React, {ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Tag} from './Tag';
import {useId, useLayoutEffect, useResizeObserver, useValueEffect} from '@react-aria/utils';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';
import {useProviderProps} from '@react-spectrum/provider';
import {useTagGroupState} from '@react-stately/tag';

export interface SpectrumTagGroupProps<T> extends AriaTagGroupProps<T>, StyleProps {
  /** The label to display on the action button.  */
  actionLabel?: string,
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void
}

function TagGroup<T extends object>(props: SpectrumTagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  let {
    allowsRemoving,
    onRemove,
    maxRows,
    children,
    actionLabel,
    onAction,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  let containerRef = useRef(null);
  let {styleProps} = useStyleProps(otherProps);
  let {direction} = useLocale();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let [isCollapsed, setIsCollapsed] = useState(maxRows != null);
  let state = useTagGroupState(props);
  let [tagState, setTagState] = useValueEffect({visibleTagCount: state.collection.size, showCollapseButton: false});
  let keyboardDelegate = useMemo(() => (
    isCollapsed
      ? new TagKeyboardDelegate(new ListCollection([...state.collection].slice(0, tagState.visibleTagCount)), direction)
      : new TagKeyboardDelegate(new ListCollection([...state.collection]), direction)
  ), [direction, isCollapsed, state.collection, tagState.visibleTagCount]) as TagKeyboardDelegate<T>;
  // Remove onAction from props so it doesn't make it into useGridList.
  delete props.onAction;
  let {tagGroupProps} = useTagGroup({...props, keyboardDelegate}, state, domRef);
  let actionsId = useId();

  let updateVisibleTagCount = useCallback(() => {
    if (maxRows > 0) {
      let computeVisibleTagCount = () => {
        // Refs can be null at runtime.
        let currDomRef: HTMLDivElement | null = domRef.current;
        let currContainerRef: HTMLDivElement | null = containerRef.current; 
        if (!currDomRef || !currContainerRef) {
          return;
        }

        let tags = [...currDomRef.children];
        let buttons = [...currContainerRef.parentElement.querySelectorAll('button')];
        let currY = -Infinity;
        let rowCount = 0;
        let index = 0;
        let tagWidths = [];
        // Count rows and show tags until we hit the maxRows.
        for (let tag of tags) {
          let {width, y} = tag.getBoundingClientRect();

          if (y !== currY) {
            currY = y;
            rowCount++;
          }

          if (rowCount > maxRows) {
            break;
          }
          tagWidths.push(width);
          index++;
        }

        // Remove tags until there is space for the collapse button and action button (if present) on the last row.
        let buttonsWidth = buttons.reduce((acc, curr) => acc += curr.getBoundingClientRect().width, 0);
        let end = direction === 'ltr' ? 'right' : 'left';
        let containerEnd = currContainerRef.getBoundingClientRect()[end];
        let lastTagEnd = tags[index - 1]?.getBoundingClientRect()[end];
        let availableWidth = containerEnd - lastTagEnd;
        for (let tagWidth of tagWidths.reverse()) {
          if (availableWidth >= buttonsWidth || index <= 1 || index >= state.collection.size) {
            break;
          }
          availableWidth += tagWidth;
          index--;
        }
        return {visibleTagCount: index, showCollapseButton: index < state.collection.size};
      };
    
      setTagState(function *() {
        // Update to show all items.
        yield {visibleTagCount: state.collection.size, showCollapseButton: true};

        // Measure, and update to show the items until maxRows is reached.
        yield computeVisibleTagCount();
      });
    }
  }, [maxRows, setTagState, domRef, direction, state.collection.size]);

  useResizeObserver({ref: containerRef, onResize: updateVisibleTagCount});

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(updateVisibleTagCount, [children]);

  useEffect(() => {
    // Recalculate visible tags when fonts are loaded.
    document.fonts?.ready.then(() => updateVisibleTagCount());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let visibleTags = [...state.collection];
  if (maxRows != null && isCollapsed) {
    visibleTags = visibleTags.slice(0, tagState.visibleTagCount);
  }

  let handlePressCollapse = () => {
    // Prevents button from losing focus if focusedKey got collapsed.
    state.selectionManager.setFocusedKey(null);
    setIsCollapsed(prevCollapsed => !prevCollapsed);
  };

  let showActions = tagState.showCollapseButton || (actionLabel && onAction);

  return (
    <FocusScope>
      <div
        ref={containerRef}
        {...styleProps}
        className={classNames(styles, 'spectrum-Tags-container', styleProps.className)}>
        <div
          {...tagGroupProps}
          className={classNames(styles, 'spectrum-Tags')}
          role={state.collection.size ? 'grid' : null}
          ref={domRef}>
          {visibleTags.map(item => (
            <Tag
              {...item.props}
              key={item.key}
              item={item}
              state={state}
              allowsRemoving={allowsRemoving}
              onRemove={onRemove}>
              {item.rendered}
            </Tag>
          ))}
        </div>
        {showActions &&
          <div
            role="group"
            id={actionsId}
            aria-label={stringFormatter.format('actions')}
            aria-labelledby={`${tagGroupProps.id} ${actionsId}`}
            className={classNames(styles, 'spectrum-Tags-actions')}>
            {tagState.showCollapseButton &&
              <ActionButton
                isQuiet
                onPress={handlePressCollapse}
                UNSAFE_className={classNames(styles, 'spectrum-Tags-actionButton')}>
                {isCollapsed ?
                  stringFormatter.format('showAllButtonLabel', {tagCount: state.collection.size}) :
                  stringFormatter.format('hideButtonLabel')
                }
              </ActionButton>
            }
            {actionLabel && onAction &&
              <ActionButton
                isQuiet
                onPress={() => onAction?.()}
                UNSAFE_className={classNames(styles, 'spectrum-Tags-actionButton')}>
                {actionLabel}
              </ActionButton>
            }
          </div>
        }
      </div>
    </FocusScope>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
const _TagGroup = React.forwardRef(TagGroup) as <T>(props: SpectrumTagGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TagGroup as TagGroup};
