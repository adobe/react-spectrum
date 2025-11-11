'use client';
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { ExampleApp2 } from './ExampleApp2';

export function HCM() {
  return (
    <div
      style={{'--hcm': 'active', '--hcm-highlight': 'rgb(26, 235, 255)', '--hcm-highlighttext': 'black', '--hcm-buttonface': 'black', '--hcm-buttontext': 'white', '--hcm-buttonborder': 'white', '--hcm-graytext': 'rgb(63, 242, 63)', '--hcm-field': 'black', '--hcm-background': 'black', '--hcm-linktext': 'yellow'} as any}
      className={style({
        borderRadius: 'lg',
        overflow: 'clip',
        boxSizing: 'border-box',
        height: 350,
        marginTop: 16,
        display: 'flex',
        justifyContent: 'end'
      })}>
      <div className={style({minWidth: 520})}>
        <ExampleApp2 />
      </div>
    </div>
  )
}
