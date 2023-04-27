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
import {classNames, useDOMRef} from '@react-spectrum/utils';
import {DOMRef, SpectrumHelpTextProps, SpectrumLabelableProps, StyleProps} from '@react-types/shared';
import {Field} from '@react-spectrum/label';
import {FocusScope} from '@react-aria/focus';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {ListCollection, useListState} from '@react-stately/list';
import {Provider, useProviderProps} from '@react-spectrum/provider';
import React, {ReactElement, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import styles from '@adobe/spectrum-css-temp/components/tags/vars.css';
import {Tag} from './Tag';
import {useFormProps} from '@react-spectrum/form';
import {useId, useLayoutEffect, useResizeObserver, useValueEffect} from '@react-aria/utils';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

export interface SpectrumTagGroupProps<T> extends Omit<AriaTagGroupProps<T>, 'keyboardDelegate'>, StyleProps, SpectrumLabelableProps, Omit<SpectrumHelpTextProps, 'showErrorIcon'> {
  /** The label to display on the action button.  */
  actionLabel?: string,
  /** Handler that is called when the action button is pressed. */
  onAction?: () => void
}

function TagGroup<T extends object>(props: SpectrumTagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  props = useProviderProps(props);
  props = useFormProps(props);
  let {
    allowsRemoving,
    onRemove,
    maxRows,
    children,
    actionLabel,
    onAction,
    labelPosition
  } = props;
  let domRef = useDOMRef(ref);
  let containerRef = useRef(null);
  let tagsRef = useRef(null);
  let {direction} = useLocale();
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let [isCollapsed, setIsCollapsed] = useState(maxRows != null);
  let state = useListState(props);
  let [tagState, setTagState] = useValueEffect({visibleTagCount: state.collection.size, showCollapseButton: false, maxHeight: undefined});
  let keyboardDelegate = useMemo(() => (
    isCollapsed
      ? new TagKeyboardDelegate(new ListCollection([...state.collection].slice(0, tagState.visibleTagCount)), direction)
      : new TagKeyboardDelegate(new ListCollection([...state.collection]), direction)
  ), [direction, isCollapsed, state.collection, tagState.visibleTagCount]) as TagKeyboardDelegate<T>;
  // Remove onAction from props so it doesn't make it into useGridList.
  delete props.onAction;
  let {gridProps, labelProps, descriptionProps, errorMessageProps} = useTagGroup({...props, keyboardDelegate}, state, tagsRef);
  let actionsId = useId();

  let updateVisibleTagCount = useCallback(() => {
    if (maxRows > 0) {
      let computeVisibleTagCount = () => {
        // Refs can be null at runtime.
        let currContainerRef: HTMLDivElement | null = containerRef.current;
        let currTagsRef: HTMLDivElement | null = tagsRef.current;
        if (!currContainerRef || !currTagsRef) {
          return;
        }

        let tags = [...currTagsRef.children];
        let buttons = [...currContainerRef.parentElement.querySelectorAll('button')];
        let currY = -Infinity;
        let rowCount = 0;
        let index = 0;
        let tagWidths: number[] = [];
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
        buttonsWidth += parseInt(window.getComputedStyle(buttons[buttons.length - 1]).marginRight, 10) * 2;
        let end = direction === 'ltr' ? 'right' : 'left';
        let containerEnd = currContainerRef.parentElement.getBoundingClientRect()[end];
        let lastTagEnd = tags[index - 1]?.getBoundingClientRect()[end];
        lastTagEnd += parseInt(window.getComputedStyle(tags[index - 1]).marginRight, 10);
        let availableWidth = containerEnd - lastTagEnd;

        while (availableWidth < buttonsWidth && index < state.collection.size && index > 0) {
          availableWidth += tagWidths.pop();
          index--;
        }
        let tagStyle = window.getComputedStyle(tags[0]);
        let maxHeight = (parseInt(tagStyle.height, 10) + parseInt(tagStyle.marginTop, 10) * 2) * maxRows;
        return {
          visibleTagCount: index,
          showCollapseButton: index < state.collection.size,
          maxHeight
        };
      };

      setTagState(function *() {
        // Update to show all items.
        yield {visibleTagCount: state.collection.size, showCollapseButton: true, maxHeight: undefined};

        // Measure, and update to show the items until maxRows is reached.
        yield computeVisibleTagCount();
      });
    }
  }, [maxRows, setTagState, direction, state.collection.size]);

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
      <Field
        {...props}
        labelProps={labelProps}
        descriptionProps={descriptionProps}
        errorMessageProps={errorMessageProps}
        showErrorIcon
        ref={domRef}
        elementType="span"
        wrapperClassName={
          classNames(
            styles,
            'spectrum-Tags-fieldWrapper',
            {
              'spectrum-Tags-fieldWrapper--positionSide': labelPosition === 'side'
            }
          )
        }>
        <div
          style={maxRows != null && tagState.showCollapseButton && isCollapsed ? {maxHeight: tagState.maxHeight, overflow: 'hidden'} : undefined}
          ref={containerRef}
          className={classNames(styles, 'spectrum-Tags-container')}>
          <div
            ref={tagsRef}
            {...gridProps}
            className={classNames(styles, 'spectrum-Tags')}>
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
            <Provider isDisabled={false}>
              <div
                role="group"
                id={actionsId}
                aria-label={stringFormatter.format('actions')}
                aria-labelledby={`${gridProps.id} ${actionsId}`}
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
            </Provider>
          }
        </div>
      </Field>
    </FocusScope>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
const _TagGroup = React.forwardRef(TagGroup) as <T>(props: SpectrumTagGroupProps<T> & {ref?: DOMRef<HTMLDivElement>}) => ReactElement;
export {_TagGroup as TagGroup};
