import {
  Label,
  Slider as AriaSlider,
  SliderOutput,
  SliderProps as AriaSliderProps,
  SliderThumb,
  SliderTrack
} from 'react-aria-components';
import {FormContext, useFormProps} from './Form';
import {ReactNode, useRef, forwardRef, RefObject, useContext} from 'react';
import {FocusableRef, LabelPosition, InputDOMProps, Alignment} from '@react-types/shared';
import {useFocusableRef} from '@react-spectrum/utils';
import {style} from '../style/spectrum-theme' with {type: 'macro'};
import {StyleProps, focusRing, field, getAllowedOverrides} from './style-utils' with {type: 'macro'};
import {forwardRefType} from './types';
import {useNumberFormatter, useLocale} from '@react-aria/i18n';
import {clamp} from '@react-aria/utils';
import {mergeStyles} from '../style/runtime';
import {pressScale} from './pressScale';

export interface SliderBaseProps<T> extends Omit<AriaSliderProps<T>, 'children'>, StyleProps, InputDOMProps {
  children?: ReactNode,
  label?: ReactNode,
  labelAlign?: Alignment,
  size?: 'S' | 'M' | 'L' | 'XL',
  labelPosition?: LabelPosition
}

export interface SliderProps<T> extends AriaSliderProps<T>, StyleProps {
  label?: ReactNode,
  thumbLabel?: string,
  labelAlign?: Alignment,
  size?: 'S' | 'M' | 'L' | 'XL',
  labelPosition?: LabelPosition,
  fillOffset?: number,
  isEmphasized?: boolean,
  isThick?: boolean,
  isPrecise?: boolean
  // TODO
  // isEditable?: boolean
  // isRamp?: boolean
}

const slider = style({
  fontFamily: 'sans',
  fontSize: 'control',
  alignItems: {
    labelPosition: {
      side: 'center'
    }
  },
  color: {
    default: 'neutral-subdued',
    isDisabled: 'disabled'
  },
  width: {
    default: {
      size: {
        S: 192,
        M: 208,
        L: 224,
        XL: 240
      }
    },
    isInForm: 'auto'
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
  display: 'grid',
  gridArea: 'label',
  width: 'full',
  gridTemplateAreas: {
    labelPosition: {
      top: ['sliderLabel . output']
    }
  },
  gridTemplateColumns: {
    labelPosition: {
      top: [
        'auto 1fr auto'
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
  minWidth: 112, // an arbitrary number, no tokens for minwidth, can adjust if needed
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
      S: '[18px]',
      M: 20,
      L: '[22px]',
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
    default: {
      size: {
        S: '[18px]',
        M: 20,
        L: '[22px]',
        XL: 24
      }
    },
    isPrecise: {
      size: {
        S: 20,
        M: '[22px]',
        L: 24,
        XL: '[26px]'
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
    default: {
      size: {
        S: '[18px]',
        M: 20,
        L: '[22px]',
        XL: 24
      }
    },
    isPrecise: '[6px]'
  },
  height: {
    default: {
      size: {
        S: '[18px]',
        M: 20,
        L: '[22px]',
        XL: 24
      }
    },
    isPrecise: {
      size: {
        S: 20,
        M: '[22px]',
        L: 24,
        XL: '[26px]'
      }
    }
  },
  borderRadius: 'full',
  borderStyle: 'solid',
  borderWidth: {
    default: '[2px]',
    isPrecise: '[2px]'
  },
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

export let upperTrack = style({
  position: 'absolute',
  backgroundColor: {
    default: 'gray-300',
    isDisabled: 'disabled'
  },
  height: {
    default: 4,
    isThick: 16
  },
  top: '[50%]',
  borderRadius: {
    default: 'lg',
    isThick: 'sm'
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
  height: {
    default: 4,
    isThick: 16
  },
  top: '[50%]',
  borderRadius: {
    default: 'lg',
    isThick: 'sm'
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

export function SliderBase<T extends number | number[]>(props: SliderBaseProps<T> & {sliderRef: RefObject<HTMLDivElement>}) {
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
              <Label className={style({gridArea: {labelPosition: {top: 'sliderLabel'}}})({labelPosition})}>
                {label}
              </Label>
              {labelPosition === 'top' && outputValue}
            </div>
            <div className={style({gridArea: 'input', display: 'inline-flex', alignItems: 'center', gap: {default: 16, size: {L: 20, XL: 24}}})({size})}>
              {props.children}
              {labelPosition === 'side' && outputValue}
            </div>
          </>
        );
      }}
    </AriaSlider>
  );
}

function Slider<T extends number | number[]>(props: SliderProps<T>, ref: FocusableRef<HTMLDivElement>) {
  let formContext = useContext(FormContext);
  props = useFormProps(props);
  let {
    thumbLabel, 
    labelPosition = 'top', 
    size = 'M',
    fillOffset,
    isEmphasized,
    isThick,
    isPrecise
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

          fillOffset = fillOffset !== undefined ? clamp(fillOffset, state.getThumbMinValue(0), state.getThumbMaxValue(0)) : 0;

          let fillWidth = undefined;
          let offset = undefined; 
          if (fillOffset != null) {
            fillWidth = state.getThumbPercent(0) - state.getValuePercent(fillOffset);
            let isRightOfOffset = fillWidth > 0;
            offset = isRightOfOffset ? state.getValuePercent(fillOffset) : state.getThumbPercent(0);
          }

          return (
            <>
              <div className={upperTrack({isDisabled, isThick})} />
              <div style={{width: `${Math.abs(fillWidth!) * 100}%`, [cssDirection]: `${offset! * 100}%`}} className={filledTrack({isDisabled, isEmphasized, isThick})} />
              <SliderThumb  className={thumbContainer} index={0} ref={thumbRef}  aria-label={thumbLabel} style={(renderProps) => pressScale(thumbRef, {transform: 'translate(-50%, -50%)'})({...renderProps, isPressed: renderProps.isDragging})}>
                {(renderProps) => (
                  <div className={thumbHitArea({size})}>
                    <div
                      className={thumb({
                        ...renderProps,
                        size,
                        isPrecise
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

let _Slider = /*#__PURE__*/ (forwardRef as forwardRefType)(Slider);
export {_Slider as Slider};
