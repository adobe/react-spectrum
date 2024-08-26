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

import {ActionMenuContext} from './ActionMenu';
import {AvatarContext} from './Avatar';
import {Button, ContextValue, DEFAULT_SLOT, GridListItemProps, Provider, useContextProps} from 'react-aria-components';
import {ButtonContext, LinkButtonContext} from './Button';
import {Checkbox} from './Checkbox';
import {colorToken} from '../style/tokens' with {type: 'macro'};
import {ContentContext, FooterContext, TextContext} from './Content';
import {createContext, ElementType, ReactNode, useContext} from 'react';
import {DividerContext} from './Divider';
import {focusRing, StyleProps} from './style-utils' with {type: 'macro'};
import {IllustrationContext} from './Icon';
import {ImageContext} from './Image';
import {ImageCoordinator} from './ImageCoordinator';
import {mergeStyles} from '../style/runtime';
import {PressResponder} from '@react-aria/interactions';
import {size, style} from '../style/spectrum-theme' with {type: 'macro'};
import {SkeletonContext, SkeletonWrapper} from './Skeleton';

export interface CardProps extends Omit<GridListItemProps, 'className' | 'style' | 'children'>, StyleProps {
  children: ReactNode,
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL',
  density?: 'compact' | 'regular' | 'spacious',
  variant?: 'primary' | 'secondary' | 'tertiary' | 'quiet',
  orientation?: 'vertical' | 'horizontal'
}

const borderRadius = {
  default: 'lg',
  size: {
    XS: 'default',
    S: 'default'
  }
} as const;

let card = style({
  display: 'flex',
  flexDirection: {
    orientation: {
      vertical: 'column',
      horizontal: 'row'
    }
  },
  position: 'relative',
  borderRadius,
  '--card-bg': {
    type: 'backgroundColor',
    value: {
      variant: {
        primary: 'elevated',
        secondary: 'layer-1',
        tertiary: 'transparent',
        quiet: 'transparent'
      },
      forcedColors: 'ButtonFace'
    }
  },
  backgroundColor: '--card-bg',
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isFocusVisible: 'elevated',
    isSelected: 'elevated',
    forcedColors: '[0 0 0 1px ButtonBorder]',
    variant: {
      tertiary: {
        // Render border with box-shadow to avoid affecting layout.
        default: `[0 0 0 1px ${colorToken('gray-100')}]`,
        isHovered: `[0 0 0 1px ${colorToken('gray-200')}]`,
        isFocusVisible: `[0 0 0 1px ${colorToken('gray-200')}]`,
        isSelected: 'none',
        forcedColors: '[0 0 0 1px ButtonBorder]'
      },
      quiet: 'none'
    }
  },
  forcedColorAdjust: 'none',
  transition: 'default',
  fontFamily: 'sans',
  overflow: {
    default: 'clip',
    variant: {
      quiet: 'visible'
    }
  },
  disableTapHighlight: true,
  userSelect: {
    isCardView: 'none'
  },
  width: {
    size: {
      XS: 112,
      S: 192,
      M: 240,
      L: 320,
      XL: size(400)
    },
    isCardView: 'full'
  },
  height: 'full',
  '--card-spacing': {
    type: 'paddingTop',
    value: {
      density: {
        compact: {
          size: {
            XS: size(6),
            S: size(10),
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
      }
    }
  },
  '--card-padding-y': {
    type: 'paddingTop',
    value: {
      default: '--card-spacing',
      variant: {
        quiet: 0
      }
    }
  },
  '--card-padding-x': {
    type: 'paddingStart',
    value: {
      default: '--card-spacing',
      variant: {
        quiet: 0
      }
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
  }
  // outlineColor: 'white',
  // outlineOffset: -4,
  // outlineStyle: 'solid',
  // outlineWidth: 2
});

let preview = style({
  position: 'relative',
  transition: 'default',
  overflow: 'clip',
  marginX: '[calc(var(--card-padding-x) * -1)]',
  marginTop: '[calc(var(--card-padding-y) * -1)]',
  marginBottom: {
    ':last-child': '[calc(var(--card-padding-y) * -1)]'
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
  width: 'full',
  aspectRatio: '[3/2]',
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
  lineClamp: 3
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
  gridColumnEnd: 'span 2'
});

let content = style({
  display: 'grid',
  gridTemplateColumns: ['1fr', 'auto'],
  flexDirection: 'column',
  flexGrow: 1,
  alignItems: 'baseline',
  alignContent: 'space-between',
  rowGap: {
    default: 8,
    size: {
      XS: 4
    }
  },
  paddingTop: {
    default: '--card-spacing',
    ':first-child': 0
  },
  paddingBottom: {
    default: '[calc(var(--card-spacing) * 1.5 / 2)]',
    ':last-child': 0
  }
});

let footer = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'end',
  justifyContent: 'space-between',
  gap: 8,
  paddingTop: '[calc(var(--card-spacing) * 1.5 / 2)]'
});

export const CardViewContext = createContext<ElementType>('div');
export const CardContext = createContext<ContextValue<Partial<CardProps>, HTMLElement>>(null);

interface InternalCardContextValue {
  isQuiet: boolean,
  size: 'XS' | 'S' | 'M' | 'L' | 'XL',
  isSelected: boolean,
  isHovered: boolean,
  isFocusVisible: boolean
}

const InternalCardContext = createContext<InternalCardContextValue>({
  isQuiet: false,
  size: 'M',
  isSelected: false,
  isHovered: false,
  isFocusVisible: false
});

const actionButtonSize = {
  XS: 'XS',
  S: 'XS',
  M: 'S',
  L: 'M',
  XL: 'L'
} as const;

const checkboxWrapper = style({
  position: 'absolute',
  top: 8,
  zIndex: 2,
  insetStart: 8,
  padding: size(6),
  backgroundColor: 'white/50',
  borderRadius: 'default',
  boxShadow: 'emphasized'
});

export function Card(props: CardProps) {
  [props] = useContextProps(props, null, CardContext);
  let {density = 'regular', size = 'M', variant = 'primary', orientation = 'vertical'} = props;
  let isQuiet = variant === 'quiet';
  let isSkeleton = useContext(SkeletonContext);
  let children = (
    <Provider
      values={[
        [ImageContext, {alt: '', styles: image}],
        [TextContext, {
          slots: {
            [DEFAULT_SLOT]: {},
            title: {styles: title({size})},
            description: {styles: description({size})}
          }
        }],
        [ContentContext, {styles: content({size})}],
        [DividerContext, {size: 'S'}],
        [FooterContext, {styles: footer}],
        [ActionMenuContext, {isQuiet: true, size: actionButtonSize[size]}]
      ]}>
      <ImageCoordinator>
        {props.children}
      </ImageCoordinator>
    </Provider>
  );

  let ElementType = useContext(CardViewContext);
  if (ElementType === 'div') {
    return (
      <div className={card({size, density, variant, orientation})}>
        <InternalCardContext.Provider value={{size, isQuiet, isHovered: false, isFocusVisible: false, isSelected: false}}>
          {children}
        </InternalCardContext.Provider>
      </div>
    );
  }

  return (
    <ElementType 
      {...props}
      className={renderProps => card({...renderProps, isCardView: true, size, density, variant, orientation})}
      isDisabled={isSkeleton || props.isDisabled}>
      {({selectionMode, selectionBehavior, allowsDragging, isHovered, isFocusVisible, isSelected, isPressed}) => (
        <InternalCardContext.Provider value={{size, isQuiet, isHovered, isFocusVisible, isSelected}}>
          {!isQuiet && <SelectionIndicator />}
          {allowsDragging && <Button slot="drag">≡</Button>}
          {selectionMode === 'multiple' && selectionBehavior === 'toggle' && (
            <PressResponder isPressed={isPressed}>
              <div className={checkboxWrapper}>
                <Checkbox
                  slot="selection"
                  excludeFromTabOrder />
              </div>
            </PressResponder>
          )}
          {children}
        </InternalCardContext.Provider>
      )}
    </ElementType>
  );
}

function SelectionIndicator() {
  let {isSelected} = useContext(InternalCardContext);
  return <div className={selectionIndicator({isSelected})} />;
}

interface CardPreviewProps {
  children: ReactNode
}

export function CardPreview(props: CardPreviewProps) {
  let {size, isQuiet, isHovered, isFocusVisible, isSelected} = useContext(InternalCardContext);
  return (
    <div className={preview({size, isQuiet, isHovered, isFocusVisible, isSelected})}>
      {isQuiet && <SelectionIndicator />}
      <div className={style({borderRadius: '[inherit]', overflow: 'clip'})}>
        {props.children}
      </div>
    </div>
  );
}

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
  aspectRatio: {
    default: 'square',
    ':nth-last-child(4):first-child': '[3/2]'
  },
  gridColumnEnd: {
    ':nth-last-child(4):first-child': 'span 3'
  },
  objectFit: 'cover',
  pointerEvents: 'none',
  userSelect: 'none'
});

export function CollectionCardPreview(props: CardPreviewProps) {
  let {size} = useContext(InternalCardContext)!;
  return (
    <CardPreview>
      <div className={collection({size})}>
        <ImageContext.Provider value={{styles: collectionImage}}>
          {props.children}
        </ImageContext.Provider>
      </div>
    </CardPreview>
  );
}

export function AssetCard(props: CardProps) {
  return (
    <Card {...props} density="regular">
      <Provider
        values={[
          [ImageContext, {
            alt: '',
            styles: style({
              width: 'full',
              aspectRatio: 'square',
              objectFit: 'contain',
              pointerEvents: 'none',
              userSelect: 'none'
            })
          }],
          [IllustrationContext, {
            render(icon) {
              return (
                <SkeletonWrapper>
                  <div
                    className={style({
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'gray-100',
                      aspectRatio: 'square'
                    })}>
                    {icon}
                  </div>
                </SkeletonWrapper>
              );
            },
            styles: style({
              height: 'auto',
              maxSize: 160,
              // TODO: this is made up.
              width: '[50%]'
            })
          }]
        ]}>
        {props.children}
      </Provider>
    </Card>
  );
}

export function UserCard(props: CardProps) {
  let {size = 'M'} = props;
  return (
    <Card {...props} density="spacious">
      <Provider
        values={[
          [ImageContext, {
            alt: '',
            styles: style({
              width: 'full',
              aspectRatio: '[3/1]',
              objectFit: 'cover',
              pointerEvents: 'none',
              userSelect: 'none'
            })
          }],
          [AvatarContext, {
            styles: style({
              position: 'relative',
              size: {
                size: {
                  XS: 24,
                  S: 48,
                  M: 64,
                  L: 64,
                  XL: 80
                }
              },
              marginTop: {
                default: '[calc(self(height) / -2)]',
                ':first-child': 0
              }
            })({size}),
            UNSAFE_className: style({
              outlineStyle: 'solid',
              outlineWidth: {
                default: 2,
                size: {
                  XS: 1
                },
                ':first-child': 0
              },
              outlineColor: '--card-bg'
            })({size})
          }]
        ]}>
        {props.children}
      </Provider>
    </Card>
  );
}

const buttonSize = {
  XS: 'S',
  S: 'M',
  M: 'M',
  L: 'M',
  XL: 'L'
} as const;

export function ProductCard(props: CardProps) {
  let {size = 'M'} = props;
  return (
    <Card {...props} density="spacious">
      <Provider
        values={[
          [ImageContext, {
            slots: {
              preview: {
                alt: '',
                styles: style({
                  width: 'full',
                  aspectRatio: '[5/1]',
                  objectFit: 'cover',
                  pointerEvents: 'none',
                  userSelect: 'none'
                })
              },
              thumbnail: {
                alt: '',
                styles: style({
                  position: 'relative',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  size: {
                    size: {
                      XS: 24,
                      S: 36,
                      M: 40,
                      L: 44,
                      XL: 56
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
                  marginTop: {
                    default: '[calc(self(height) / -2)]',
                    ':first-child': 0
                  },
                  outlineStyle: 'solid',
                  outlineWidth: {
                    default: 2,
                    size: {
                      XS: 1
                    }
                  },
                  outlineColor: '--card-bg'
                })({size})
              }
            }
          }],
          [FooterContext, {
            styles: mergeStyles(footer, style({
              justifyContent: 'end'
            }))
          }],
          [ButtonContext, {size: buttonSize[size]}],
          [LinkButtonContext, {size: buttonSize[size]}]
        ]}>
        {props.children}
      </Provider>
    </Card>
  );
}