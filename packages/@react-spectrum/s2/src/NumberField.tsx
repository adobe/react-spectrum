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

import Add from '../ui-icons/Add';
import {
  ButtonProps as AriaButtonProps,
  NumberField as AriaNumberField,
  NumberFieldProps as AriaNumberFieldProps,
  ButtonContext,
  InputContext,
  Text,
  useContextProps
} from 'react-aria-components';
import {baseColor, style} from '../style/spectrum-theme' with {type: 'macro'};
import ChevronIcon from '../ui-icons/Chevron';
import {createFocusableRef, useFocusableRef} from '@react-spectrum/utils';
import {CSSProperties, ForwardedRef, forwardRef, ReactNode, useContext, useImperativeHandle, useMemo, useRef} from 'react';
import Dash from '../ui-icons/Dash';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldErrorIcon, FieldGroup, FieldLabel, HelpText, Input} from './Field';
import {filterDOMProps, mergeProps, mergeRefs} from '@react-aria/utils';
import {FocusableRef, HelpTextProps, SpectrumLabelableProps} from '@react-types/shared';
import {FormContext} from './Form';
import {pressScale} from './pressScale';
import {useButton, useFocusRing, useHover} from 'react-aria';


export interface NumberFieldProps extends
  AriaNumberFieldProps,
  StyleProps,
  Omit<SpectrumLabelableProps, 'contextualHelp'>,
  HelpTextProps {
  /**
   * Whether the NumberField step buttons should be collapsed into a single column.
   *
   * @default "false"
   */
    isCollapsed?: boolean,
  /**
   * The size of the NumberField.
   *
   * @default "M"
   */
    size?: 'S' | 'M' | 'L' | 'XL',
    label?: ReactNode
}

const inputButton = style({
  display: 'flex',
  outlineStyle: 'none',
  textAlign: 'center',
  borderStyle: 'none',
  borderTopRadius: {
    default: {
      size: {
        S: '[3px]',
        M: '[4px]',
        L: '[5px]',
        XL: '[6px]'
      }
    },
    type: {
      decrementStep: 'none'
    }
  },
  borderBottomRadius: {
    default: {
      size: {
        S: '[3px]',
        M: '[4px]',
        L: '[5px]',
        XL: '[6px]'
      }
    },
    type: {
      incrementStep: 'none'
    }
  },
  alignItems: 'center',
  justifyContent: 'center',
  width: {
    size: {
      S: {
        default: 16,
        isCollapsed: 24
      },
      M: {
        default: 20,
        isCollapsed: 24
      },
      L: {
        default: 24,
        isCollapsed: 32
      },
      XL: {
        default: 32,
        isCollapsed: 40
      }
    }
  },
  height: {
    default: 'auto',
    isCollapsed: {
      size: {
        S: 8,
        M: 12,
        L: 16,
        XL: 20
      }
    }
  },
  marginStart: {
    default: 'text-to-control',
    type: {
      increment: 0
    }
  },
  aspectRatio: {
    default: 'square',
    isCollapsed: 'auto'
  },
  flexShrink: {
    default: 0,
    isCollapsed: 1
  },
  minHeight: {
    isCollapsed: 0
  },
  transition: {
    default: 'default',
    forcedColors: 'none'
  },
  backgroundColor: {
    default: baseColor('gray-100'),
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonText',
      isHovered: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  color: {
    default: 'neutral',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonFace'
    }
  }
});

const iconStyles = style({
  flexShrink: 0,
  rotate: {
    default: 0,
    type: {
      incrementStep: 270,
      decrementStep: 90
    }
  },
  '--iconPrimary': {
    type: 'fill',
    value: 'currentColor'
  }
});

const stepperContainerStyles = style({
  display: 'flex',
  flexDirection: {
    default: 'row',
    isCollapsed: 'column-reverse'
  },
  gap: {
    default: {
      size: {
        S: 8,
        M: 4,
        L: 8,
        XL: 8
      }
    },
    isCollapsed: '[2px]'
  },
  maxHeight: {
    isCollapsed: {
      size: {
        S: 16,
        M: 24,
        L: 32,
        XL: 40 // 40
      }
    }
  },
  paddingEnd: {
    default: {
      size: {
        S: '[2px]',
        M: '[4px]',
        L: '[6px]',
        XL: '[6px]'
      }
    },
    isCollapsed: '[2px]'
  }
});

const chevronSize = {
  S: 'XS',
  M: 'S',
  L: 'L',
  XL: 'XL'
} as const;

function NumberField(props: NumberFieldProps, ref: FocusableRef<HTMLDivElement>) {
  let {
    label,
    description: descriptionMessage,
    errorMessage,
    isCollapsed,
    isRequired,
    size = 'M',
    labelPosition = 'top',
    necessityIndicator,
    labelAlign = 'start',
    UNSAFE_className = '',
    UNSAFE_style,
    ...numberFieldProps
  } = props;
  let formContext = useContext(FormContext);
  let domRef = useFocusableRef(ref);
  let inputRef = useRef<HTMLInputElement | null>(null);
  let decrementButtonRef = useRef<HTMLDivElement | null>(null);
  let incrementButtonRef = useRef<HTMLDivElement | null>(null);

  // Expose imperative interface for ref
  useImperativeHandle(ref, () => ({
    ...createFocusableRef(domRef, inputRef),
    select() {
      if (inputRef.current) {
        inputRef.current.select();
      }
    },
    getInputElement() {
      return inputRef.current;
    }
  }));


  return (
    <AriaNumberField
      isRequired={isRequired}
      {...numberFieldProps}
      style={UNSAFE_style}
      className={UNSAFE_className + style(field(), getAllowedOverrides())({
        isInForm: !!formContext,
        labelPosition,
        size
      }, props.styles)}>
      {
          ({isDisabled, isInvalid}) => {
            return  (
              <>
                <FieldLabel
                  isDisabled={isDisabled}
                  isRequired={isRequired}
                  size={size}
                  labelPosition={labelPosition}
                  labelAlign={labelAlign}
                  necessityIndicator={necessityIndicator}>
                  {label}
                </FieldLabel>
                <FieldGroup
                  role="presentation"
                  isDisabled={isDisabled}
                  isInvalid={isInvalid}
                  size={size}
                  styles={style({
                    ...fieldInput(),
                    paddingStart: 'edge-to-text',
                    paddingEnd: 0,
                    cursor: 'default'
                  })({size})}>
                  <InputContext.Consumer>
                    {ctx => (
                      <InputContext.Provider value={{...ctx, ref: mergeRefs((ctx as any)?.ref, inputRef)}}>
                        <Input />
                      </InputContext.Provider>
                    )}
                  </InputContext.Consumer>
                  {isInvalid && <FieldErrorIcon isDisabled={isDisabled} />}
                  <div className={stepperContainerStyles({isCollapsed, size})}>
                    <StepButton
                      ref={decrementButtonRef}
                      slot="decrement"
                      style={renderProps => pressScale(decrementButtonRef)(renderProps)}
                      className={renderProps => inputButton({
                        ...renderProps,
                        type: isCollapsed ? 'decrementStep' : 'decrement',
                        isCollapsed,
                        size
                      })}>
                      {
                        isCollapsed
                          ? <ChevronIcon size={chevronSize[size]} className={iconStyles({type: 'decrementStep'})} />
                          : <Dash size={size} className={iconStyles({})} />
                      }
                    </StepButton>
                    <StepButton
                      ref={incrementButtonRef}
                      slot="increment"
                      style={renderProps => pressScale(incrementButtonRef)(renderProps)}
                      className={renderProps => inputButton({
                        ...renderProps,
                        type: isCollapsed ? 'incrementStep' : 'increment',
                        isCollapsed,
                        size
                      })}>
                      {
                        isCollapsed
                          ? <ChevronIcon size={chevronSize[size]} className={iconStyles({type: 'incrementStep'})} />
                          : <Add size={size} className={iconStyles({})} />
                      }
                    </StepButton>
                  </div>
                </FieldGroup>
                {descriptionMessage && <Text slot="description">{descriptionMessage}</Text>}
                <HelpText
                  size={size}
                  isDisabled={isDisabled}
                  isInvalid={isInvalid}
                  description={descriptionMessage}>
                  {errorMessage}
                </HelpText>
              </>
            );
          }
        }
    </AriaNumberField>
  );
}

interface StepButtonProps extends AriaButtonProps {
}

const additionalButtonHTMLAttributes = new Set(['form', 'formAction', 'formEncType', 'formMethod', 'formNoValidate', 'formTarget', 'name', 'value']);

let StepButton = forwardRef((props: StepButtonProps, ref: ForwardedRef<HTMLDivElement>) => {
  [props, ref] = useContextProps(props, ref, ButtonContext as any);
  let ctx = props as any;
  /**
   * Must use div for now because Safari pointer event bugs on disabled form elements.
   * Link https://bugs.webkit.org/show_bug.cgi?id=219188.
   */
  let {buttonProps, isPressed} = useButton({...props, elementType: 'div'}, ref);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing(props);
  let {hoverProps, isHovered} = useHover(props);
  let renderProps = useRenderProps({
    ...props,
    values: {isHovered, isPressed, isFocused, isFocusVisible, isDisabled: props.isDisabled || false},
    defaultClassName: 'react-aria-Button'
  });
  return (
    <div
      {...filterDOMProps(props, {propNames: additionalButtonHTMLAttributes})}
      {...mergeProps(buttonProps, focusProps, hoverProps)}
      {...renderProps}
      ref={ref}
      slot={props.slot || undefined}
      data-disabled={props.isDisabled || undefined}
      data-pressed={ctx.isPressed || isPressed || undefined}
      data-hovered={isHovered || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined} />
  );
});

/**
 * NumberFields allow users to input number values with a keyboard or increment/decrement with step buttons.
 */
let _NumberField = forwardRef(NumberField);
export {_NumberField as NumberField};

// replace from RAC
function useRenderProps(props: any) {
  let {
    className,
    style,
    children,
    defaultClassName = undefined,
    defaultChildren = undefined,
    defaultStyle,
    values
  } = props;

  return useMemo(() => {
    let computedClassName: string | undefined;
    let computedStyle: CSSProperties | undefined;
    let computedChildren: ReactNode | undefined;

    if (typeof className === 'function') {
      computedClassName = className({...values, defaultClassName});
    } else {
      computedClassName = className;
    }

    if (typeof style === 'function') {
      computedStyle = style({...values, defaultStyle: defaultStyle || {}});
    } else {
      computedStyle = style;
    }

    if (typeof children === 'function') {
      computedChildren = children({...values, defaultChildren});
    } else if (children == null) {
      computedChildren = defaultChildren;
    } else {
      computedChildren = children;
    }

    return {
      className: computedClassName ?? defaultClassName,
      style: (computedStyle || defaultStyle) ? {...defaultStyle, ...computedStyle} : undefined,
      children: computedChildren ?? defaultChildren,
      'data-rac': ''
    };
  }, [className, style, children, defaultClassName, defaultChildren, defaultStyle, values]);
}
