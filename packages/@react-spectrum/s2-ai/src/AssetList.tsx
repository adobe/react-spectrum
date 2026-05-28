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

import {AriaLabelingProps, DOMRef} from '@react-types/shared';
import {baseColor, focusRing, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {BasicHorizontalCard} from './HorizontalCard';
import {Button} from 'react-aria-components/Button';
import {CardProps} from '@react-spectrum/s2/Card';
import Close from '@react-spectrum/s2/icons/Close';
import {controlSize, getAllowedOverrides} from './style-utils-copy' with {type: 'macro'};
import {forwardRef, useRef} from 'react';
import {iconStyle} from '@react-spectrum/s2/style' with {type: 'macro'};
import {pressScale} from '@react-spectrum/s2/pressScale';
import {Tag, TagGroup, TagList} from 'react-aria-components/TagGroup';
import {useDOMRef} from './useDOMRef';

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
}>(
  {
    ...focusRing(),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    size: controlSize(),
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
  },
  getAllowedOverrides()
);

const closeIconStyle = ({size = 'M'}) => {
  if (size === 'S') return iconStyle({size: 'XS'});
  else if (size === 'M') return iconStyle({size: 'S'});
  else if (size === 'L') return iconStyle({size: 'M'});
  else if (size === 'XL') return iconStyle({size: 'L'});
  else return iconStyle({size: 'S'});
};

const CloseButton = function CloseButton(props) {
  let ref = useRef(null);
  return (
    <Button
      {...props}
      ref={ref}
      slot="remove"
      style={pressScale(ref, {})}
      className={renderProps => styles({...renderProps, size: props.size || 'M'}, props.styles)}>
      <Close styles={closeIconStyle({size: props.size ?? 'M'})} />
    </Button>
  );
};

let assetListStyles = style({}, getAllowedOverrides());

export const AssetList = forwardRef(function AssetList(props: any, ref: DOMRef<HTMLDivElement>) {
  let domRef = useDOMRef(ref);
  return (
    <TagGroup {...props} className={assetListStyles(props.styles)} ref={domRef}>
      <TagList
        className={style({
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          flexWrap: 'wrap',
          alignItems: 'center',
          width: 'full'
        })}>
        {props.children}
      </TagList>
    </TagGroup>
  );
});

export const Asset = forwardRef(function Asset(
  props: CardProps & AriaLabelingProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {
    textValue,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    ...otherProps
  } = props;
  let domRef = useDOMRef(ref);
  return (
    <Tag
      textValue={textValue}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      ref={domRef}
      className={style({flexShrink: 0, flexGrow: 0, position: 'relative'})}>
      <BasicHorizontalCard {...otherProps}>{props.children}</BasicHorizontalCard>
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
