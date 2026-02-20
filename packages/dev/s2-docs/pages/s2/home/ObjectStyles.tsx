'use client';
import { ToggleButton, ToggleButtonGroup } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useState } from "react";

export function ObjectStyles() {
  let [background, setBackground] = useState('elevated');
  let [rounding, setRounding] = useState('default');
  let [shadow, setShadow] = useState('elevated');
  let [border, setBorder] = useState<string | null>(null);

  return (
    <>
      <div
        className={style({
          display: 'grid',
          gridTemplateColumns: {
            default: ['1fr'],
            sm: ['max-content', 'auto']
          },
          columnGap: 8,
          rowGap: {
            default: 8,
            sm: 16
          },
          alignItems: 'center',
          justifyContent: 'center'
        })}>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: {sm: 'end'}})}>Background</span>
        <ToggleButtonGroup
          aria-label="Background"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          selectedKeys={background ? [background] : []}
          onSelectionChange={keys => setBackground([...keys][0] as string)}>
          {/* <ToggleButton id="transparent">transparent</ToggleButton> */}
          <ToggleButton id="base">base</ToggleButton>
          <ToggleButton id="layer-1">layer-1</ToggleButton>
          <ToggleButton id="layer-2">layer-2</ToggleButton>
          <ToggleButton id="elevated">elevated</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: {sm: 'end'}})}>Border Radius</span>
        <ToggleButtonGroup
          aria-label="Border Radius"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          selectedKeys={rounding ? [rounding] : []}
          onSelectionChange={keys => setRounding([...keys][0] as string)}>
          {/* <ToggleButton id="none">none</ToggleButton> */}
          <ToggleButton id="sm">sm</ToggleButton>
          <ToggleButton id="default">default</ToggleButton>
          <ToggleButton id="lg">lg</ToggleButton>
          <ToggleButton id="xl">xl</ToggleButton>
          <ToggleButton id="full">full</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: {sm: 'end'}})}>Box Shadow</span>
        <ToggleButtonGroup
          aria-labe="Box Shadow"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          selectedKeys={shadow ? [shadow] : []}
          onSelectionChange={keys => setShadow([...keys][0] as string)}>
          {/* <ToggleButton id="none">none</ToggleButton> */}
          <ToggleButton id="emphasized">emphasized</ToggleButton>
          <ToggleButton id="elevated">elevated</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: {sm: 'end'}})}>Border Width</span>
        <ToggleButtonGroup
          aria-label="Border Width"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          selectedKeys={border ? [border] : []}
          onSelectionChange={keys => setBorder([...keys][0] as string)}>
          {/* <ToggleButton id="0">0</ToggleButton> */}
          <ToggleButton id="1">1</ToggleButton>
          <ToggleButton id="2">2</ToggleButton>
          <ToggleButton id="4">4</ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        className={style({
          backgroundColor: {
            background: {
              transparent: 'transparent',
              base: 'base',
              'layer-1': 'layer-1',
              'layer-2': 'layer-2',
              elevated: 'elevated'
            }
          },
          width: 'fit',
          maxWidth: 'full',
          overflow: 'auto',
          marginX: 'auto',
          marginTop: 40,
          boxSizing: 'border-box',
          borderRadius: {
            default: 'none',
            rounding: {
              sm: 'sm',
              default: 'default',
              lg: 'lg',
              xl: 'xl',
              full: 'full'
            }
          },
          boxShadow: {
            default: 'none',
            shadow: {
              elevated: 'elevated',
              emphasized: 'emphasized'
            }
          },
          borderStyle: 'solid',
          borderColor: 'gray-1000',
          borderWidth: {
            default: 0,
            border: {
              1: 1,
              2: 2,
              4: 4
            }
          },
          paddingY: 16,
          paddingX: {
            default: 24,
            rounding: {
              full: 48
            }
          }
        })({background, rounding, shadow, border})}>
        <pre className={style({font: 'code-sm', marginY: 0})}>
          <code style={{fontFamily: 'inherit', WebkitTextSizeAdjust: 'none'}}>
            <span className={styles.function}>style</span>{background || rounding || shadow || border ? '({\n  ' : '({})'}
            {background && <><span className={styles.property}>backgroundColor</span>: <span className={styles.string}>'{background}'</span>{rounding || shadow || border ? ',\n  ' : null}</>}
            {rounding && <><span className={styles.property}>borderRadius</span>: <span className={styles.string}>'{rounding}'</span>{shadow || border ? ',\n  ' : null}</>}
            {shadow && <><span className={styles.property}>boxShadow</span>: <span className={styles.string}>'{shadow}'</span>{border ? ',\n  ' : null}</>}
            {border && <>
              <span className={styles.property}>borderWidth</span>: <span className={styles.number}>{border}</span>{',\n  '}
              <span className={styles.property}>borderStyle</span>: <span className={styles.string}>'solid'</span>{',\n  '}
              <span className={styles.property}>borderColor</span>: <span className={styles.string}>'gray-1000'</span>
            </>}
            {background || rounding || shadow || border ? '\n})' : null}
          </code>
        </pre>
      </div>
    </>
  );
}

const styles = {
  string: style({color: 'green-1000'}),
  number: style({color: 'pink-1000'}),
  property: style({color: 'indigo-1000'}),
  function: style({color: 'red-1000'})
};
