/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  AriaLabelingProps,
  DOMProps,
  DOMRef,
  forwardRefType,
  GlobalDOMAttributes
} from '@react-types/shared';
import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {BasicHorizontalCard} from './HorizontalCard';
import {Button} from 'react-aria-components/Button';
import {CardProps} from '@react-spectrum/s2/Card';
import Close from '@react-spectrum/s2/icons/Close';
import {forwardRef, ReactNode, useRef} from 'react';
import {iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import {ImageContext} from '@react-spectrum/s2/Image';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {pressScale} from '@react-spectrum/s2/pressScale';
import {ProgressCircle} from '@react-spectrum/s2/ProgressCircle';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {
  Tag,
  TagGroup,
  TagGroupProps,
  TagList,
  TagListProps,
  TagProps
} from 'react-aria-components/TagGroup';
import {useDOMRef} from './useDOMRef';

interface AttachmentRenderProps {
  /** The size of the Card. */
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

const controlSizeM = {
  default: 32,
  size: {
    XS: 20,
    S: 24,
    L: 40,
    XL: 48
  }
} as const;

const hoverBackground = {
  default: 'gray-200',
  isStaticColor: 'transparent-overlay-200'
} as const;

const styles = style<{
  isDisabled: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isPressed: boolean;
  size: 'S' | 'M' | 'L' | 'XL';
}>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: controlSizeM,
  flexShrink: 0,
  borderRadius: 'full',
  padding: 0,
  borderStyle: 'none',
  transition: 'default',
  backgroundColor: {
    default: 'gray-200',
    isHovered: hoverBackground,
    isFocusVisible: hoverBackground,
    isPressed: hoverBackground
  },
  '--iconPrimary': {
    type: 'color',
    value: {
      default: baseColor('neutral'),
      isDisabled: 'disabled',
      forcedColors: {
        default: 'ButtonText',
        isDisabled: 'GrayText'
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  disableTapHighlight: true
});

const closeIconStyle = ({size = 'M'}) => {
  if (size === 'S') return iconStyle({size: 'XS'});
  else if (size === 'M') return iconStyle({size: 'S'});
  else if (size === 'L') return iconStyle({size: 'M'});
  else if (size === 'XL') return iconStyle({size: 'L'});
  else return iconStyle({size: 'S'});
};

const CloseButton = function CloseButton(props) {
  let ref = useRef(null);
  // oxlint-disable react/react-compiler
  return (
    <Button
      {...props}
      ref={ref}
      slot="remove"
      style={pressScale(ref, {})}
      className={renderProps =>
        mergeStyles(styles({...renderProps, size: props.size || 'M'}), props.styles)
      }>
      <Close styles={closeIconStyle({size: props.size ?? 'M'})} />
    </Button>
  );
  // oxlint-enable react/react-compiler
};

export interface AttachmentListProps<T>
  extends
    DOMProps,
    Omit<
      TagGroupProps,
      | 'children'
      | 'selectionMode'
      | 'defaultSelectedKeys'
      | 'selectionBehavior'
      | 'selectedKeys'
      | 'disallowEmptySelection'
      | 'escapeKeyBehavior'
      | 'onSelectionChange'
      | 'shouldSelectOnPressUp'
      | 'onAction'
      | 'render'
      | 'style'
      | 'className'
      | keyof GlobalDOMAttributes
    >,
    Pick<TagListProps<T>, 'items' | 'children' | 'dependencies'> {
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

export const AttachmentList = (forwardRef as forwardRefType)(function AttachmentList<T>(
  props: AttachmentListProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {styles, items, children, dependencies, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  return (
    <TagGroup {...otherProps} className={styles} ref={domRef}>
      <TagList
        items={items}
        dependencies={dependencies}
        className={style({
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          width: 'full'
        })}>
        {children}
      </TagList>
    </TagGroup>
  );
});

export interface AttachmentProps
  extends
    Omit<CardProps, 'styles' | 'UNSAFE_className' | 'UNSAFE_style'>,
    AriaLabelingProps,
    Pick<TagProps, 'id' | 'textValue' | 'render'> {
  /** The children of the Attachment. */
  children: ReactNode | ((renderProps: AttachmentRenderProps) => ReactNode);
  uploadProgress?: number;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

const tagStyles = style({
  flexShrink: 0,
  flexGrow: 0,
  position: 'relative',
  ...focusRing(),
  borderRadius: 'default'
});

export const Attachment = forwardRef(function Attachment(
  props: AttachmentProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {
    id,
    textValue,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    styles,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  return (
    <Tag
      id={id}
      textValue={textValue}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      ref={domRef}
      className={renderProps => mergeStyles(tagStyles({...renderProps}), styles)}>
      <BasicHorizontalCard {...otherProps}>
        {props.uploadProgress != null && props.uploadProgress < 100 && (
          <div
            className={style({
              position: 'absolute',
              top: '50%',
              insetStart: {
                default: '50%',
                ':has(~ [data-slot=content])': 32
              },
              transform: 'translate(-50%, -50%)'
            })}>
            <ProgressCircle aria-label="Uploading" value={props.uploadProgress} size="S" />
          </div>
        )}
        {/* Reduce opacity of the thumbnail if upload is in progress */}
        <ImageContext.Consumer>
          {ctx => (
            <ImageContext.Provider
              value={{
                ...ctx,
                slots: {
                  thumbnail: {
                    ...(ctx && 'slots' in ctx ? ctx.slots?.thumbnail : {}),
                    styles: mergeStyles(
                      ctx && 'slots' in ctx ? ctx.slots?.thumbnail?.styles : undefined,
                      style({
                        opacity: {default: 1, isUploading: 0.15},
                        transition: 'default'
                      })({isUploading: props.uploadProgress != null && props.uploadProgress < 100})
                    )
                  }
                }
              }}>
              {typeof props.children === 'function'
                ? props.children({size: otherProps.size || 'M'})
                : props.children}
            </ImageContext.Provider>
          )}
        </ImageContext.Consumer>
      </BasicHorizontalCard>
      {/** Definitely not a close button, though looks like one. */}
      <div
        className={style({
          position: 'absolute',
          top: 0,
          insetEnd: 0,
          transform: 'translate(50%, -50%)'
        })}>
        <CloseButton size="XS" />
      </div>
    </Tag>
  );
});
