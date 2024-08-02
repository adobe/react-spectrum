/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import AlertIcon from '../s2wf-icons/S2_Icon_AlertTriangle_20_N.svg';
import {
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  TagGroupProps as AriaTagGroupProps,
  TagProps as AriaTagProps,
  composeRenderProps,
  Provider,
  TextContext as RACTextContext,
  TagList,
  TagListProps, useLocale
} from 'react-aria-components';
import {AvatarContext} from './Avatar';
import {CenterBaseline, centerBaseline} from './CenterBaseline';
import {ClearButton} from './ClearButton';
import {createContext, ForwardedRef, forwardRef, ReactNode, useContext, useMemo, useRef, useState} from 'react';
import {DOMRef, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {field, focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel} from './Field';
import {fontRelative, style} from '../style/spectrum-theme' with { type: 'macro' };
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {IconContext} from './Icon';
import {ImageContext, Text, TextContext} from './Content';
import {pressScale} from './pressScale';
import {useDOMRef} from '@react-spectrum/utils';
import {CollectionBuilder} from '@react-aria/collections';
import {useEffect} from 'react';
import {useEffectEvent, useId, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {ActionButton} from './ActionButton';
import { flushSync } from 'react-dom';
import { TagListContext } from 'react-aria-components';
import { use } from 'react';

// Get types from RSP and extend those?
export interface TagProps extends Omit<AriaTagProps, 'children' | 'style' | 'className'> {
  /** The children of the tag. */
  children?: ReactNode
}

export interface TagGroupProps<T> extends Omit<AriaTagGroupProps, 'children' | 'style' | 'className'>, Pick<TagListProps<T>, 'items' | 'children' | 'renderEmptyState'>, Omit<SpectrumLabelableProps, 'isRequired' | 'necessityIndicator'>, StyleProps, Omit<HelpTextProps, 'errorMessage'> {
  /** A description for the tag group. */
  description?: ReactNode,
  /**
   * The size of the tag group.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L',
  /** Whether the tags are displayed in an emphasized style. */
  isEmphasized?: boolean,
  /** Provides content to display when there are no items in the tag group. */
  renderEmptyState?: () => ReactNode,
  /** Whether the tags are displayed in a error state. */
  isInvalid?: boolean,
  /** An error message for the field. */
  errorMessage?: ReactNode,
  /** Limit the number of rows initially shown. This will render a button that allows the user to expand to show all tags. */
  maxRows?: number
}

const TagGroupContext = createContext<TagGroupProps<any>>({});

const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  lineHeight: 'ui',
  gap: 'text-to-visual',
  fontFamily: 'sans',
  fontSize: 'control',
  color: {
    default: 'neutral-subdued',
    isInvalid: 'negative'
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  contain: 'inline-size',
  paddingTop: '--field-gap',
  cursor: 'text'
});

const InternalTagGroupContext = createContext<TagGroupProps<any>>({});

function TagGroup<T extends object>(props: TagGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  let {onRemove} = props;
  return (
    <InternalTagGroupContext.Provider value={{onRemove}}>
      <CustomTagGroup {...props} ref={ref}>
        <TagList style={{display: 'flex', gap: 4}}>
          {props.children}
        </TagList>
      </CustomTagGroup>
    </InternalTagGroupContext.Provider>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
let _TagGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(TagGroup);
export {_TagGroup as TagGroup};

interface CustomTagGroupProps<T> extends TagGroupProps<T> {

}

let CustomTagGroup = forwardRef((props: CustomTagGroupProps, ref: ForwardedRef<HTMLDivElement>) => {
  return (
    <CollectionBuilder content={props.children}>
      {collection => <TagGroupInner props={props} forwardedRef={ref} collection={collection} />}
    </CollectionBuilder>
  );
});

function TagGroupInner<T>({
  props: {
    label,
    description,
    labelPosition = 'top',
    labelAlign = 'start',
    renderEmptyState,
    isEmphasized,
    isInvalid,
    errorMessage,
    UNSAFE_className = '',
    UNSAFE_style,
    size = 'M',
    ...props
  },
  forwardedRef: ref,
  collection
}: {props: CustomTagGroupProps<T>, forwardedRef: any, collection: any}) {
  let {maxRows= 2} = props;
  let {direction} = useLocale();
  let containerRef = useRef(null);
  let tagsRef = useRef<HTMLDivElement | null>(null);
  let actionsRef = useRef(null);
  let hiddenTagsRef = useRef<HTMLDivElement | null>(null);
  let [tagState, setTagState] = useState({visibleTagCount: collection.size, showCollapseButton: true});
  let [isCollapsed, setIsCollapsed] = useState(maxRows != null);
  let {onRemove} = useContext(InternalTagGroupContext);
  let isEmpty = collection.size === 0;
  let showActions = tagState.showCollapseButton || tagState.visibleTagCount < collection.size;

  let allItems = useMemo(
    () => Array.from(collection),
    [collection]
  );
  let items = useMemo(
    () => Array.from(collection).slice(0, !isCollapsed ? collection.size : tagState.visibleTagCount),
    [collection, tagState.visibleTagCount, isCollapsed]
  );

  let updateVisibleTagCount = useEffectEvent(() => {
    if (maxRows && maxRows > 0) {
      let computeVisibleTagCount = () => {
        let currContainerRef: HTMLDivElement | null = hiddenTagsRef.current;
        let currTagsRef: HTMLDivElement | null = hiddenTagsRef.current;
        let currActionsRef: HTMLDivElement | null = actionsRef.current;
        if (!currContainerRef || !currTagsRef || collection.size === 0) {
          return {
            visibleTagCount: 0,
            showCollapseButton: false
          };
        }

        // Count rows and show tags until we hit the maxRows.
        // I think this is still a safe assumption, and we don't need to queryAll for role=tag
        let tags = [...currTagsRef.children];
        let currY = -Infinity;
        let rowCount = 0;
        let index = 0;
        let tagWidths: number[] = [];
        for (let tag of tags) {
          let {width, y} = tag.getBoundingClientRect();

          if (y !== currY) {
            currY = y;
            rowCount++;
          }

          if (maxRows && rowCount > maxRows) {
            break;
          }
          tagWidths.push(width);
          index++;
        }

        // Remove tags until there is space for the collapse button and action button (if present) on the last row.
        let buttons = currActionsRef ? [...currActionsRef.children] : [];
        if (maxRows && buttons.length > 0 && rowCount >= maxRows) {
          let buttonsWidth = buttons.reduce((acc, curr) => acc += curr.getBoundingClientRect().width, 0);
          let margins = parseFloat(getComputedStyle(buttons[0]).marginInlineStart);
          buttonsWidth += margins * 2;
          let end = direction === 'ltr' ? 'right' : 'left';
          let containerEnd = currContainerRef.parentElement.getBoundingClientRect()[end] - margins;
          let lastTagEnd = tags[index - 1]?.getBoundingClientRect()[end];
          lastTagEnd += margins;
          let availableWidth = containerEnd - lastTagEnd;

          while (availableWidth <= buttonsWidth && index > 0) {
            availableWidth += tagWidths.pop();
            index--;
          }
        }

        return {
          visibleTagCount: Math.max(index, 1),
          showCollapseButton: index < collection.size
        };
      };
      let result = computeVisibleTagCount();
      flushSync(() => {
        setTagState(result);
      });
    }
  });

  useResizeObserver({ref: containerRef, onResize: updateVisibleTagCount});

  useLayoutEffect(() => {
    if (collection.size > 0) {
      queueMicrotask(updateVisibleTagCount);
    }
  }, [collection.size, updateVisibleTagCount]);

  useEffect(() => {
    // Recalculate visible tags when fonts are loaded.
    document.fonts?.ready.then(() => updateVisibleTagCount());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let handlePressCollapse = () => {
    setIsCollapsed(prevCollapsed => !prevCollapsed);
  };

  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let domRef = useDOMRef(ref);

  let helpText: ReactNode = null;
  if (!isInvalid && description) {
    helpText =  (
      <Text
        slot="description"
        className={helpTextStyles({size: props.size || 'M'})}>
        {description}
      </Text>
    );
  } else if (isInvalid) {
    helpText = (
      <div
        className={helpTextStyles({size: props.size || 'M', isInvalid})}>
        <CenterBaseline>
          <AlertIcon />
        </CenterBaseline>
        <Text slot="errorMessage">
          {errorMessage}
        </Text>
      </div>
    );
  }

  return (
    <AriaTagGroup
      {...props}
      ref={domRef}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        size,
        labelPosition: labelPosition,
        isInForm: !!formContext
      }, props.styles)}>
      <FieldLabel
        size={size}
        labelPosition={labelPosition}
        labelAlign={labelAlign}
        contextualHelp={props.contextualHelp}>
        {label}
      </FieldLabel>
      <div
        ref={containerRef}
        className={style({
          gridArea: 'input',
          minWidth: 'full',
          marginStart: -4,
          marginEnd: 4,
          position: 'relative'
        })}>
        <FormContext.Provider value={{...formContext, size}}>
          <Provider
            values={[
              [RACTextContext, undefined],
              [TagGroupContext, {size, isEmphasized}]
            ]}>
            {/* invisible collection for measuring */}
            <div
              inert="true"
              ref={hiddenTagsRef}
              className={style({
                display: 'inline',
                flexWrap: 'wrap',
                fontFamily: 'sans',
                position: 'absolute',
                top: 0,
                bottom: 0,
                start: -4,
                end: 4,
                visibility: 'hidden',
                overflow: 'hidden',
                opacity: 0
              })}>
              {allItems.map(item => {
                // pull off individual props as an allow list, don't want refs or other props getting through
                // possibly should render a tag look alike instead though, so i don't call the hooks either or add id's to elements etc
                return (
                  <div
                    style={item.props.UNSAFE_style}
                    key={item.key}
                    className={item.props.className({size, allowsRemoving: Boolean(onRemove)})}>
                    {item.props.children({size, allowsRemoving: Boolean(onRemove), isInCtx: true})}
                  </div>
                );
              })}
            </div>
            {/* real tag list */}
            <TagList
              ref={tagsRef}
              items={items}
              renderEmptyState={renderEmptyState}
              className={style({
                display: 'inline',
                minWidth: 'full',
                fontFamily: 'sans'
              })}>
              {item => <Tag {...item.props} />}
            </TagList>
            {showActions && !isEmpty &&
              <ActionGroup
                actionsRef={actionsRef}
                tagState={tagState}
                size={size}
                isCollapsed={isCollapsed}
                handlePressCollapse={handlePressCollapse} />
            }
          </Provider>
        </FormContext.Provider>
      </div>
      {helpText}
    </AriaTagGroup>
  );
}

function ActionGroup(props) {
  let {
    actionsRef,
    tagState,
    size,
    isCollapsed,
    handlePressCollapse
  } = props;
  let tagListCtx = useContext(TagListContext);
  let {id: gridId} = tagListCtx ?? {};
  let actionsId = useId();
  return (
    <div
      role="group"
      ref={actionsRef}
      id={actionsId}
      aria-label={'Actions'}
      aria-labelledby={`${gridId} ${actionsId}`}
      className={style({
        display: 'inline'
      })}>
      {tagState.showCollapseButton &&
        <ActionButton
          isQuiet
          size={size}
          styles={style({margin: 4})}
          UNSAFE_style={{display: 'inline-flex'}}
          onPress={handlePressCollapse}>
          {isCollapsed ? 'Show all' : 'Collapse'}
        </ActionButton>
      }
    </div>
  )
}

const tagStyles = style({
  ...focusRing(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'sans',
  fontWeight: 'medium',
  fontSize: 'control',
  height: 'control',
  transition: 'default',
  minWidth: 0,
  // maxWidth: '[calc(self(height) * 7)]', // s2 designs show a max width on tags but we pushed back on this in v3
  backgroundColor: {
    default: 'gray-100',
    isHovered: {
      default: 'gray-200'
    },
    isFocusVisible: {
      default: 'gray-200'
    },
    isSelected: {
      default: 'neutral',
      isEmphasized: {
        default: 'accent'
      }
    },
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonFace',
      isSelected: 'Highlight'
    }
  },
  color: {
    default: 'neutral',
    isSelected: {
      default: 'gray-25',
      isEmphasized: 'white'
    },
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isSelected: 'HighlightText',
      isDisabled: 'GrayText'
    }
  },
  borderStyle: 'none',
  paddingStart: {
    default: 'edge-to-text'
  },
  paddingEnd: {
    default: 'edge-to-text',
    allowsRemoving: 0
  },
  paddingY: 0,
  margin: 4,
  borderRadius: 'control',
  cursor: {
    default: 'default',
    isLink: 'pointer'
  },
  '--iconMargin': {
    type: 'marginTop',
    value: {
      default: fontRelative(-2)
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

export function Tag({children, ...props}: TagProps) {
  let textValue = typeof children === 'string' ? children : undefined;
  let ctx = useContext(TagGroupContext);
  let isInCtx = Boolean(ctx.size);
  let {size = 'M', isEmphasized} = ctx;

  let ref = useRef(null);
  let isLink = props.href != null;
  return (
    <AriaTag
      textValue={textValue}
      {...props}
      ref={ref}
      style={{...pressScale(ref), ...props.UNSAFE_style}}
      className={renderProps => props.UNSAFE_className || '' + tagStyles({size, isEmphasized, isLink, ...renderProps})} >
      {composeRenderProps(children, (children, renderProps) => (
        <TagWrapper isInCtx={isInCtx} size={size} {...renderProps}>{children}</TagWrapper>
      ))}
    </AriaTag>
  );
}

function TagWrapper({children, isDisabled, allowsRemoving, isInCtx}) {
  let {size = 'M'} = useContext(TagGroupContext);
  return (
      <>
        {isInCtx && (
          <div
            className={style({
              display: 'inline',
              minWidth: 0,
              alignItems: 'center',
              gap: 'text-to-visual',
              forcedColorAdjust: 'none',
              backgroundColor: 'transparent'
            })}>
            <Provider
              values={[
                [TextContext, {className: style({paddingY: '--labelPadding', order: 1, truncate: true})}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', className: style({order: 0})}),
                  styles: style({size: fontRelative(20), marginStart: '--iconMargin', flexShrink: 0})
                }],
                [AvatarContext, {
                  styles: style({size: fontRelative(20), flexShrink: 0, order: 0})
                }],
                [ImageContext, {
                  className: style({size: fontRelative(20), flexShrink: 0, order: 0, aspectRatio: 'square', objectFit: 'contain'})
                }]
              ]}>
              {typeof children === 'string' ? <Text>{children}</Text> : children}
            </Provider>
          </div>
        )}
        {!isInCtx && children}
        {allowsRemoving && isInCtx && (
          <ClearButton
            slot="remove"
            size={size}
            isDisabled={isDisabled} />
        )}
      </>
  );
}
