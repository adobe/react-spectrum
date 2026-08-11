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

import AlertTriangle from '@react-spectrum/s2/icons/AlertTriangle';
import {
  AriaLabelingProps,
  DOMProps,
  DOMRef,
  forwardRefType,
  GlobalDOMAttributes
} from '@react-types/shared';
import {
  baseColor,
  color,
  focusRing,
  iconStyle,
  lightDark,
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button} from 'react-aria-components/Button';
import {CardProps} from '@react-spectrum/s2/Card';
import {ContentContext} from '@react-spectrum/s2/Content';
import Cross from '../ui-icons/Cross';
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import {forwardRef, ReactNode, useContext, useRef} from 'react';
import {IllustrationContext} from '@react-spectrum/s2/Icon';
import {ImageContext} from '@react-spectrum/s2/Image';
import {ImageCoordinator} from '@react-spectrum/s2/ImageCoordinator';
// @ts-ignore
import intlMessages from '../intl/*.json';
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
import {TextContext} from '@react-spectrum/s2/Text';
import {useDOMRef} from './useDOMRef';
import {useLocalizedStringFormatter} from 'react-aria/useLocalizedStringFormatter';

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
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  disableTapHighlight: true
});

const onlyPreview = ':not(:has([data-slot=content])):not(:has([data-slot=preview]))';
const noDescription = ':not(:has([slot=description]))';

const attachmentCard = style({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  borderRadius: 'default',
  backgroundColor: {
    default: lightDark('transparent-white-300', 'transparent-black-300'),
    forcedColors: 'ButtonFace'
  },
  boxShadow: {
    default: `[inset 0 0 0 1px light-dark(${color('transparent-black-300')}, ${color('transparent-white-300')})]`,
    isInvalid: `[inset 0 0 0 1px ${color('negative-900')}]`
  },
  forcedColorAdjust: 'none',
  transition: 'default',
  fontFamily: 'sans',
  overflow: 'clip',
  contain: 'layout',
  disableTapHighlight: true,
  height: {
    default: 68,
    size: {
      XS: 52,
      S: 60,
      M: 68,
      L: 76,
      XL: 80
    }
  },
  width: {
    default: 'full',
    [onlyPreview]: 'auto'
  },
  aspectRatio: {
    [onlyPreview]: '1/1'
  },
  '--card-spacing': {
    type: 'paddingTop',
    value: {
      size: {
        XS: 8,
        S: 12,
        M: 16,
        L: 20,
        XL: 24
      },
      [onlyPreview]: 0
    }
  },
  alignItems: 'center',

  '--card-padding-y': {
    type: 'paddingTop',
    value: {default: '--card-spacing'}
  },
  '--card-padding-x': {
    type: 'paddingStart',
    value: {default: '--card-spacing'}
  },
  paddingY: '--card-padding-y',
  paddingX: '--card-padding-x',
  boxSizing: 'border-box',
  justifyContent: {
    [onlyPreview]: 'center'
  },
  '--basic-thumb-size': {
    type: 'height',
    value: {
      size: {
        XS: 24,
        S: 26,
        M: 32,
        L: 36,
        XL: 40
      },
      [onlyPreview]: 'full'
    }
  },
  '--illust-thumb-size': {
    type: 'height',
    value: {
      size: {
        XS: 48,
        S: 44,
        M: 48,
        L: 52,
        XL: 56
      },
      [onlyPreview]: 'full'
    }
  },
  '--illust-margin-x': {
    type: 'marginStart',
    value: {
      size: {
        XS: -8,
        S: -8,
        M: -12,
        L: -12,
        XL: -12
      }
    }
  }
});

const illustThumbnailStyles = style({
  position: 'relative',
  alignSelf: 'center',
  flexShrink: 0,
  pointerEvents: 'none',
  userSelect: 'none',
  size: '--illust-thumb-size',
  marginX: '--illust-margin-x'
});

const attachmentTitle = style<{size: 'XS' | 'S' | 'M' | 'L' | 'XL'}>({
  font: 'title',
  fontSize: {
    size: {
      XS: 'title-xs',
      S: 'title-xs',
      M: 'title-sm',
      L: 'title',
      XL: 'title-lg'
    }
  },
  lineClamp: 1,
  gridArea: 'title'
});

const attachmentDescription = style<{size: 'XS' | 'S' | 'M' | 'L' | 'XL'}>({
  font: 'body',
  fontSize: {
    size: {
      XS: 'body-2xs',
      S: 'body-2xs',
      M: 'body-xs',
      L: 'body-sm',
      XL: 'body'
    }
  },
  lineClamp: 1,
  gridArea: 'description'
});

const attachmentContent = style<{size: 'XS' | 'S' | 'M' | 'L' | 'XL'}>({
  display: 'grid',
  gridTemplateColumns: ['minmax(0, 1fr)'],
  gridTemplateAreas: ['title', 'description'],
  columnGap: 4,
  flexGrow: 1,
  minWidth: 0,
  alignItems: 'baseline',
  alignContent: 'start',
  rowGap: {
    size: {
      XS: 4,
      S: 4,
      M: space(6),
      L: space(6),
      XL: 8
    },
    [noDescription]: 0
  },
  paddingStart: {
    default: '--card-spacing',
    ':first-child': 0
  },
  paddingEnd: {
    default: 'calc(var(--card-spacing) * 1.5 / 2)',
    ':last-child': 0
  }
});

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
      <Cross size="M" />
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
    Omit<
      CardProps,
      'styles' | 'UNSAFE_className' | 'UNSAFE_style' | 'allowsArrowNavigation' | 'focusMode'
    >,
    AriaLabelingProps,
    Pick<TagProps, 'id' | 'textValue' | 'render'> {
  /** The children of the Attachment. */
  children: ReactNode | ((renderProps: AttachmentRenderProps) => ReactNode);
  uploadProgress?: number;
  /** Whether the attachment has an error. */
  isInvalid?: boolean;
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

const attachmentErrorStyles = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  paddingStart: {
    default: 8,
    ':not([data-slot=content] ~ *)': 0
  },
  position: {
    ':not([data-slot=content] ~ *)': 'absolute'
  },
  top: {
    ':not([data-slot=content] ~ *)': '50%'
  },
  insetStart: {
    ':not([data-slot=content] ~ *)': '50%'
  },
  transform: {
    ':not([data-slot=content] ~ *)': 'translate(-50%, -50%)'
  },
  '--iconPrimary': {
    type: 'color',
    value: 'negative'
  }
});

function AttachmentContextProvider({
  children,
  isUploading,
  isInvalid
}: {
  children: ReactNode;
  isUploading: boolean;
  isInvalid?: boolean;
}) {
  let imageCtx = useContext(ImageContext);
  let illustrationCtx = useContext(IllustrationContext);
  const opacityStyles = style({
    opacity: {
      default: 1,
      isUploading: 0.15,
      isInvalid: {
        default: 1,
        ':not(:has(~ [data-slot=content]))': 0.15
      }
    },
    transition: 'default'
  })({isUploading, isInvalid});
  const imageSlots = imageCtx && 'slots' in imageCtx ? imageCtx.slots : undefined;
  const illustrationSlots =
    illustrationCtx && 'slots' in illustrationCtx ? illustrationCtx.slots : undefined;

  return (
    <Provider
      values={[
        [
          ImageContext,
          {
            ...imageCtx,
            slots: {
              ...imageSlots,
              thumbnail: {
                ...imageSlots?.thumbnail,
                styles: mergeStyles(imageSlots?.thumbnail?.styles, opacityStyles)
              }
            }
          }
        ],
        [
          IllustrationContext,
          {
            slots: {
              ...illustrationSlots,
              thumbnail: {
                ...illustrationSlots?.thumbnail,
                styles: mergeStyles(illustrationSlots?.thumbnail?.styles, opacityStyles)
              }
            }
          }
        ]
      ]}>
      {children}
    </Provider>
  );
}

interface AttachmentCardProps {
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  isInvalid?: boolean;
  children: ReactNode;
}

function AttachmentCard({size = 'M', isInvalid = false, children}: AttachmentCardProps) {
  return (
    <div aria-invalid={isInvalid || undefined} className={attachmentCard({size, isInvalid})}>
      <Provider
        values={[
          [
            ImageContext,
            {
              slots: {
                thumbnail: {
                  alt: '',
                  styles: style({
                    position: 'relative',
                    alignSelf: 'center',
                    flexShrink: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    size: '--basic-thumb-size',
                    borderRadius: '[3px]',
                    objectFit: 'cover',
                    outlineStyle: 'solid',
                    outlineWidth: {
                      default: 2,
                      size: {
                        XS: 1
                      }
                    },
                    outlineColor: '--s2-container-bg'
                  })({size})
                }
              }
            }
          ],
          [
            IllustrationContext,
            {
              slots: {
                thumbnail: {
                  styles: illustThumbnailStyles,
                  // @ts-ignore
                  'data-rsp-slot': 'illustration'
                }
              }
            }
          ],
          [
            TextContext,
            {
              slots: {
                [DEFAULT_SLOT]: {},
                title: {styles: attachmentTitle({size})},
                description: {styles: attachmentDescription({size})}
              }
            }
          ],
          [
            ContentContext,
            {
              styles: attachmentContent({size}),
              // @ts-ignore
              'data-slot': 'content'
            }
          ]
        ]}>
        <ImageCoordinator>{children}</ImageCoordinator>
      </Provider>
    </div>
  );
}

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
    isInvalid,
    children,
    size = 'M'
  } = props;
  let domRef = useDOMRef(ref);
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  return (
    <Tag
      id={id}
      textValue={textValue}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      ref={domRef}
      className={renderProps => mergeStyles(tagStyles({...renderProps}), styles)}>
      <AttachmentCard size={size} isInvalid={isInvalid}>
        {props.uploadProgress != null && props.uploadProgress < 100 && (
          <div
            className={style({
              position: 'absolute',
              top: '50%',
              insetStart: {
                default: '50%',
                ':has(~ [data-slot=content]):not(:has(~ [data-rsp-slot=thumbnail]))':
                  '[calc(var(--card-padding-x) + var(--basic-thumb-size) / 2)]',
                ':has(~ [data-slot=content]):has(~ [data-rsp-slot=thumbnail])':
                  '[calc(var(--card-padding-x) + var(--illust-margin-x) + var(--illust-thumb-size) / 2)]'
              },
              transform: 'translate(-50%, -50%)'
            })}>
            <ProgressCircle
              aria-label={stringFormatter.format('promptfield.uploading')}
              value={props.uploadProgress}
              // TODO: should probably be M for most thumbnail only attachments at varying sizes, but needs to be S if there is text content
              // aka like a actualy horizontal card, but to do this I need to know if text sibling is there...
              size="S"
            />
          </div>
        )}
        <AttachmentContextProvider
          isInvalid={isInvalid}
          isUploading={props.uploadProgress != null && props.uploadProgress < 100}>
          {typeof children === 'function' ? children({size}) : children}
        </AttachmentContextProvider>
        {isInvalid && (
          <div aria-hidden="true" className={attachmentErrorStyles}>
            <AlertTriangleIcon size={size} />
          </div>
        )}
      </AttachmentCard>
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

function AlertTriangleIcon({size}) {
  switch (size) {
    case 'XS':
      return <AlertTriangle styles={iconStyle({size: 'XS'})} />;
    case 'S':
      return <AlertTriangle styles={iconStyle({size: 'S'})} />;
    case 'M':
      return <AlertTriangle styles={iconStyle({size: 'M'})} />;
    case 'L':
      return <AlertTriangle styles={iconStyle({size: 'L'})} />;
    case 'XL':
      return <AlertTriangle styles={iconStyle({size: 'XL'})} />;
  }
}
