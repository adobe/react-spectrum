'use client';
import { Checkbox, Divider, Picker, PickerItem } from "@react-spectrum/s2";
import { focusRing, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import { useRef, useState } from "react";
import { Button } from "react-aria-components";

export function States() {
  let ref = useRef(null);
  let [isPressed, setPressed] = useState(false);
  let [isHovered, setHovered] = useState(false);
  let [variant, setVariant] = useState<'accent' | 'negative'>('accent');
  let [isDisabled, setDisabled] = useState(false);
  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateAreas: {
          default: [
            'props',
            'preview',
            'divider',
            'code'
          ],
          xl: [
            'props divider code',
            'preview divider code'
          ]
        },
        gridTemplateColumns: {
          default: ['1fr'],
          xl: ['minmax(max-content, 1fr)', 'min-content', 'minmax(0, max-content)']
        },
        gridTemplateRows: {
          xl: ['auto', '1fr']
        },
        columnGap: {
          default: 0,
          xl: 24
        },
        rowGap: {
          default: 24,
          xl: 0
        },
        alignItems: 'center',
        backgroundColor: 'layer-2',
        borderRadius: {
          default: 'none',
          sm: 'lg'
        },
        boxShadow: 'emphasized',
        padding: 24,
        margin: {
          default: -16,
          sm: 0
        },
        marginTop: 0
      })}>
      <div
        className={style({
          gridArea: 'props',
          display: 'flex',
          flexDirection: 'column',
          alignItems: {
            default: 'center',
            xl: 'start'
          },
          gap: 16
        })}>
        <Picker
          label="Variant"
          labelPosition="side"
          value={variant}
          onChange={key => setVariant(key as any)}
          styles={style({width: 150})}>
          <PickerItem id="accent">accent</PickerItem>
          <PickerItem id="negative">negative</PickerItem>
        </Picker>
        <Checkbox isSelected={isDisabled} onChange={setDisabled}>Disabled</Checkbox>
      </div>
      <div
        className={style({
          gridArea: 'preview',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        })}>
        <Button
          ref={ref}
          onPressChange={setPressed}
          onHoverChange={setHovered}
          isDisabled={isDisabled}
          className={renderProps => style({
            ...focusRing(),
            font: 'ui-xl',
            fontWeight: 'medium',
            userSelect: 'none',
            height: 48,
            paddingX: 'pill',
            borderStyle: 'none',
            borderRadius: 'pill',
            transition: 'default',
            disableTapHighlight: true,
            backgroundColor: {
              variant: {
                accent: {
                  default: 'accent-900',
                  isHovered: 'accent-1000',
                  isPressed: 'accent-1100'
                },
                negative: {
                  default: 'negative-900',
                  isHovered: 'negative-1000',
                  isPressed: 'negative-1100'
                }
              },
              isDisabled: 'gray-100'
            },
            color: {
              default: 'gray-25',
              isDisabled: 'disabled'
            }
          })({...renderProps, variant})}>
          Action
        </Button>
      </div>
      <Divider orientation="vertical" styles={style({gridArea: 'divider'})} />
      <pre
        className={style({
          font: 'code-sm',
          marginY: 0,
          gridArea: 'code',
          overflow: 'auto',
          margin: {
            default: -16,
            sm: 0
          },
          marginTop: 0
        })}>
        <code style={{fontFamily: 'inherit', WebkitTextSizeAdjust: 'none'}}>
          {'<'}<span className={styles.function}>Button</span>{'\n  '}
          <span className={styles.property}>className</span>{'={'}<span className={styles.variable}>states</span>{' => '}<span className={styles.function}>style</span>{'({\n    '}
          <span className={styles.property}>backgroundColor</span>{': {\n      '}
          <span className={styles.property}>default</span>{': {\n        '}
          <span className={styles.property}>variant</span>{': {\n          '}
          <span className={highlight({isHighlighted: variant === 'accent' && !isDisabled})}>
            <span className={styles.property}>accent</span>
          </span>{': {\n            '}
          <span className={highlight({isHighlighted: variant === 'accent' && !isHovered && !isPressed && !isDisabled})}>
            <span className={styles.property}>default</span>: <span className={styles.string}>'accent-900'</span>{',\n            '}
          </span>
          <span className={highlight({isHighlighted: variant === 'accent' && isHovered && !isPressed && !isDisabled})}>
            <span className={styles.property}>isHovered</span>: <span className={styles.string}>'accent-1000'</span>{',\n            '}
          </span>
          <span className={highlight({isHighlighted: variant === 'accent' && isPressed && !isDisabled})}>
            <span className={styles.property}>isPressed</span>: <span className={styles.string}>'accent-1100'</span>{'\n          '}
          </span>
          {'},\n          '}
          <span className={highlight({isHighlighted: variant === 'negative' && !isDisabled})}>
            <span className={styles.property}>negative</span>
          </span>{': {\n            '}
          <span className={highlight({isHighlighted: variant === 'negative' && !isHovered && !isPressed && !isDisabled})}>
            <span className={styles.property}>default</span>: <span className={styles.string}>'negative-900'</span>{',\n            '}
          </span>
          <span className={highlight({isHighlighted: variant === 'negative' && isHovered && !isPressed && !isDisabled})}>
            <span className={styles.property}>isHovered</span>: <span className={styles.string}>'negative-1000'</span>{',\n            '}
          </span>
          <span className={highlight({isHighlighted: variant === 'negative' && isPressed && !isDisabled})}>
            <span className={styles.property}>isPressed</span>: <span className={styles.string}>'negative-1100'</span>{'\n          '}
          </span>
          {'}\n        '}
          {'},\n        '}
          <span className={highlight({isHighlighted: isDisabled})}>
            <span className={styles.property}>isDisabled</span>: <span className={styles.string}>'gray-100'</span>{'\n      '}
          </span>
          {'}\n    '}
          {'}\n  '}
          {'})({...'}<span className={styles.variable}>states</span>, <span className={styles.variable}>variant</span>{'})}>\n'}
          {'  Action\n'}
          {'</'}<span className={styles.function}>Button</span>{'>'}
        </code>
      </pre>
    </div>
  )
}

const styles = {
  string: style({color: 'green-1000'}),
  number: style({color: 'pink-1000'}),
  property: style({color: 'indigo-1000'}),
  function: style({color: 'red-1000'}),
  variable: style({color: 'fuchsia-1000'})
};

const highlight = style({
  fontWeight: {
    isHighlighted: 'bold'
  }
});
