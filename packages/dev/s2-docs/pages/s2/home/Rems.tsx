'use client';
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { ExampleApp2 } from "./ExampleApp2";
import { Slider } from "@react-spectrum/s2";
import { useState } from "react";

export function Rems() {
  let [value, setValue] = useState(16);
  return (
    <>
      <Slider
        label="Font size"
        minValue={8}
        maxValue={40}
        value={value}
        onChange={setValue}
        labelPosition="side"
        size="L"
        // @ts-ignore
        PRIVATE_staticColor
        styles={style({
          maxWidth: 400
        })} />
      <div
        className={style({
          boxSizing: 'border-box',
          height: 350,
          margin: {
            default: -16,
            sm: 0
          },
          marginTop: 16,
          containerType: 'inline-size',
          '--app-frame-radius-top': {
            type: 'borderTopStartRadius',
            value: {
              default: 'none',
              sm: 'lg'
            }
          }
        })}
        style={{'--rem': value + 'px'} as any}>
        <ExampleApp2 showPanel />
      </div>
    </>
  );
}
