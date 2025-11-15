'use client';
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { ExampleApp2 } from './ExampleApp2';

export function HCM() {
  return (
    <div
      data-hcm
      style={{'--hcm-highlight': 'rgb(26, 235, 255)', '--hcm-highlighttext': 'black', '--hcm-buttonface': 'black', '--hcm-buttontext': 'white', '--hcm-buttonborder': 'white', '--hcm-graytext': 'rgb(63, 242, 63)', '--hcm-field': 'black', '--hcm-background': 'black', '--hcm-linktext': 'yellow'} as any}
      className={style({
        boxSizing: 'border-box',
        height: 350,
        margin: {
          default: -16,
          sm: 0
        },
        marginTop: 16,
        marginStart: {
          default: -16,
          sm: -96
        },
        display: 'flex',
        justifyContent: 'end',
        '--app-frame-radius-top': {
          type: 'borderTopStartRadius',
          value: {
            default: 'none',
            sm: 'lg'
          }
        }
      })}>
      <div className={style({flexShrink: 0, width: {default: '100%', sm: '200%'}, containerType: 'inline-size'})}>
        <ExampleApp2 showPanel />
      </div>
    </div>
  )
}
