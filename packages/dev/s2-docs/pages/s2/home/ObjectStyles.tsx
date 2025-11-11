'use client';
import { Form, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useState } from "react";

export function ObjectStyles() {
  let [background, setBackground] = useState('elevated');
  let [rounding, setRounding] = useState('default');
  let [shadow, setShadow] = useState('elevated');
  let [border, setBorder] = useState('0');

  return (
    <>
      <div className={style({display: 'grid', gridTemplateColumns: ['max-content', 'auto'], columnGap: 8, rowGap: 16, alignItems: 'center', justifyContent: 'center'})}>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: 'end'})}>Background</span>
        <ToggleButtonGroup
          aria-label="Background"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[background]}
          onSelectionChange={keys => setBackground(String([...keys][0]))}>
          <ToggleButton id="transparent">transparent</ToggleButton>
          <ToggleButton id="base">base</ToggleButton>
          <ToggleButton id="layer-1">layer-1</ToggleButton>
          <ToggleButton id="layer-2">layer-2</ToggleButton>
          <ToggleButton id="elevated">elevated</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: 'end'})}>Border Radius</span>
        <ToggleButtonGroup
          aria-label="Border Radius"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[rounding]}
          onSelectionChange={keys => setRounding(String([...keys][0]))}>
          <ToggleButton id="none">none</ToggleButton>
          <ToggleButton id="sm">sm</ToggleButton>
          <ToggleButton id="default">default</ToggleButton>
          <ToggleButton id="lg">lg</ToggleButton>
          <ToggleButton id="xl">xl</ToggleButton>
          <ToggleButton id="full">full</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: 'end'})}>Box Shadow</span>
        <ToggleButtonGroup
          aria-labe="Box Shadow"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[shadow]}
          onSelectionChange={keys => setShadow(String([...keys][0]))}>
          <ToggleButton id="none">none</ToggleButton>
          <ToggleButton id="emphasized">emphasized</ToggleButton>
          <ToggleButton id="elevated">elevated</ToggleButton>
        </ToggleButtonGroup>
        <span className={style({font: 'ui', color: 'neutral-subdued', justifySelf: 'end'})}>Border Width</span>
        <ToggleButtonGroup
          aria-label="Border Width"
          staticColor="auto"
          density="compact"
          selectionMode="single"
          disallowEmptySelection
          selectedKeys={[border]}
          onSelectionChange={keys => setBorder(String([...keys][0]))}>
          <ToggleButton id="0">0</ToggleButton>
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
          marginX: 'auto',
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
            <span className={styles.function}>style</span>{'({\n  '}
            <span className={styles.property}>backgroundColor</span>: <span className={styles.string}>'{background}'</span>{',\n  '}
            <span className={styles.property}>boxShadow</span>: <span className={styles.string}>'{shadow}'</span>{',\n  '}
            <span className={styles.property}>borderRadius</span>: <span className={styles.string}>'{rounding}'</span>
            {border !== '0' && <>{',\n  '}
              <span className={styles.property}>borderWidth</span>: <span className={styles.number}>{border}</span>{',\n  '}
              <span className={styles.property}>borderStyle</span>: <span className={styles.string}>'solid'</span>{',\n  '}
              <span className={styles.property}>borderColor</span>: <span className={styles.string}>'gray-1000'</span>
            </>}
            {'\n})'}
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
