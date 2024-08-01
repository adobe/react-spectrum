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
import {CollectionBuilder, createLeafComponent} from '@react-aria/collections';
import {useEffect} from 'react';
import {useEffectEvent, useLayoutEffect, useResizeObserver} from '@react-aria/utils';
import {ActionButton} from './ActionButton';
import { flushSync } from 'react-dom';
import { ListState } from '../../../react-stately';
import { create } from '../../../dev/eslint-plugin-rsp-rules/rules/act-events-test';
import { all } from '../../avatar/chromatic-fc/Avatar.stories';

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
    ...props
  },
  forwardedRef: ref,
  collection
}: {props: CustomTagGroupProps<T>, forwardedRef: any, collection: any}) {
  let {maxRows= 2} = props;
  let {direction} = useLocale();
  let containerRef = useRef(null);
  let tagsRef = useRef<HTMLDivElement | null>(null);
  let hiddenTagsRef = useRef<HTMLDivElement | null>(null);
  let [tagState, setTagState] = useState({visibleTagCount: collection.size, showCollapseButton: false});
  let [isCollapsed, setIsCollapsed] = useState(maxRows != null);
  let {onRemove} = useContext(InternalTagGroupContext);

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
        // Refs can be null at runtime.
        let currContainerRef: HTMLDivElement | null = containerRef.current;
        let currTagsRef: HTMLDivElement | null = hiddenTagsRef.current;
        let currActionsRef: HTMLDivElement | null = true; // actionsRef.current;
        if (!currContainerRef || !currTagsRef || !currActionsRef || collection.size === 0) {
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
        let buttons = []; //[...currActionsRef.children];
        if (maxRows && buttons.length > 0 && rowCount >= maxRows) {
          let buttonsWidth = buttons.reduce((acc, curr) => acc += curr.getBoundingClientRect().width, 0);
          // buttonsWidth += TAG_STYLES[scale].margin * 2 * buttons.length;
          let end = direction === 'ltr' ? 'right' : 'left';
          let containerEnd = currContainerRef.parentElement.getBoundingClientRect()[end];
          let lastTagEnd = tags[index - 1]?.getBoundingClientRect()[end];
          // lastTagEnd += TAG_STYLES[scale].margin;
          let availableWidth = containerEnd - lastTagEnd;

          while (availableWidth < buttonsWidth && index > 0) {
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
  let {size = 'M'} = props;
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
        size: props.size,
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
          display: 'flex',
          flexWrap: 'wrap',
          minWidth: 'full',
          gap: 4,
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
              inert
              ref={hiddenTagsRef}
              className={style({
                marginX:  -4,
                display: 'flex',
                flexWrap: 'wrap',
                fontFamily: 'sans',
                position: 'absolute',
                inset: 0,
                visibility: 'hidden',
                overflow: 'hidden'
              })}>
                <FakeTagContext.Provider value={{isFake: true, allowsRemoving: Boolean(onRemove)}}>
              {allItems.map(item => {
                // pull off individual props as an allow list, don't want refs or other props getting through
                // possibly should render a tag look alike instead though, so i don't call the hooks either or add id's to elements etc
                return item.render(item);
              })}
              </FakeTagContext.Provider>
            </div>
            {/* real tag list */}
            <TagList
              ref={tagsRef}
              items={items}
              renderEmptyState={renderEmptyState}
              className={({isEmpty}) => style({
                marginX: {
                  default: -4,
                  isEmpty: 0
                },
                display: 'flex',
                minWidth: 'full',
                flexWrap: 'wrap',
                fontFamily: 'sans'
              })({isEmpty})}>
              {item => item.render(item)}
            </TagList>
            {tagState.showCollapseButton && <ActionButton isQuiet onPress={handlePressCollapse}>{!isCollapsed ? 'Collapse' : 'Show All'}</ActionButton>}
          </Provider>
        </FormContext.Provider>
      </div>
      {helpText}
    </AriaTagGroup>
  );
}

const FakeTagContext = createContext<TagGroupProps<any>>({isFake: false, allowsRemoving: false});

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

export const Tag = createLeafComponent('item', (props: TagProps, forwardedRef: ForwardedRef<HTMLDivElement>, item: Node<unknown>) => {
  return <Tag2 {...props}></Tag2>;
});

export function Tag2({children, ...props}: TagProps) {
  let {isFake, allowsRemoving} = useContext(FakeTagContext);
  let textValue = typeof children === 'string' ? children : undefined;
  let {size = 'M', isEmphasized} = useContext(TagGroupContext);

  let ref = useRef(null);
  let isLink = props.href != null;
  if (isFake) {
    <div>
       <>
          <div
            className={style({
              display: 'flex',
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
          {allowsRemoving && (
            <ClearButton
              slot="remove"
              size={size} />
          )}
        </>
    </div>
  }
  return (
    <AriaTag
      textValue={textValue}
      {...props}
      ref={ref}
      style={pressScale(ref)}
      className={renderProps => tagStyles({...renderProps, size, isEmphasized, isLink})} >
      {composeRenderProps(children, (children, {allowsRemoving, isDisabled}) => (
        <>
          <div
            className={style({
              display: 'flex',
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
          {allowsRemoving && (
            <ClearButton
              slot="remove"
              size={size}
              isDisabled={isDisabled} />
          )}
        </>
      ))}
    </AriaTag>
  );
}
