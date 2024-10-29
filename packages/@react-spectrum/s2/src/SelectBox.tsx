/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2024 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/

import {
  Checkbox as AriaCheckbox,
  Radio as AriaRadio,
  GridListItemProps,
  Provider,
  TextContext
} from 'react-aria-components';
import {Checkbox, IconContext, Radio} from '@react-spectrum/s2';
import {FocusableRef} from '@react-types/shared';
import {focusRing, size, style}  from '../style' with {type: 'macro'};
import React, {forwardRef, ReactNode, useRef} from 'react';
import {StyleProps}  from './style-utils' with {type: 'macro'};

import {useFocusableRef} from '@react-spectrum/utils';
import {useSelectBoxGroupProvider} from './SelectBoxGroup';

export interface SelectBoxProps extends Omit<GridListItemProps, 'className' | 'style' | 'children' | 'onHoverChange' | 'onHoverStart' | 'onHoverEnd' | 'value'>, StyleProps {
  children: ReactNode | ((renderProps: SelectBoxProps) => ReactNode),
  value: string
}

const selectBoxStyle = style({
  ...focusRing(),
  aspectRatio: {
    orientation: {
      vertical: 'square'
    }
  },
  backgroundColor: {
    default: 'white',
    isDisabled: 'disabled'
  },
  borderWidth: 2,
  borderStyle: {
    default: 'solid',
    isDisabled: 'none'
  },
  borderColor: {
    default: 'gray-25',
    isSelected: 'black'
  },
  borderRadius: 'lg',
  boxShadow: 'elevated',
  boxSizing: 'border-box',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  maxHeight: {
    orientation: {
      horizontal: {
        size: {
          S: size(72),
          M: size(106)
        }
      },
      vertical: {
        size: {
          XS: size(168),
          S: size(184),
          M: size(200),
          L: size(216),
          XL: size(232)
        }
      }
    }
  },
  minHeight: {
    orientation: {
      horizontal: {
        size: {
          S: size(72),
          M: size(106)
        }
      },
      vertical: {
        size: {
          XS: size(100),
          S: size(128),
          M: size(144),
          L: size(160),
          XL: size(192)
        }
      }
    }
  },
  maxWidth: {
    orientation: {
      horizontal: {
        size: {
          S: size(312),
          M: size(368)
        }
      },
      vertical: {
        size: {
          XS: size(168),
          S: size(184),
          M: size(200),
          L: size(216),
          XL: size(232)
        }
      }
    }
  },
  minWidth: {
    orientation: {
      horizontal: {
        size: {
          S: size(312),
          M: size(368)
        }
      },
      vertical: {
        size: {
          XS: size(100),
          S: size(128),
          M: size(144),
          L: size(160),
          XL: size(192)
        }
      }
    }
  },
  outlineColor: {
    default: 'focus-ring',
    forcedColors: 'Highlight'
  },
  padding: {
    orientation: {
      horizontal: {
        default: 16
      }
    }
  },
  position: 'relative'
});

const selectBoxContentStyle = style({
  alignContent: 'center',
  alignItems: 'center',
  display: 'grid',
  gap: {
    orientation: {
      horizontal: {
        size: {
          S: 0,
          M: size(2)
        },
        vertical: size(8)
      }
    }
  },
  gridTemplateAreas: {
    orientation: {
      horizontal: ['icon label', 'icon description'],
      vertical: ['. icon .', '. label .']
    }
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: '48px 1fr'
    }
  },
  height: 'full',
  justifyItems: {
    orientation: {
      horizontal: 'flex-start',
      vertical: 'center'
    }
  },
  paddingStart: {
    orientation: {
      horizontal: size(12),
      vertical: 0
    }
  },
  width: 'auto'
});

const selectBoxIconStyle = style({
  color: {
    default: 'red-600',
    isDisabled: 'disabled'
  },
  gridArea: 'icon',
  marginBottom: {
    orientation: {
      horizontal: 0,
      vertical: 8
    }
  },
  flexShrink: 0
});

const selectBoxLabelStyle = style({
  gridArea: 'label',
  color: {
    default: 'neutral',
    isDisabled: 'disabled'
  },
  fontSize: {
    size: {
      XS: 'body-sm',
      M: 'body-lg',
      L: 'body-xl',
      XL: 'body-2xl'
    }
  }
});

const selectorStyle = style({
  display: 'block',
  position: 'absolute',
  top: {
    orientation: {
      vertical: 16,
      horizontal: '50%'
    }
  },
  right: 16,
  visibility: {
    default: 'hidden',
    isHovered: 'visible',
    isSelected: 'visible'
  }
});

const SelectBox = (props: SelectBoxProps, ref: FocusableRef<HTMLLabelElement>) => {
  const {orientation, selectionMode, size} = useSelectBoxGroupProvider();
  const AriaSelector = selectionMode === 'single' ? AriaRadio : AriaCheckbox;
  const Selector = selectionMode === 'single' ? Radio : Checkbox;
  const domRef = useFocusableRef<HTMLLabelElement>(ref);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <AriaSelector
      className={renderProps => selectBoxStyle({...renderProps, orientation, size})}
      inputRef={inputRef}
      ref={domRef}
      style={{display: 'flex'}}
      value={props.value}
      isDisabled={props.isDisabled}>
      {renderProps => (
        <span className={selectBoxContentStyle({orientation, size})}>
          <Selector
            UNSAFE_className={selectorStyle({
              isHovered: renderProps.isHovered,
              isSelected: renderProps.isSelected,
              orientation
            })}
            value={props.value} />
          <Provider
            values={[
              [
                IconContext,
                {
                  styles: selectBoxIconStyle({...renderProps, orientation})
                }
              ],
              [
                TextContext,
                {
                  slots: {
                    description: {
                      className: style({
                        color: 'gray-600',
                        fontSize: 'body-sm',
                        gridArea: 'description'
                      })
                    },
                    label: {
                      className: selectBoxLabelStyle({...renderProps, size})
                    }
                  }
                }
              ]
            ]}>
            {typeof props.children === 'function' ? props.children(renderProps) : props.children}
          </Provider>
        </span>
      )}
    </AriaSelector>
  );
};

const _SelectBox = forwardRef(SelectBox);
_SelectBox.displayName = 'SelectBox';
export {_SelectBox as SelectBox};
