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
  ContextValue,
  Provider,
  TextContext as RACTextContext,
  TagList,
  TagListProps,
  useSlottedContext
} from 'react-aria-components';
import {AvatarContext} from './Avatar';
import {CenterBaseline, centerBaseline} from './CenterBaseline';
import {ClearButton} from './ClearButton';
import {createContext, forwardRef, ReactNode, useContext, useRef} from 'react';
import {DOMRef, DOMRefValue, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {field, focusRing, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel} from './Field';
import {fontRelative, style} from '../style/spectrum-theme' with { type: 'macro' };
import {FormContext, useFormProps} from './Form';
import {forwardRefType} from './types';
import {IconContext} from './Icon';
import {ImageContext, Text, TextContext} from './Content';
import {pressScale} from './pressScale';
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

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
  errorMessage?: ReactNode
}

export const TagGroupContext = createContext<ContextValue<TagGroupProps<any>, DOMRefValue<HTMLDivElement>>>(null);

const helpTextStyles = style({
  gridArea: 'helptext',
  display: 'flex',
  alignItems: 'baseline',
  gap: 'text-to-visual',
  font: 'control',
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

function TagGroup<T extends object>(
  {
    label,
    description,
    items,
    labelPosition = 'top',
    labelAlign = 'start',
    children,
    renderEmptyState,
    isEmphasized,
    isInvalid,
    errorMessage,
    UNSAFE_className = '',
    UNSAFE_style,
    ...props
  }: TagGroupProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  [props, ref] = useSpectrumContextProps(props, ref, TagGroupContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {size = 'M'} = props;
  let domRef = useDOMRef(ref);

  let helpText: ReactNode = null;
  if (!isInvalid && description) {
    helpText =  (
      <Text
        slot="description"
        styles={helpTextStyles({size})}>
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

  // TODO collapse behavior, need a custom collection render so we can limit the number of children
  // but this isn't possible yet
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
        className={style({
          gridArea: 'input',
          display: 'flex',
          flexWrap: 'wrap',
          minWidth: 'full',
          // TODO: what should this gap be?
          gap: 16
        })}>
        <FormContext.Provider value={{...formContext, size}}>
          <Provider
            values={[
              [RACTextContext, undefined],
              [TagGroupContext, {size, isEmphasized}]
            ]}>
            <TagList
              items={items}
              renderEmptyState={renderEmptyState}
              className={({isEmpty}) => style({
                marginX: {
                  default: -4, // use negative number when theme TS is ready
                  isEmpty: 0
                },
                display: 'flex',
                minWidth: 'full',
                flexWrap: 'wrap',
                font: 'ui'
              })({isEmpty})}>
              {children}
            </TagList>
          </Provider>
        </FormContext.Provider>
      </div>
      {helpText}
    </AriaTagGroup>
  );
}

/** Tags allow users to categorize content. They can represent keywords or people, and are grouped to describe an item or a search request. */
let _TagGroup = /*#__PURE__*/ (forwardRef as forwardRefType)(TagGroup);
export {_TagGroup as TagGroup};

const tagStyles = style({
  ...focusRing(),
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  font: 'control',
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
  let {size = 'M', isEmphasized} = useSlottedContext(TagGroupContext)!;

  let ref = useRef(null);
  let isLink = props.href != null;
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
                [TextContext, {styles: style({paddingY: '--labelPadding', order: 1, truncate: true})}],
                [IconContext, {
                  render: centerBaseline({slot: 'icon', styles: style({order: 0})}),
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
