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

import {NumberField as AriaNumberField} from 'react-aria-components/NumberField';
import {
  Slider as AriaSlider,
  SliderProps as AriaSliderProps,
  SliderFill,
  SliderOutput,
  SliderThumb,
  SliderThumbRenderProps,
  SliderTrack
} from 'react-aria-components/Slider';
import {ContextValue} from 'react-aria-components/slots';
import {
  controlFont,
  controlSize,
  field,
  fieldInput,
  getAllowedOverrides,
  StyleProps
} from './style-utils' with {type: 'macro'};
import {createContext, forwardRef, ReactNode, RefObject, useContext, useRef} from 'react';
import {css} from '../style/style-macro' with {type: 'macro'};
import {FieldGroup, FieldLabel, Input} from './Field';
import {
  FocusableRef,
  FocusableRefValue,
  GlobalDOMAttributes,
  InputDOMProps,
  SpectrumLabelableProps
} from '@react-types/shared';
import {focusRing, style} from '../style' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {mergeStyles} from '../style/runtime';
import {pressScale} from './pressScale';
import {snapValueToStep} from 'react-stately/private/utils/number';
import {useFocusableRef} from './useDOMRef';
import {useLocale} from 'react-aria/I18nProvider';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SliderBaseProps<T>
  extends
    Omit<
      AriaSliderProps<T>,
      'children' | 'style' | 'className' | 'render' | 'orientation' | keyof GlobalDOMAttributes
    >,
    Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'>,
    StyleProps {
  children?: ReactNode;
  /**
   * The size of the Slider.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL';
  /**
   * Whether the Slider should be displayed with an emphasized style.
   */
  isEmphasized?: boolean;
  /**
   * The style of the Slider's track.
   *
   * @default 'thin'
   */
  trackStyle?: 'thin' | 'thick'; // TODO: add ramp
  /**
   * The style of the Slider's thumb.
   *
   * @default 'default'
   */
  thumbStyle?: 'default' | 'precise';
}

export interface SliderProps extends Omit<SliderBaseProps<number>, 'children'>, InputDOMProps {
  /**
   * The offset from which to start the fill.
   */
  fillOffset?: number;
  /**
   * Whether the value can be edited within a text field.
   */
  isEditable?: boolean;
}

export const SliderContext =
  createContext<ContextValue<Partial<SliderProps>, FocusableRefValue<HTMLDivElement>>>(null);

const slider = style(
  {
    font: controlFont(),
    alignItems: {
      labelPosition: {
        side: 'center'
      }
    },
    color: {
      default: 'neutral-subdued',
      forcedColors: 'ButtonText',
      isDisabled: 'disabled'
    },
    columnGap: {
      size: {
        S: 16,
        M: 16,
        L: 20,
        XL: 24
      },
      isInForm: 12
    }
  },
  getAllowedOverrides()
);

const labelContainer = style({
  display: {
    labelPosition: {
      top: 'grid'
    }
  },
  gridArea: 'label',
  width: 'full',
  gridTemplateAreas: {
    labelPosition: {
      top: ['label output']
    }
  },
  gridTemplateColumns: {
    labelPosition: {
      top: ['1fr auto']
    }
  },
  textAlign: {
    labelPosition: {
      side: {
        labelAlign: {
          start: 'start',
          end: 'end'
        }
      }
    }
  },
  '--field-gap': {
    type: 'paddingBottom',
    value: 0
  }
});

const output = style({
  gridArea: 'output',
  textAlign: {
    labelPosition: {
      top: {
        direction: {
          ltr: 'end',
          rtl: 'start'
        }
      },
      side: {
        direction: {
          ltr: 'start',
          rtl: 'end'
        },
        isInForm: 'end'
      }
    }
  }
});

export let track = style({
  gridArea: 'track',
  position: 'relative',
  width: 'full',
  minWidth: controlSize(),
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48
    }
  }
});

const sliderControls = style({
  ...fieldInput(),
  display: 'inline-flex',
  alignItems: 'center',
  minWidth: {
    default: controlSize(),
    isEditable: {
      default: 96,
      size: {
        S: 76,
        L: 120,
        XL: 144
      }
    }
  },
  gap: {
    default: 16,
    size: {
      L: 20,
      XL: 24
    }
  }
});

const editableFieldGroup = style({
  contain: {
    default: 'none',
    '@supports (contain-intrinsic-width: 1px)': 'none'
  },
  width: 'auto',
  minWidth: {
    default: 48,
    size: {
      S: 36,
      L: 60,
      XL: 72
    }
  }
});

const editableInputSizer = css(`
  display: inline-grid;
  flex-grow: 1;
  font-variant-numeric: tabular-nums;
  &::before, &::after {
    grid-area: 1 / 1;
    visibility: hidden;
    pointer-events: none;
    white-space: pre;
    height: 0;
    overflow: hidden;
    padding-inline-end: 6px;
  }
  &::before {
    content: attr(data-min);
  }
  &::after {
    content: attr(data-max);
  }
`);

export let thumbContainer = style({
  size: {
    size: {
      S: 18,
      M: 20,
      L: 22,
      XL: 24
    }
  },
  display: 'inline-block',
  position: 'absolute',
  top: '50%'
});

// if precision thumb should have a smaller hit area, then remove this
export let thumbHitArea = style({
  size: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24
        }
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26
        }
      }
    }
  }
});

export let thumb = style<
  SliderThumbRenderProps & {size: 'S' | 'M' | 'L' | 'XL'; thumbStyle: 'default' | 'precise'}
>({
  ...focusRing(),
  display: 'inline-block',
  boxSizing: 'border-box',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translateY(-50%) translateX(-50%)',
  width: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24
        }
      },
      precise: 6
    }
  },
  height: {
    thumbStyle: {
      default: {
        size: {
          S: 18,
          M: 20,
          L: 22,
          XL: 24
        }
      },
      precise: {
        size: {
          S: 20,
          M: 22,
          L: 24,
          XL: 26
        }
      }
    }
  },
  borderRadius: 'full',
  borderStyle: 'solid',
  borderWidth: '[2px]',
  borderColor: {
    default: 'gray-800',
    isHovered: 'gray-900',
    isDragging: 'gray-900',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'ButtonBorder',
      isDisabled: 'GrayText'
    }
  },
  backgroundColor: {
    default: 'gray-25',
    forcedColors: 'ButtonFace'
  }
});

const trackStyling = {
  height: {
    trackStyle: {
      thin: 4,
      thick: 16
    }
  },
  top: '50%',
  borderRadius: {
    trackStyle: {
      thin: 'lg',
      thick: 'sm'
    }
  }
} as const;

export let upperTrack = style<{
  isDisabled?: boolean;
  isStaticColor?: boolean;
  trackStyle: 'thin' | 'thick';
}>({
  ...trackStyling,
  position: 'absolute',
  backgroundColor: {
    default: 'gray-300',
    isStaticColor: 'transparent-overlay-300',
    forcedColors: 'ButtonFace',
    isDisabled: 'disabled'
  },
  translateY: '-50%',
  width: 'full',
  boxSizing: 'border-box',
  outlineStyle: 'solid',
  outlineWidth: '[.5px]',
  outlineOffset: -0.5,
  outlineColor: {
    default: 'transparent',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  }
});

export let filledTrack = style<{
  isDisabled?: boolean;
  isEmphasized?: boolean;
  trackStyle: 'thin' | 'thick';
}>({
  ...trackStyling,
  position: 'absolute',
  backgroundColor: {
    default: 'gray-700',
    isEmphasized: 'accent-900',
    isDisabled: 'disabled',
    forcedColors: {
      default: 'Highlight',
      isDisabled: 'GrayText'
    }
  },
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: '[.5px]',
  borderColor: {
    default: 'transparent',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  },
  translateY: '-50%'
});

export function SliderBase<T extends number | number[]>(
  props: SliderBaseProps<T> & {sliderRef: RefObject<HTMLDivElement | null>; isEditable?: boolean}
): ReactNode {
  let formContext = useContext(FormContext);
  // oxlint-disable-next-line react/react-compiler
  props = useFormProps(props);
  let {
    label,
    labelPosition = 'top',
    labelAlign = 'start',
    size = 'M',
    minValue = 0,
    maxValue = 100,
    isEditable
  } = props;
  let {direction} = useLocale();

  // oxlint-disable react/react-compiler
  return (
    <AriaSlider
      {...props}
      ref={props.sliderRef}
      className={renderProps =>
        (props.UNSAFE_className || '') +
        mergeStyles(
          style(field())({labelPosition, isInForm: !!formContext}),
          slider({...renderProps, labelPosition, size, isInForm: !!formContext}, props.styles)
        )
      }>
      {({state}) => {
        let maxLabelLength = 0;
        let minStep = snapValueToStep(minValue + state.step, minValue, maxValue, state.step);
        let maxStep = snapValueToStep(maxValue - state.step, minValue, maxValue, state.step);
        let minFormatted = state.getFormattedValue(minValue);
        let minStepFormatted = state.getFormattedValue(minStep);
        let maxFormatted = state.getFormattedValue(maxValue);
        let maxStepFormatted = state.getFormattedValue(maxStep);
        let minSizer =
          [...minStepFormatted].length > [...minFormatted].length ? minStepFormatted : minFormatted;
        let maxSizer =
          [...maxStepFormatted].length > [...maxFormatted].length ? maxStepFormatted : maxFormatted;
        switch (state.values.length) {
          case 1:
            maxLabelLength = Math.max([...minSizer].length, [...maxSizer].length);
            break;
          case 2:
            maxLabelLength = Math.max(
              [...state.getFormattedValue([minValue, minStep])].length,
              [...state.getFormattedValue([maxStep, maxValue])].length
            );
            break;
          default:
            throw new Error('Only sliders with 1 or 2 handles are supported!');
        }

        let outputValue = !isEditable ? (
          <SliderOutput
            style={{
              width: `${maxLabelLength}ch`,
              minWidth: `${maxLabelLength}ch`,
              fontVariantNumeric: 'tabular-nums'
            }}
            className={output({direction, labelPosition, isInForm: !!formContext})}
          />
        ) : null;

        return (
          <>
            {(label != null || (labelPosition === 'top' && !isEditable)) && (
              <div className={labelContainer({labelPosition, labelAlign})}>
                <FieldLabel
                  isDisabled={props.isDisabled}
                  size={props.size}
                  labelPosition={labelPosition}
                  labelAlign={labelAlign}
                  contextualHelp={props.contextualHelp}>
                  {label}
                </FieldLabel>
                {labelPosition === 'top' && outputValue}
              </div>
            )}
            <div className={sliderControls({size, isEditable})}>
              {props.children}
              {labelPosition === 'side' && outputValue}
              {isEditable && (
                <AriaNumberField className={style({flexShrink: 0})}>
                  <FieldGroup size={size} styles={editableFieldGroup({size})}>
                    <div className={editableInputSizer} data-min={minSizer} data-max={maxSizer}>
                      <Input
                        styles={style({
                          gridColumnStart: 1,
                          gridRowStart: 1,
                          width: 0,
                          minWidth: 'full'
                        })}
                      />
                    </div>
                  </FieldGroup>
                </AriaNumberField>
              )}
            </div>
          </>
        );
      }}
    </AriaSlider>
  );
  // oxlint-enable react/react-compiler
}

/**
 * Sliders allow users to quickly select a value within a range. They should be used when the upper
 * and lower bounds to the range are invariable.
 */
export const Slider = /*#__PURE__*/ forwardRef(function Slider(
  props: SliderProps,
  ref: FocusableRef<HTMLDivElement>
) {
  // oxlint-disable-next-line react/react-compiler
  [props, ref] = useSpectrumContextProps(props, ref, SliderContext);
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    labelPosition = 'top',
    size = 'M',
    fillOffset,
    isEmphasized,
    trackStyle = 'thin',
    thumbStyle = 'default'
  } = props;
  let thumbRef = useRef(null);
  let inputRef = useRef(null); // TODO: need to pass inputRef to SliderThumb when we release the next version of RAC 1.3.0
  let domRef = useFocusableRef(ref, inputRef);
  let isStaticColor = props['PRIVATE_staticColor'];

  return (
    <SliderBase {...props} sliderRef={domRef}>
      <SliderTrack className={track({size, labelPosition, isInForm: !!formContext})}>
        {({isDisabled}) => {
          return (
            <>
              <div className={upperTrack({isDisabled, isStaticColor, trackStyle})}>
                <SliderFill
                  offset={fillOffset}
                  className={filledTrack({isDisabled, isEmphasized, trackStyle})}
                />
              </div>
              <SliderThumb
                className={thumbContainer}
                index={0}
                name={props.name}
                form={props.form}
                ref={thumbRef}
                style={renderProps =>
                  pressScale(thumbRef, {transform: 'translate(-50%, -50%)'})({
                    ...renderProps,
                    isPressed: renderProps.isDragging
                  })
                }>
                {renderProps => (
                  <div className={thumbHitArea({size})}>
                    <div
                      className={thumb({
                        ...renderProps,
                        size,
                        thumbStyle
                      })}
                    />
                  </div>
                )}
              </SliderThumb>
            </>
          );
        }}
      </SliderTrack>
    </SliderBase>
  );
});
