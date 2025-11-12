/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

'use client';
import {ColorPicker} from 'react-aria-components';
import {ColorArea, ColorSlider, ColorField, ColorSwatch, Picker, PickerItem} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {getColorChannels} from '@react-stately/color';
import {useState} from 'react';
import type {ColorSpace} from 'react-aria-components';
// @ts-ignore
import intlMessages from './intl/*.json';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

interface ColorEditorProps {
  hideAlphaChannel?: boolean;
}

function ColorEditor({hideAlphaChannel = false}: ColorEditorProps) {
  let [format, setFormat] = useState<ColorSpace | 'hex'>('hex');
  let formatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/color');

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})}>
      <div style={{display: 'flex', gap: 12}}>
        <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
        <ColorSlider colorSpace="hsb" channel="hue" orientation="vertical" />
        {!hideAlphaChannel && (
          <ColorSlider channel="alpha" orientation="vertical" />
        )}
      </div>
      <div className={style({display: 'flex', gap: 4})}>
        <Picker
          aria-label={formatter.format('colorFormat')}
          isQuiet
          styles={style({width: 70})}
          value={format}
          onChange={(key) => setFormat(key as typeof format)}>
          <PickerItem id="hex">{formatter.format('hex')}</PickerItem>
          <PickerItem id="rgb">{formatter.format('rgb')}</PickerItem>
          <PickerItem id="hsl">{formatter.format('hsl')}</PickerItem>
          <PickerItem id="hsb">{formatter.format('hsb')}</PickerItem>
        </Picker>
        {format === 'hex'
          ? <ColorField aria-label={formatter.format('hex')} />
          : getColorChannels(format).map(channel => (
              <ColorField key={channel} colorSpace={format} channel={channel} />
            ))}
        {!hideAlphaChannel && (
          <ColorField channel="alpha" />
        )}
      </div>
    </div>
  );
}

export function ColorEditorExample() {
  return (
    <ColorPicker defaultValue="#5100FF">
      {({color}) => (
        <>
          <ColorEditor />
          <div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 16}}>
            <ColorSwatch color={color} size="L" />
            <span style={{fontSize: 16, fontWeight: 500}}>{color.getColorName(navigator.language || 'en-US')}</span>
          </div>
        </>
      )}
    </ColorPicker>
  );
}
