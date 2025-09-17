/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {baseColor, focusRing, style} from '../style' with {type: 'macro'};
import {box, iconStyles} from './Checkbox';
import Checkmark from '../ui-icons/Checkmark';
import {
  ContextValue,
  DEFAULT_SLOT,
  ListBox,
  ListBoxItem,
  ListBoxProps,
  Provider
} from 'react-aria-components';
import {DOMRef, DOMRefValue, GlobalDOMAttributes, Key, Orientation} from '@react-types/shared';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {IllustrationContext} from '../src/Icon';
import {pressScale} from './pressScale';
import React, {createContext, forwardRef, ReactNode, useContext, useMemo, useRef} from 'react';
import {TextContext} from './Content';
import {useFocusVisible} from 'react-aria';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SelectBoxGroupProps<T> extends StyleProps, Omit<ListBoxProps<T>, keyof GlobalDOMAttributes | 'layout' | 'dragAndDropHooks' | 'dependencies' | 'renderEmptyState' | 'children' | 'onAction' | 'shouldFocusOnHover' | 'selectionBehavior' | 'shouldSelectOnPressUp' | 'shouldFocusWrap' | 'style' | 'className'> {
  /**
   * The SelectBox elements contained within the SelectBoxGroup.
   */
  children: ReactNode,
  /**
   * The layout direction of the content in each SelectBox.
   * @default 'vertical'
   */
  orientation?: Orientation,
  /**
   * The selection mode for the SelectBoxGroup.
   * @default 'single'
   */
  selectionMode?: 'single' | 'multiple',
  /**
   * Whether the SelectBoxGroup is disabled.
   */
  isDisabled?: boolean
}

export interface SelectBoxProps extends StyleProps {
  /** The unique id of the SelectBox. */
  id?: Key,
  /** A string representation of the SelectBox's contents, used for features like typeahead. */
  textValue?: string,
  /** An accessibility label for this item. */
  'aria-label'?: string,
  /**
   * The contents of the SelectBox.
   */
  children: ReactNode,
  /**
   * Whether the SelectBox is disabled.
   */
  isDisabled?: boolean
}

interface SelectBoxContextValue {
  allowMultiSelect?: boolean,
  orientation?: Orientation,
  isDisabled?: boolean
}

const SelectBoxContext = createContext<SelectBoxContextValue>({orientation: 'vertical'});
export const SelectBoxGroupContext = createContext<ContextValue<Partial<SelectBoxGroupProps<any>>, DOMRefValue<HTMLDivElement>>>(null);

const labelOnly = ':has([slot=label]):not(:has([slot=description]))';
const noIllustration = ':not(:has([slot=illustration]))';
const selectBoxStyles = style({
  ...focusRing(),
  display: 'grid',
  gridAutoRows: '1fr',
  position: 'relative',
  font: 'ui',
  cursor: 'default',
  boxSizing: 'border-box',
  overflow: 'hidden',
  width: {
    default: 170,
    orientation: {
      horizontal: 368
    }
  },
  height: {
    default: 170,
    orientation: {
      horizontal: 'auto'
    }
  },
  minWidth: {
    default: 144,
    orientation: {
      horizontal: 188
    }
  },
  maxWidth: {
    default: 170,
    orientation: {
      horizontal: 480
    }
  },
  minHeight: {
    default: 144,
    orientation: {
      horizontal: 80
    }
  },
  maxHeight: {
    default: 170,
    orientation: {
      horizontal: 240
    }
  },
  padding: {
    default: 24,
    orientation: {
      horizontal: 16
    }
  },
  paddingStart: {
    orientation: {
      horizontal: 32
    }
  },
  paddingEnd: {
    orientation: {
      horizontal: 24
    }
  },
  gridTemplateAreas: {
    orientation: {
      vertical: [
        'illustration',
        '.',
        'label'
      ],
      horizontal: {
        default: [
          'illustration . label',
          'illustration . description'
        ],
        [labelOnly]: [
          'illustration . label'
        ]
      }
    }
  },
  gridTemplateRows: {
    orientation: {
      vertical: ['min-content', 8, 'min-content'],
      horizontal: {
        default: ['min-content', 2, 'min-content'],
        [noIllustration]: ['min-content']
      }
    }
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: 'min-content 10px 1fr'
    }
  },
  alignContent: {
    orientation: {
      vertical: 'center'
    }
  },
  borderRadius: 'lg',
  borderStyle: 'solid',
  borderColor: {
    default: 'transparent',
    isSelected: 'gray-900',
    isDisabled: 'transparent'
  },
  backgroundColor: {
    default: 'layer-2',
    isDisabled: 'disabled'
  },
  color: {
    isDisabled: 'disabled'
  },
  boxShadow: {
    default: 'emphasized',
    isHovered: 'elevated',
    isSelected: 'elevated',
    isDisabled: 'none'
  },
  borderWidth: 2,
  transition: 'default'
}, getAllowedOverrides());

const illustrationContainer = style({
  gridArea: 'illustration',
  alignSelf: 'center',
  justifySelf: 'center',
  minSize: 48,
  '--iconPrimary': {
    type: 'color',
    value: {
      default: baseColor('neutral'),
      isDisabled: 'disabled'
    }
  }
});

const descriptionText = style({
  gridArea: 'description',
  alignSelf: 'center',
  display: {
    default: 'block',
    orientation: {
      vertical: 'none'
    }
  },
  overflow: 'hidden',
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled'
  }
});

const labelText = style({
  gridArea: 'label',
  alignSelf: 'center',
  justifySelf: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  width: '100%',
  overflow: 'hidden',
  minWidth: 0,
  textAlign: {
    default: 'center',
    orientation: {
      horizontal: 'start'
    }
  },
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontWeight: {
    orientation: {
      horizontal: 'bold'
    }
  },
  color: {
    default: baseColor('neutral'),
    isDisabled: 'disabled'
  }
});

const gridStyles = style<{orientation?: Orientation}>({
  display: 'grid',
  gridAutoRows: '1fr',
  gap: 24,
  justifyContent: 'center',
  '--size': {
    type: 'width',
    value: {
      orientation: {
        horizontal: 368,
        vertical: 170
      }
    }
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: 'repeat(auto-fit, var(--size))',
      vertical: 'repeat(auto-fit, var(--size))'
    }
  }
}, getAllowedOverrides());

/**
 * SelectBox is a single selectable item in a SelectBoxGroup.
 */
export function SelectBox(props: SelectBoxProps): ReactNode {
  let {children, isDisabled: individualDisabled = false, UNSAFE_style, UNSAFE_className, styles, ...otherProps} = props;

  let {
    orientation = 'vertical',
    isDisabled: groupDisabled = false
  } = useContext(SelectBoxContext);

  const isDisabled = individualDisabled || groupDisabled;
  const ref = useRef<HTMLDivElement>(null);
  let {isFocusVisible} = useFocusVisible();

  return (
    <ListBoxItem
      isDisabled={isDisabled}
      ref={ref}
      className={renderProps => (UNSAFE_className || '') + selectBoxStyles({
        ...renderProps,
        isFocusVisible: isFocusVisible && renderProps.isFocused,
        orientation
      }, styles)}
      style={pressScale(ref, UNSAFE_style)}
      {...otherProps}>
      {({isSelected, isDisabled, isHovered}) => {
        return (
          <>
            <div
              className={style({
                position: 'absolute',
                top: 8,
                insetStart: 8,
                pointerEvents: 'none'
              })}
              aria-hidden="true">
              {!isDisabled && (
                <div
                  className={box({
                    isSelected,
                    isDisabled,
                    size: 'M'
                  } as any)}>
                  <Checkmark
                    size="S"
                    className={iconStyles} />
                </div>
              )}
            </div>
            <Provider
              values={[
                [IllustrationContext, {
                  size: 'S',
                  styles: illustrationContainer({size: 'S', orientation, isDisabled, isHovered})
                }],
                [TextContext, {
                  slots: {
                    [DEFAULT_SLOT]: {
                      styles: labelText({orientation, isDisabled, isHovered})
                    },
                    label: {
                      styles: labelText({orientation, isDisabled, isHovered})
                    },
                    description: {
                      styles: descriptionText({orientation, isDisabled, isHovered})
                    }
                  }
                }]
              ]}>
              {children}
            </Provider>
          </>
        );
      }}
    </ListBoxItem>
  );
}

/*
 * SelectBoxGroup allows users to select one or more options from a list.
 */
export const SelectBoxGroup = /*#__PURE__*/ forwardRef(function SelectBoxGroup<T extends object>(props: SelectBoxGroupProps<T>, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, SelectBoxGroupContext);

  let {
    children,
    selectionMode = 'single',
    orientation = 'vertical',
    isDisabled = false,
    UNSAFE_className,
    UNSAFE_style,
    styles,
    ...otherProps
  } = props;

  const selectBoxContextValue = useMemo(() => ({
    orientation,
    isDisabled
  }), [orientation, isDisabled]);

  return (
    <SelectBoxContext.Provider value={selectBoxContextValue}>
      <ListBox
        selectionMode={selectionMode}
        layout="grid"
        orientation={orientation}
        className={(UNSAFE_className || '') + gridStyles({orientation}, styles)}
        style={UNSAFE_style}
        {...otherProps}>
        {children}
      </ListBox>
    </SelectBoxContext.Provider>
  );
});
