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
import AudioWave from '@react-spectrum/s2/icons/AudioWave';
import {
  baseColor,
  css,
  focusRing,
  iconStyle,
  lightDark,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Button, ButtonProps} from 'react-aria-components/Button';
import {CardProps} from '@react-spectrum/s2/Card';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import ChevronRight from '@react-spectrum/s2/icons/ChevronRight';
import {ContentContext} from '@react-spectrum/s2/Content';
import {createContext, CSSProperties, forwardRef, ReactNode, useContext, useRef} from 'react';
import Cross from '../ui-icons/Cross';
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import File from '@react-spectrum/s2/icons/File';
import FileText from '@react-spectrum/s2/icons/FileText';
import {Image, ImageContext, ImageProps} from '@react-spectrum/s2/Image';
import {ImageCoordinator} from '@react-spectrum/s2/ImageCoordinator';
import ImageIcon from '@react-spectrum/s2/icons/Image';
import intlMessages from '../intl/*.json';
import {keyframes, scrollFade} from './tokens.macro' with {type: 'macro'};
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import Play from '@react-spectrum/s2/icons/Play';
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
import {useLocale} from 'react-aria/I18nProvider';
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

const closeButton = style<{
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
    default: baseColor('gray-200'),
    forcedColors: 'ButtonFace'
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

const container = {
  backgroundColor: {
    default: lightDark('black/3', 'white/3'),
    isInvalid: 'red-700/8',
    forcedColors: 'ButtonFace'
  }
} as const;

const attachmentCard = style({
  ...container,
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  borderRadius: 'lg',
  outlineStyle: 'solid',
  outlineWidth: 1,
  outlineOffset: -1,
  outlineColor: {
    default: lightDark('black/3', 'white/3'),
    isLoading: lightDark('black/2', 'white/2'),
    forcedColors: 'ButtonBorder',
    isInvalid: {
      default: 'negative-900',
      forcedColors: 'Mark'
    }
  },
  forcedColorAdjust: 'none',
  cursor: 'default',
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
  '--image-size': {
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
  '--image-border-radius': {
    type: 'borderTopStartRadius',
    value: {
      default: '[3px]',
      [onlyPreview]: 'lg'
    }
  }
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

const attachmentContent = style({
  display: 'grid',
  gridTemplateColumns: ['minmax(0, 1fr)'],
  gridTemplateAreas: ['title', 'description'],
  columnGap: 4,
  flexGrow: 1,
  minWidth: 0,
  alignItems: 'baseline',
  alignContent: 'start',
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
        mergeStyles(closeButton({...renderProps, size: props.size || 'M'}), props.styles)
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

const flexRow = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center'
} as const;

const tagListStyles = style({
  ...flexRow,
  flexGrow: 1,
  gap: 8,
  overflowX: 'auto',
  overflowY: 'clip',
  scrollbarWidth: {
    '@supports (animation-timeline: scroll())': 'none'
  },
  scrollSnapType: 'x mandatory',
  // padding for focus ring
  padding: 16,
  margin: -16,
  boxSizing: 'border-box',
  scrollPaddingX: {
    default: 16,
    '@supports (animation-timeline: scroll())': 64
  }
});

const buttonFade = keyframes(`
  from { opacity: 0; visibility: hidden }
  to { opacity: 1; visibility: visible }
`);

const carouselNavButtonStyles = style<{
  isDisabled: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isPressed: boolean;
  direction: 'ltr' | 'rtl';
  side: 'start' | 'end';
}>({
  ...focusRing(),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  size: controlSizeM,
  flexShrink: 0,
  borderRadius: 'full',
  borderStyle: 'none',
  transition: 'default',
  backgroundColor: {
    default: baseColor('transparent-overlay-100'),
    forcedColors: 'ButtonFace'
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
  scale: {
    direction: {
      rtl: -1
    }
  },
  disableTapHighlight: true,
  position: 'absolute',
  zIndex: 1,
  insetEnd: {
    side: {
      end: 0
    }
  },
  opacity: {
    default: 0,
    isFocusVisible: 1
  },
  visibility: {
    default: 'hidden',
    isFocusVisible: 'visible'
  },
  animation: {
    '@supports (animation-timeline: scroll())': buttonFade,
    isFocusVisible: 'none'
  },
  animationDuration: 1,
  animationTimingFunction: 'in-out',
  animationFillMode: 'both',
  animationDirection: {
    side: {
      start: 'normal',
      end: 'reverse'
    }
  }
});

function CarouselNavButton({side, ...otherProps}: ButtonProps & {side: 'start' | 'end'}) {
  let ref = useRef(null);
  let {direction} = useLocale();
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');
  let Icon = side === 'start' ? ChevronLeft : ChevronRight;
  // oxlint-disable react/react-compiler
  return (
    <Button
      {...otherProps}
      ref={ref}
      aria-label={stringFormatter.format(
        side === 'start' ? 'attachmentlist.previousAttachments' : 'attachmentlist.nextAttachments'
      )}
      style={pressScale(ref, {
        animationTimeline: '--carousel-scroll',
        animationRange: side === 'start' ? '0px 32px' : 'calc(100% - 32px) 100%'
      } as CSSProperties)}
      className={renderProps => carouselNavButtonStyles({...renderProps, direction, side})}>
      <Icon />
    </Button>
  );
  // oxlint-enable react/react-compiler
}

/**
 * An AttachmentList displays removable file attachments with previews and upload states.
 */
export const AttachmentList = (forwardRef as forwardRefType)(function AttachmentList<T>(
  props: AttachmentListProps<T>,
  ref: DOMRef<HTMLDivElement>
) {
  let {styles, items, children, dependencies, ...otherProps} = props;
  let domRef = useDOMRef(ref);
  let scrollRef = useRef<HTMLDivElement>(null);
  let {direction} = useLocale();
  let scroll = (dir: 1 | -1) => {
    let el = scrollRef.current;
    if (!el) {
      return;
    }

    // RTL flips the scroll direction convention; flip the sign to match.
    let sign = direction === 'rtl' ? -1 : 1;
    el.scrollTo({
      left: Math.max(
        0,
        Math.min(
          el.scrollWidth - el.clientWidth,
          el.scrollLeft + sign * dir * (el.clientWidth - 64 * 2)
        )
      ),
      behavior: 'smooth'
    });
  };

  return (
    <TagGroup
      {...otherProps}
      className={mergeStyles(style({...flexRow, gap: 8, position: 'relative'}), styles)}
      style={
        {
          timelineScope: '--carousel-scroll'
        } as CSSProperties
      }
      ref={domRef}>
      <CarouselNavButton side="start" onPress={() => scroll(-1)} />
      <TagList
        ref={scrollRef}
        items={items}
        dependencies={dependencies}
        className={
          tagListStyles +
          ' ' +
          scrollFade({x: 32, inset: 56}) +
          ' ' +
          // Hack to keep scroll fade visible when the buttons are focused.
          // 88px = 32 + 56
          css(
            `&:is(button[data-focus-visible]+*){--scroll-fade-left: 88px !important} &:has(+ button[data-focus-visible]){--scroll-fade-right: calc(100% - 88px) !important}`
          )
        }
        style={
          {
            scrollTimelineName: '--carousel-scroll',
            scrollTimelineAxis: 'inline'
          } as CSSProperties
        }>
        {children}
      </TagList>
      <CarouselNavButton side="end" onPress={() => scroll(1)} />
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
  borderRadius: 'lg',
  maxWidth: 'calc(100% - 52px * 2)',
  scrollSnapAlign: 'start'
});
interface AttachmentCardProps {
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  isInvalid?: boolean;
  isLoading?: boolean;
  children: ReactNode;
}

function AttachmentCard({
  size = 'M',
  isInvalid = false,
  isLoading = false,
  children
}: AttachmentCardProps) {
  return (
    <div
      aria-invalid={isInvalid || undefined}
      className={attachmentCard({size, isInvalid, isLoading})}>
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
                    size: '--image-size',
                    borderRadius: '--image-border-radius',
                    objectFit: 'cover',
                    outlineStyle: 'solid',
                    outlineWidth: 1,
                    outlineColor: 'gray-800/10',
                    outlineOffset: -1
                  })
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
              styles: attachmentContent,
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
  let isLoading = props.uploadProgress != null && props.uploadProgress < 100;
  return (
    <Tag
      id={id}
      textValue={textValue}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-describedby={ariaDescribedby}
      ref={domRef}
      className={renderProps => mergeStyles(tagStyles({...renderProps}), styles)}>
      <AttachmentCard size={size} isInvalid={isInvalid} isLoading={isLoading}>
        <AttachmentPreviewContext.Provider
          value={{isInvalid: !!isInvalid, uploadProgress: props.uploadProgress ?? 100, size}}>
          {typeof children === 'function' ? children({size}) : children}
        </AttachmentPreviewContext.Provider>
      </AttachmentCard>
      {/** Definitely not a close button, though looks like one. */}
      <div
        className={style({
          position: 'absolute',
          top: 0,
          insetEnd: 0,
          transform: 'translate(30%, -30%)'
        })}>
        <CloseButton size="XS" />
      </div>
    </Tag>
  );
});

const attachmentPreviewWrapper = style({
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

const AttachmentPreviewContext = createContext({
  isInvalid: false,
  uploadProgress: 100,
  size: 'S' as 'XS' | 'S' | 'M' | 'L' | 'XL'
});

export interface AttachmentPreviewProps extends ImageProps {
  mimeType: string;
}

export function AttachmentPreview(props: AttachmentPreviewProps) {
  let {mimeType, ...otherProps} = props;
  let {isInvalid, uploadProgress, size} = useContext(AttachmentPreviewContext)!;
  let stringFormatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/ai');

  if (isInvalid) {
    return (
      <div className={attachmentPreviewWrapper}>
        <AlertTriangleIcon size={size} />
      </div>
    );
  }

  if (uploadProgress < 100) {
    return (
      <div className={attachmentPreviewWrapper}>
        <ProgressCircle
          aria-label={stringFormatter.format('promptfield.uploading')}
          value={uploadProgress}
          size="S"
        />
      </div>
    );
  }

  if (otherProps.src) {
    return <Image {...otherProps} slot="thumbnail" />;
  }

  if (mimeType.startsWith('audio/')) {
    return (
      <div className={attachmentPreviewWrapper}>
        <AudioWave />
      </div>
    );
  }

  if (mimeType.startsWith('video/')) {
    return (
      <div className={attachmentPreviewWrapper}>
        <Play />
      </div>
    );
  }

  if (mimeType.startsWith('image/')) {
    return (
      <div className={attachmentPreviewWrapper}>
        <ImageIcon />
      </div>
    );
  }

  if (mimeType.startsWith('text/')) {
    return (
      <div className={attachmentPreviewWrapper}>
        <FileText />
      </div>
    );
  }

  return (
    <div className={attachmentPreviewWrapper}>
      <File />
    </div>
  );
}

function AlertTriangleIcon({size}) {
  switch (size) {
    case 'XS':
      return <AlertTriangle styles={iconStyle({size: 'XS', color: 'negative'})} />;
    case 'S':
      return <AlertTriangle styles={iconStyle({size: 'S', color: 'negative'})} />;
    case 'M':
      return <AlertTriangle styles={iconStyle({size: 'M', color: 'negative'})} />;
    case 'L':
      return <AlertTriangle styles={iconStyle({size: 'L', color: 'negative'})} />;
    case 'XL':
      return <AlertTriangle styles={iconStyle({size: 'XL', color: 'negative'})} />;
  }
}
