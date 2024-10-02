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

import {
  Slider as AriaSlider,
  SliderProps as AriaSliderProps,
  ContextValue,
  SliderOutput,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import {clamp} from '@react-aria/utils';
import {createContext, forwardRef, ReactNode, RefObject, useContext, useRef} from 'react';
import {field, fieldInput, getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {FieldLabel} from './Field';
import {FocusableRef, FocusableRefValue, InputDOMProps, SpectrumLabelableProps} from '@react-types/shared';
import {focusRing, size, style} from '../style' with {type: 'macro'};
import {FormContext, useFormProps} from './Form';
import {mergeStyles} from '../style/runtime';
import {pressScale} from './pressScale';
import {useFocusableRef} from '@react-spectrum/utils';
import {useLocale, useNumberFormatter} from '@react-aria/i18n';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface SliderBaseProps<T> extends Omit<AriaSliderProps<T>, 'children' | 'style' | 'className' | 'orientation'>, Omit<SpectrumLabelableProps, 'necessityIndicator' | 'isRequired'>, StyleProps {
  children?: ReactNode,
  /**
   * The size of the Slider.
   *
   * @default 'M'
   */
  size?: 'S' | 'M' | 'L' | 'XL',
  /**
   * Whether the Slider should be displayed with an emphasized style.
   */
  isEmphasized?: boolean,
  /**
   * The style of the Slider's track.
   *
   * @default 'thin'
   */
  trackStyle?: 'thin' | 'thick', // TODO: add ramp
  /**
   * The style of the Slider's thumb.
   *
   * @default 'default'
   */
  thumbStyle?: 'default' | 'precise'
  // TODO
  // isEditable?: boolean,
}

export interface SliderProps extends Omit<SliderBaseProps<number>, 'children'>, InputDOMProps {
  /**
   * The offset from which to start the fill.
   */
  fillOffset?: number
}

export const SliderContext = createContext<ContextValue<SliderProps, FocusableRefValue<HTMLDivElement>>>(null);

const slider = style({
  font: 'control',
  alignItems: {
    labelPosition: {
      side: 'center'
    }
  },
  color: {
    default: 'neutral-subdued',
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
}, getAllowedOverrides());

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
      top: [
        '1fr auto'
      ]
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
  height: {
    size: {
      S: 24,
      M: 32,
      L: 40,
      XL: 48
    }
  }
});

export let thumbContainer = style({
  size: {
    size: {
      S: size(18),
      M: 20,
      L: size(22),
      XL: 24
    }
  },
  display: 'inline-block',
  position: 'absolute',
  top: '[50%]'
});

// if precision thumb should have a smaller hit area, then remove this
export let thumbHitArea = style({
  size: {
    thumbStyle: {
      default: {
        size: {
          S: size(18),
          M: 20,
          L: size(22),
          XL: 24
        }
      },
      precise: {
        size: {
          S: 20,
          M: size(22),
          L: 24,
          XL: size(26)
        }
      }
    }
  }
});

export let thumb = style({
  ...focusRing(),
  display: 'inline-block',
  boxSizing: 'border-box',
  position: 'absolute',
  top: '[50%]',
  left: '[50%]',
  transform: 'translateY(-50%) translateX(-50%)',
  width: {
    thumbStyle: {
      default: {
        size: {
          S: size(18),
          M: 20,
          L: size(22),
          XL: 24
        }
      },
      precise: size(6)
    }
  },
  height: {
    thumbStyle: {
      default: {
        size: {
          S: size(18),
          M: 20,
          L: size(22),
          XL: 24
        }
      },
      precise: {
        size: {
          S: 20,
          M: size(22),
          L: 24,
          XL: size(26)
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
      isDisabled: 'GrayText'
    }
  },
  backgroundColor: 'gray-25'
});

const trackStyling = {
  height: {
    trackStyle: {
      thin: 4,
      thick: 16
    }
  },
  top: '[50%]',
  borderRadius: {
    trackStyle: {
      thin: 'lg',
      thick: 'sm'
    }
  }
} as const;

export let upperTrack = style({
  ...trackStyling,
  position: 'absolute',
  backgroundColor: {
    default: 'gray-300',
    isDisabled: 'disabled'
  },
  translateY: '[-50%]',
  width: 'full',
  boxSizing: 'border-box',
  borderStyle: 'solid',
  borderWidth: '[.5px]',
  borderColor: {
    default: 'transparent',
    forcedColors: {
      default: 'ButtonText',
      isDisabled: 'GrayText'
    }
  }
});

export let filledTrack = style({
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
  translateY: '[-50%]'
});

export function SliderBase<T extends number | number[]>(props: SliderBaseProps<T> & {sliderRef: RefObject<HTMLDivElement | null>}) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    label,
    labelPosition = 'top',
    labelAlign = 'start',
    size = 'M',
    minValue = 0,
    maxValue = 100,
    formatOptions
  } = props;
  let formatter = useNumberFormatter(formatOptions);
  let {direction} = useLocale();

  return (
    <AriaSlider
      {...props}
      ref={props.sliderRef}
      className={renderProps => (props.UNSAFE_className || '') + mergeStyles(style(field())({labelPosition, isInForm: !!formContext}), slider({...renderProps, labelPosition, size, isInForm: !!formContext}, props.styles))}>
      {({state}) => {
        let maxLabelLength = Math.max([...formatter.format(minValue)].length, [...formatter.format(maxValue)].length);
        switch (state.values.length) {
          case 1:
            break;
          case 2:
            // This should really use the NumberFormat#formatRange proposal...
            // https://github.com/tc39/ecma402/issues/393
            // https://github.com/tc39/proposal-intl-numberformat-v3#formatrange-ecma-402-393
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/formatRange
            maxLabelLength = 3 + 2 * Math.max(
              maxLabelLength,
              [...formatter.format(minValue)].length, [...formatter.format(maxValue)].length
            );
            break;
          default:
            throw new Error('Only sliders with 1 or 2 handles are supported!');
        }

        let outputValue = (
          <SliderOutput
            style={{width: `${maxLabelLength}ch`, minWidth: `${maxLabelLength}ch`, fontVariantNumeric: 'tabular-nums'}}
            className={output({direction, labelPosition, isInForm: !!formContext})}>
            {({state}) =>
              state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}
          </SliderOutput>
        );

        return (
          <>
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
            <div className={style({...fieldInput(), display: 'inline-flex', alignItems: 'center', gap: {default: 16, size: {L: 20, XL: 24}}})({size})}>
              {props.children}
              {labelPosition === 'side' && outputValue}
            </div>
          </>
        );
      }}
    </AriaSlider>
  );
}

function Slider(props: SliderProps, ref: FocusableRef<HTMLDivElement>) {
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
  let {direction} = useLocale();
  let cssDirection = direction === 'rtl' ? 'right' : 'left';

  return (
    <SliderBase
      {...props}
      sliderRef={domRef}>
      <SliderTrack
        className={track({size, labelPosition, isInForm: !!formContext})}>
        {({state, isDisabled}) => {

          fillOffset = fillOffset !== undefined ? clamp(fillOffset, state.getThumbMinValue(0), state.getThumbMaxValue(0)) : state.getThumbMinValue(0);

          let fillWidth = state.getThumbPercent(0) - state.getValuePercent(fillOffset);
          let isRightOfOffset = fillWidth > 0;
          let offset = isRightOfOffset ? state.getValuePercent(fillOffset) : state.getThumbPercent(0);

          return (
            <>
              <div className={upperTrack({isDisabled, trackStyle})} />
              <div style={{width: `${Math.abs(fillWidth) * 100}%`, [cssDirection]: `${offset * 100}%`}} className={filledTrack({isDisabled, isEmphasized, trackStyle})} />
              <SliderThumb  className={thumbContainer} index={0} name={props.name} ref={thumbRef} style={(renderProps) => pressScale(thumbRef, {transform: 'translate(-50%, -50%)'})({...renderProps, isPressed: renderProps.isDragging})}>
                {(renderProps) => (
                  <div className={thumbHitArea({size})}>
                    <div
                      className={thumb({
                        ...renderProps,
                        size,
                        thumbStyle
                      })} />
                  </div>
                )}
              </SliderThumb>
            </>
          );
        }}
      </SliderTrack>
    </SliderBase>
  );
}

let _Slider = /*#__PURE__*/ forwardRef(Slider);
export {_Slider as Slider};
