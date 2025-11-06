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
        styles={style({
          maxWidth: 350,
          marginStart: 'auto'
        })} />
      <div
        className={style({
          borderRadius: 'lg',
          overflow: 'clip',
          boxSizing: 'border-box',
          height: 350,
          marginTop: 16
        })} style={{'--rem': value + 'px'} as any}>
        <ExampleApp2 />
      </div>
    </>
  );
}
