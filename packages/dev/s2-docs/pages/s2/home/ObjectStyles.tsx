'use client';
import { Form, Radio, RadioGroup } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useState } from "react";

export function ObjectStyles() {
  let [rounding, setRounding] = useState('default');
  let [shadow, setShadow] = useState('elevated');
  let [border, setBorder] = useState('0');

  return (
    <>
      <Form styles={style({width: 'fit'})}>
        <RadioGroup label="Rounding" labelPosition="side" orientation="horizontal" value={rounding} onChange={setRounding}>
          <Radio value="none">none</Radio>
          <Radio value="sm">sm</Radio>
          <Radio value="default">default</Radio>
          <Radio value="lg">lg</Radio>
          <Radio value="xl">xl</Radio>
          <Radio value="full">full</Radio>
        </RadioGroup>
        <RadioGroup label="Shadow" labelPosition="side" orientation="horizontal" value={shadow} onChange={setShadow}>
          <Radio value="none">none</Radio>
          <Radio value="emphasized">emphasized</Radio>
          <Radio value="elevated">elevated</Radio>
        </RadioGroup>
        <RadioGroup label="Border" labelPosition="side" orientation="horizontal" value={border} onChange={setBorder}>
          <Radio value="0">0</Radio>
          <Radio value="1">1</Radio>
          <Radio value="2">2</Radio>
          <Radio value="4">4</Radio>
        </RadioGroup>
      </Form>
      <div
        className={style({
          backgroundColor: 'layer-2',
          maxWidth: 300,
          aspectRatio: '2/1',
          marginTop: 40,
          boxSizing: 'border-box',
          borderRadius: {
            rounding: {
              none: 'none',
              sm: 'sm',
              default: 'default',
              lg: 'lg',
              xl: 'xl',
              full: 'full'
            }
          },
          boxShadow: {
            shadow: {
              none: 'none',
              elevated: 'elevated',
              emphasized: 'emphasized'
            }
          },
          borderStyle: 'solid',
          borderColor: 'gray-1000',
          borderWidth: {
            border: {
              0: 0,
              1: 1,
              2: 2,
              4: 4
            }
          },
          padding: 16
        })({rounding, shadow, border})}>
        <div className={style({font: 'title'})}>Container heading</div>
        <div className={style({font: 'body-sm'})}>Container content</div>
      </div>
    </>
  );
}
