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
  ColorSlider as AriaColorSlider,
  ColorSliderProps as AriaColorSliderProps,
  ContextValue,
  SliderOutput,
  SliderTrack,
  useLocale
} from 'react-aria-components';
import {ColorHandle} from './ColorHandle';
import {createContext, forwardRef, useRef} from 'react';
import {DOMRef, DOMRefValue, SpectrumLabelableProps} from '@react-types/shared';
import {FieldLabel} from './Field';
import {getAllowedOverrides, StyleProps} from './style-utils' with {type: 'macro'};
import {style} from '../style' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useSpectrumContextProps} from './useSpectrumContextProps';

export interface ColorSliderProps extends Omit<AriaColorSliderProps, 'children' | 'className' | 'style'>, Pick<SpectrumLabelableProps, 'contextualHelp'>, StyleProps {
  label?: string
}

export const ColorSliderContext = createContext<ContextValue<ColorSliderProps, DOMRefValue<HTMLDivElement>>>(null);

/**
 * A ColorSlider allows users to adjust an individual channel of a color value.
 */
export const ColorSlider = forwardRef(function ColorSlider(props: ColorSliderProps, ref: DOMRef<HTMLDivElement>) {
  [props, ref] = useSpectrumContextProps(props, ref, ColorSliderContext);
  let {UNSAFE_className = '', UNSAFE_style, styles} = props;
  let containerRef = useDOMRef(ref);
  let trackRef = useRef(null);
  let {locale} = useLocale();

  return (
    <AriaColorSlider
      {...props}
      ref={containerRef}
      style={UNSAFE_style}
      // The visual label is hidden when vertical, so make it an aria-label instead.
      aria-label={props['aria-label'] || (props.orientation === 'vertical' ? props.label : undefined)}
      className={renderProps => UNSAFE_className + style({
        width: {
          orientation: {
            horizontal: 192
          }
        },
        height: {
          orientation: {
            vertical: 192
          }
        },
        display: {
          orientation: {
            horizontal: 'grid',
            vertical: 'block'
          }
        },
        gridTemplateColumns: ['1fr', 'auto'],
        gridTemplateAreas: [
          'label output',
          'track track'
        ],
        rowGap: 4
      }, getAllowedOverrides())(renderProps, styles)}>
      {({isDisabled, orientation, state}) => (<>
        {orientation === 'horizontal' && (props.label || (props.label === undefined && !props['aria-label'] && !props['aria-labelledby'])) && (
          // If no external label, aria-label or aria-labelledby is provided,
          // default to displaying the localized channel value.
          // Specifically check if label is undefined. If label is `null` then display no visible label.
          // A default aria-label is provided by useColorSlider in that case.
          <FieldLabel isDisabled={isDisabled} contextualHelp={props.contextualHelp}>
            {props.label || state.value.getChannelName(props.channel, locale)}
          </FieldLabel>
        )}
        {orientation === 'horizontal' &&
          <SliderOutput
            className={style({
              gridArea: 'output',
              font: 'control',
              cursor: 'default',
              color: {
                default: 'neutral-subdued',
                isDisabled: 'disabled'
              }
            })} />
        }
        <SliderTrack
          ref={trackRef}
          style={({defaultStyle, isDisabled}) => ({
            background: isDisabled ? undefined : `${defaultStyle.background}, repeating-conic-gradient(#E1E1E1 0% 25%, white 0% 50%) 50% / 16px 16px`
          })}
          className={style({
            gridArea: 'track',
            width: {
              orientation: {
                horizontal: 'full',
                vertical: 24
              }
            },
            height: {
              orientation: {
                horizontal: 24,
                vertical: 'full'
              }
            },
            borderRadius: 'default',
            outlineColor: {
              default: 'gray-1000/10',
              forcedColors: 'ButtonBorder'
            },
            outlineWidth: 1,
            outlineOffset: -1,
            outlineStyle: {
              default: 'solid',
              isDisabled: 'none'
            },
            backgroundColor: {
              isDisabled: 'disabled'
            }
          })}>
          <ColorHandle
            containerRef={trackRef}
            getPosition={() => {
              let x = state.orientation === 'horizontal' ? state.getThumbPercent(0) : 0.5;
              let y = state.orientation === 'horizontal' ? 0.5 : 1 - state.getThumbPercent(0);
              return {x, y};
            }} />
        </SliderTrack>
      </>)}
    </AriaColorSlider>
  );
});
