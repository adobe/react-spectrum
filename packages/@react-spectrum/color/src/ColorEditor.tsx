import {ColorArea} from './ColorArea';
import {ColorField} from './ColorField';
import {ColorSlider} from './ColorSlider';
import {ColorSpace} from '@react-types/color';
import {DOMRef} from '@react-types/shared';
import {getColorChannels} from '@react-stately/color';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {Item, Picker} from '@react-spectrum/picker';
import React, {CSSProperties, useState} from 'react';
import {style} from '@react-spectrum/style-macro-s1' with {type: 'macro'};
import {useDOMRef} from '@react-spectrum/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface SpectrumColorEditorProps {
  /** Whether to hide the alpha channel color slider and color field. */
  hideAlphaChannel?: boolean
}

/**
 * ColorEditor provides a default UI for editing colors within a ColorPicker.
 */
export const ColorEditor = React.forwardRef(function ColorEditor(props: SpectrumColorEditorProps, ref: DOMRef<HTMLDivElement>) {
  let [format, setFormat] = useState<ColorSpace | 'hex'>('hex');
  let domRef = useDOMRef(ref);
  let formatter = useLocalizedStringFormatter(intlMessages, '@react-spectrum/color');

  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 4})()} ref={domRef}>
      <div className={style({display: 'flex', gap: 4})()}>
        <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" />
        <ColorSlider colorSpace="hsb" channel="hue" orientation="vertical" />
        {!props.hideAlphaChannel &&
          <ColorSlider channel="alpha" orientation="vertical" />
        }
      </div>
      <div className={style({display: 'flex', gap: 4})()}>
        <Picker
          aria-label={formatter.format('colorFormat')}
          isQuiet
          width="size-700"
          menuWidth="size-1000"
          selectedKey={format}
          onSelectionChange={f => setFormat(f as typeof format)}>
          <Item key="hex">{formatter.format('hex')}</Item>
          <Item key="rgb">{formatter.format('rgb')}</Item>
          <Item key="hsl">{formatter.format('hsl')}</Item>
          <Item key="hsb">{formatter.format('hsb')}</Item>
        </Picker>
        {format === 'hex'
          ? <ColorField isQuiet width="size-1000" aria-label={formatter.format('hex')} />
          : getColorChannels(format).map(channel => (
            <ColorField key={channel} colorSpace={format} channel={channel} isQuiet width="size-400" flex UNSAFE_style={{'--spectrum-textfield-min-width': 0} as CSSProperties} />
          ))}
        {!props.hideAlphaChannel &&
          <ColorField channel="alpha" isQuiet width="size-400" flex UNSAFE_style={{'--spectrum-textfield-min-width': 0} as CSSProperties} />}
      </div>
    </div>
  );
});
