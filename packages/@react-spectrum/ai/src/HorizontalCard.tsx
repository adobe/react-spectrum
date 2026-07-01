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

import {ActionMenuContext} from '@react-spectrum/s2/ActionMenu';
import {ButtonContext} from '@react-spectrum/s2/Button';
import {Checkbox} from '@react-spectrum/s2/Checkbox';
import {
  color,
  focusRing,
  lightDark,
  space,
  style
} from '@react-spectrum/s2/style' with {type: 'macro'};
import {composeRenderProps} from 'react-aria-components/composeRenderProps';
import {ContentContext} from '@react-spectrum/s2/Content';
import {createContext, forwardRef, ReactNode, useContext} from 'react';
import {DEFAULT_SLOT, Provider} from 'react-aria-components/slots';
import {DOMProps, DOMRef, GlobalDOMAttributes} from '@react-types/shared';
import {filterDOMProps} from 'react-aria/filterDOMProps';
import {FooterContext} from '@react-spectrum/s2/Footer';
import {GridListItem, GridListItemProps} from 'react-aria-components/GridList';
import {ImageContext} from '@react-spectrum/s2/Image';
import {ImageCoordinator} from '@react-spectrum/s2/ImageCoordinator';
import {inertValue} from 'react-aria/private/utils/inertValue';
import {Link} from 'react-aria-components/Link';
import {LinkButtonContext} from '@react-spectrum/s2/LinkButton';
import {mergeStyles} from '@react-spectrum/s2/mergeStyles';
import {pressScale} from '@react-spectrum/s2/pressScale';
import {SkeletonContext, useIsSkeleton} from '@react-spectrum/s2/Skeleton';
import {StyleString} from '@react-spectrum/s2/style' with {type: 'macro'};
import {TextContext} from '@react-spectrum/s2/Text';
import {useDOMRef} from './useDOMRef';
interface HorizontalCardRenderProps {
  /** The size of the Card. */
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
}

export interface HorizontalCardProps extends Omit<
  GridListItemProps,
  | 'className'
  | 'style'
  | 'render'
  | 'children'
  | 'onHoverChange'
  | 'onHoverStart'
  | 'onHoverEnd'
  | 'onClick'
  | keyof GlobalDOMAttributes
> {
  /** The children of the Card. */
  children: ReactNode | ((renderProps: HorizontalCardRenderProps) => ReactNode);
  /**
   * The size of the Card.
   *
   * @default 'M'
   */
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  /**
   * The amount of internal padding within the Card.
   *
   * @default 'regular'
   */
  density?: 'compact' | 'regular' | 'spacious';
  /**
   * The visual style of the Card.
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

export interface BasicCardProps extends Omit<HorizontalCardProps, 'variant'> {
  /**
   * The visual style of the Card.
   *
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quiet';
}

const borderRadius = {
  default: 'lg',
  size: {
    XS: 'default',
    S: 'default'
  },
  isBasic: 'default'
} as const;

// Figma missing a lot of combinations of variant, tshirt, density
// Quiet Basic cards?
// Does Basic not participate in selection? (It does, but it's denoted by the border...)
// Why is there a flipped horizontal card?
// Max width on contents for horizontal cards? Doesn't appear to be one that includes the preview because the preview can have any ratio and that
// causes the width grow.
// (Max) height on cards? Maybe that makes more sense.

const onlyPreview = ':not(:has([data-slot=content])):not(:has([data-slot=preview]))';

let card = style({
  display: 'flex',
  flexDirection: 'row',
  position: 'relative',
  borderRadius,
  '--s2-container-bg': {
    type: 'backgroundColor',
    value: {
      variant: {
        primary: 'elevated',
        secondary: 'layer-1',
        tertiary: 'layer-2'
      },
      isBasic: {
        variant: {
          primary: 'layer-2',
          secondary: 'layer-1',
          tertiary: 'layer-2',
          quiet: 'layer-2'
        }
      },
      forcedColors: 'ButtonFace'
    }
  },
  backgroundColor: '--s2-container-bg',
  // TODO: No box shadow for basic, secondary, dark
  // also none for basic tertiary
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isFocusVisible: 'elevated',
    isSelected: 'elevated',
    forcedColors: '[0 0 0 1px var(--hcm-buttonborder, ButtonBorder)]',
    variant: {
      tertiary: {
        // Render border with box-shadow to avoid affecting layout.
        default: `[0 0 0 2px ${color('gray-100')}]`,
        isHovered: `[0 0 0 2px ${color('gray-200')}]`,
        isFocusVisible: `[0 0 0 2px ${color('gray-200')}]`,
        isSelected: 'none',
        forcedColors: '[0 0 0 2px var(--hcm-buttonborder, ButtonBorder)]'
      },
      quiet: 'none'
    }
  },
  forcedColorAdjust: 'none',
  transition: 'default',
  fontFamily: 'sans',
  textDecoration: 'none',
  overflow: {
    default: 'clip',
    variant: {
      quiet: 'visible'
    }
  },
  contain: 'layout',
  disableTapHighlight: true,
  userSelect: {
    isCardView: 'none'
  },
  cursor: {
    isLink: 'pointer'
  },
  height: {
    default: {
      size: {
        XS: 160,
        S: 180,
        M: 200,
        L: 220,
        XL: 240
      }
    },
    isBasic: {
      default: 68,
      size: {
        XS: 52,
        S: 60,
        M: 68,
        L: 76,
        XL: 80
      }
    },
    isCardView: 'full'
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
      density: {
        compact: {
          size: {
            XS: '[6px]',
            S: 8,
            M: 12,
            L: 16,
            XL: 20
          }
        },
        regular: {
          size: {
            XS: 8,
            S: 12,
            M: 16,
            L: 20,
            XL: 24
          }
        },
        spacious: {
          size: {
            XS: 12,
            S: 16,
            M: 20,
            L: 24,
            XL: 28
          }
        }
      },
      [onlyPreview]: 0
    }
  },
  alignItems: {
    isBasic: 'center'
  },
  '--card-padding-y': {
    type: 'paddingTop',
    value: {
      default: '--card-spacing'
    }
  },
  '--card-padding-x': {
    type: 'paddingStart',
    value: {
      default: '--card-spacing'
    }
  },
  paddingY: '--card-padding-y',
  paddingX: '--card-padding-x',
  boxSizing: 'border-box',
  ...focusRing(),
  outlineStyle: {
    default: 'none',
    isFocusVisible: 'solid',
    // Focus ring moves to preview when quiet.
    variant: {
      quiet: 'none'
    }
  },
  '--basic-thumb-size': {
    type: 'height',
    value: {
      default: 68,
      size: {
        XS: 24,
        S: 26,
        M: 32,
        L: 36,
        XL: 40
      },
      [onlyPreview]: 'full'
    }
  }
});

let selectionIndicator = style({
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  borderRadius,
  pointerEvents: 'none',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: 'gray-1000',
  transition: 'default',
  opacity: {
    default: 0,
    isSelected: 1
  },
  // Quiet cards with no checkbox have an extra inner stroke
  // to distinguish the selection indicator from the preview.
  outlineColor: lightDark('transparent-white-600', 'transparent-black-600'),
  outlineOffset: -4,
  outlineStyle: {
    default: 'none',
    isStrokeInner: 'solid'
  },
  outlineWidth: 2
});

let preview = style({
  position: 'relative',
  transition: 'default',
  overflow: 'clip',
  marginY: 'calc(var(--card-padding-y) * -1)',
  marginStart: 'calc(var(--card-padding-x) * -1)',
  marginEnd: {
    ':last-child': 'calc(var(--card-padding-x) * -1)'
  },
  borderRadius: {
    isQuiet: borderRadius
  },
  boxShadow: {
    isQuiet: {
      isHovered: 'elevated',
      isFocusVisible: 'elevated',
      isSelected: 'elevated'
    }
  },
  ...focusRing(),
  outlineStyle: {
    default: 'none',
    isQuiet: {
      isFocusVisible: 'solid'
    }
  }
});

const image = style({
  height: 'full',
  aspectRatio: '1/1',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none'
});

let title = style({
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
  lineClamp: 3,
  gridArea: 'title'
});

let description = style({
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
  lineClamp: 3,
  gridArea: 'description'
});

let content = style({
  display: 'grid',
  // By default, all elements are displayed in a stack.
  // If an action menu is present, place it next to the title.
  gridTemplateColumns: {
    default: ['1fr'],
    ':has([data-slot=menu])': ['minmax(0, 1fr)', 'auto']
  },
  gridTemplateAreas: {
    default: ['title', 'description'],
    ':has([data-slot=menu])': ['title menu', 'description description']
  },
  columnGap: 4,
  flexGrow: 1,
  alignItems: 'baseline',
  alignContent: 'start',
  rowGap: {
    size: {
      XS: 4,
      S: 4,
      M: space(6),
      L: space(6),
      XL: 8
    }
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

let actionMenu = style({
  gridArea: 'menu',
  // Don't cause the row to expand, preserve gap between title and description text.
  // Would use -100% here but it doesn't work in Firefox.
  marginY: 'calc(-1 * self(height))'
});

let footer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8
});

export const InternalCardViewContext = createContext({
  ElementType: 'div' as 'div' | typeof GridListItem,
  layout: 'grid' as 'grid' | 'waterfall'
});

interface InternalCardContextValue {
  isQuiet: boolean;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  isSelected: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isPressed: boolean;
  isCheckboxSelection: boolean;
}

const InternalCardContext = createContext<InternalCardContextValue>({
  isQuiet: false,
  size: 'M',
  isSelected: false,
  isHovered: false,
  isFocusVisible: false,
  isPressed: false,
  isCheckboxSelection: true
});

const actionButtonSize = {
  XS: 'XS',
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

const Card = forwardRef(function Card(
  props: Omit<HorizontalCardProps, 'variant'> & {
    isBasic?: boolean;
    variant?: 'primary' | 'secondary' | 'tertiary' | 'quiet';
  },
  ref: DOMRef<HTMLDivElement>
) {
  let {ElementType} = useContext(InternalCardViewContext);
  let domRef = useDOMRef(ref);
  let {
    isBasic = false,
    density = 'regular',
    size = 'M',
    variant = 'primary',
    styles,
    id,
    ...otherProps
  } = props;
  let isQuiet = variant === 'quiet';
  let isSkeleton = useIsSkeleton();
  let children = (
    <Provider
      values={[
        [ImageContext, {alt: '', styles: image}],
        [
          TextContext,
          {
            slots: {
              [DEFAULT_SLOT]: {},
              title: {styles: title({size})},
              description: {styles: description({size})}
            }
          }
        ],
        [
          ContentContext,
          {
            styles: content({size}),
            // @ts-ignore
            'data-slot': 'content'
          }
        ],
        [FooterContext, {styles: footer}],
        [
          ActionMenuContext,
          {
            isQuiet: true,
            size: actionButtonSize[size],
            isDisabled: isSkeleton,
            // @ts-ignore
            'data-slot': 'menu',
            styles: actionMenu
          }
        ],
        [SkeletonContext, isSkeleton]
      ]}>
      <ImageCoordinator>
        {typeof props.children === 'function' ? props.children({size}) : props.children}
      </ImageCoordinator>
    </Provider>
  );

  // oxlint-disable-next-line react/react-compiler
  let press = pressScale(domRef);
  if (ElementType === 'div' && !isSkeleton && props.href) {
    // Standalone Card that has an href should be rendered as a Link.
    // NOTE: In this case, the card must not contain interactive elements.
    return (
      <Link
        {...filterDOMProps(otherProps, {isLink: true})}
        ref={domRef as any}
        className={renderProps =>
          mergeStyles(
            card({
              ...renderProps,
              size,
              density,
              variant,
              isBasic,
              isCardView: false,
              isLink: true
            }),
            styles
          )
        }
        style={renderProps =>
          // Only the preview in quiet cards scales down on press
          variant === 'quiet' ? undefined : press(renderProps)
        }>
        {renderProps => (
          <InternalCardContext.Provider
            value={{size, isQuiet, isCheckboxSelection: false, isSelected: false, ...renderProps}}>
            {children}
          </InternalCardContext.Provider>
        )}
      </Link>
    );
  }

  if (ElementType === 'div' || isSkeleton) {
    return (
      <div
        {...filterDOMProps(otherProps)}
        id={id != null ? String(id) : undefined}
        // @ts-ignore - React < 19 compat
        inert={inertValue(isSkeleton)}
        ref={domRef}
        className={mergeStyles(
          card({size, density, variant, isBasic, isCardView: ElementType !== 'div'}),
          styles
        )}>
        <InternalCardContext.Provider
          value={{
            size,
            isQuiet,
            isCheckboxSelection: false,
            isHovered: false,
            isFocusVisible: false,
            isSelected: false,
            isPressed: false
          }}>
          {children}
        </InternalCardContext.Provider>
      </div>
    );
  }

  return (
    <ElementType
      {...props}
      ref={domRef}
      className={renderProps =>
        mergeStyles(
          card({
            ...renderProps,
            isCardView: true,
            isLink: !!props.href,
            size,
            density,
            variant,
            isBasic
          }),
          styles
        )
      }
      style={renderProps =>
        // Only the preview in quiet cards scales down on press
        variant === 'quiet' ? undefined : press(renderProps)
      }>
      {({selectionMode, selectionBehavior, isHovered, isFocusVisible, isSelected, isPressed}) => (
        <InternalCardContext.Provider
          value={{
            size,
            isQuiet,
            isCheckboxSelection: selectionMode !== 'none' && selectionBehavior === 'toggle',
            isHovered,
            isFocusVisible,
            isSelected,
            isPressed
          }}>
          {/* Selection indicator and checkbox move inside the preview for quiet cards */}
          {!isQuiet && <SelectionIndicator />}
          {!isQuiet && selectionMode !== 'none' && selectionBehavior === 'toggle' && (
            <CardCheckbox />
          )}
          {/* this makes the :first-child selector work even with the checkbox */}
          <div className={style({display: 'contents'})}>{children}</div>
        </InternalCardContext.Provider>
      )}
    </ElementType>
  );
});

function SelectionIndicator() {
  let {size, isSelected, isQuiet, isCheckboxSelection} = useContext(InternalCardContext);
  return (
    <div
      className={selectionIndicator({
        size,
        isSelected,
        // Add an inner stroke only for quiet cards with no checkbox to
        // help distinguish the selected state from the preview.
        isStrokeInner: isQuiet && !isCheckboxSelection
      })}
    />
  );
}

function CardCheckbox() {
  let {size} = useContext(InternalCardContext);
  return (
    <div
      className={style({
        position: 'absolute',
        top: '--card-spacing',
        insetStart: '--card-spacing',
        zIndex: 2,
        padding: 4,
        backgroundColor: lightDark('transparent-white-600', 'transparent-black-600'),
        borderRadius: 'default',
        boxShadow: 'emphasized'
      })}>
      <Checkbox slot="selection" excludeFromTabOrder size={size === 'XS' ? 'S' : size} />
    </div>
  );
}

export interface CardPreviewProps extends DOMProps {
  children: ReactNode;
  /**
   * Spectrum-defined styles, returned by the `style()` macro.
   */
  styles?: StyleString;
}

// TODO: this should be the same component as the one in @react-spectrum/s2/Card
export const CardPreview = forwardRef(function CardPreview(
  props: CardPreviewProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size, isQuiet, isHovered, isFocusVisible, isSelected, isPressed, isCheckboxSelection} =
    useContext(InternalCardContext);
  let domRef = useDOMRef(ref);
  // oxlint-disable react/react-compiler
  return (
    <div
      {...filterDOMProps(props)}
      slot="preview"
      ref={domRef}
      className={preview({size, isQuiet, isHovered, isFocusVisible, isSelected})}
      style={isQuiet ? pressScale(domRef)({isPressed}) : undefined}>
      {isQuiet && <SelectionIndicator />}
      {isQuiet && isCheckboxSelection && <CardCheckbox />}
      <div className={style({borderRadius: 'inherit', overflow: 'clip', height: 'full'})}>
        {props.children}
      </div>
    </div>
  );
  // oxlint-enable react/react-compiler
});

const collection = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: {
    default: 4,
    size: {
      XS: 2,
      S: 2
    }
  }
});

const collectionImage = style({
  width: 'full',
  gridColumnEnd: {
    ':nth-last-child(4):first-child': 'span 3'
  },
  objectFit: 'cover',
  pointerEvents: 'none',
  userSelect: 'none'
});

export const CollectionCardPreview = forwardRef(function CollectionCardPreview(
  props: CardPreviewProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size} = useContext(InternalCardContext)!;
  return (
    <CardPreview {...props} ref={ref}>
      <div className={collection({size})}>
        <ImageContext.Provider value={{styles: collectionImage}}>
          {props.children}
        </ImageContext.Provider>
      </div>
    </CardPreview>
  );
});

const buttonSize = {
  XS: 'S',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL'
} as const;

export const HorizontalCard = forwardRef(function HorizontalCard(
  props: HorizontalCardProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'M'} = props;
  return (
    <Card {...props} size={size} ref={ref}>
      {composeRenderProps(props.children, children => (
        <Provider
          values={[
            [
              ImageContext,
              {
                slots: {
                  preview: {
                    alt: '',
                    styles: style({
                      height: 'full',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    })
                  },
                  thumbnail: {
                    alt: '',
                    styles: style({
                      // if there is a preview sibling, the thumbnail should be absolute
                      // otherwise, it should be relative
                      position: 'absolute',
                      insetStart: 8,
                      bottom: 8,
                      pointerEvents: 'none',
                      userSelect: 'none',
                      size: {
                        size: {
                          XS: 24,
                          S: 26,
                          M: 32,
                          L: 36,
                          XL: 40
                        }
                      },
                      borderRadius: {
                        default: 'default',
                        size: {
                          XS: 'sm',
                          S: 'sm'
                        }
                      },
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
              FooterContext,
              {
                styles: mergeStyles(
                  footer,
                  style({
                    justifyContent: 'end'
                  })
                )
              }
            ],
            [ButtonContext, {size: buttonSize[size]}],
            [LinkButtonContext, {size: buttonSize[size]}]
          ]}>
          {children}
        </Provider>
      ))}
    </Card>
  );
});

export const BasicHorizontalCard = forwardRef(function BasicHorizontalCard(
  props: BasicCardProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'M'} = props;
  return (
    <Card {...props} size={size} ref={ref} isBasic>
      {composeRenderProps(props.children, children => (
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
              FooterContext,
              {
                styles: mergeStyles(
                  footer,
                  style({
                    justifyContent: 'end'
                  })
                )
              }
            ],
            [ButtonContext, {size: buttonSize[size]}],
            [LinkButtonContext, {size: buttonSize[size]}]
          ]}>
          {children}
        </Provider>
      ))}
    </Card>
  );
});
