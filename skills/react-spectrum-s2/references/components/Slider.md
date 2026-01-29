# Slider

Sliders allow users to quickly select a value within a range. They should be used when the upper and lower bounds to the range are invariable.

```tsx
import {Slider} from '@react-spectrum/s2';

<Slider />
```

## Value

Use the `value` or `defaultValue` prop to set the slider's value. The `onChange` event is called as the user drags, and `onChangeEnd` is called when the thumb is released.

```tsx
import {Slider} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useState} from 'react';

function Example() {
  let [currentValue, setCurrentValue] = useState(25);
  let [finalValue, setFinalValue] = useState(currentValue);

  return (
    <>
      <Slider
        label="Cookies to buy"
        /*- begin highlight -*/
        value={currentValue}
        onChange={setCurrentValue}
        onChangeEnd={setFinalValue} />
        {/*- end highlight -*/}
      <pre className={style({font: 'body'})}>
        onChange value: {currentValue}{'\n'}
        onChangeEnd value: {finalValue}
      </pre>
    </>
  );
}
```

### Value scale

By default, slider values are percentages between 0 and 100. Use the `minValue`, `maxValue`, and `step` props to set the allowed values. Steps are calculated starting from the minimum. For example, if `minValue={2}`, and `step={3}`, the valid step values would be 2, 5, 8, 11, etc.

```tsx
import {Slider} from '@react-spectrum/s2';

<Slider />
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `contextualHelp` | `ReactNode` | — | A ContextualHelp element to place next to the label. |
| `defaultValue` | `number | undefined` | — | The default value (uncontrolled). |
| `fillOffset` | `number | undefined` | — | The offset from which to start the fill. |
| `form` | `string | undefined` | — | The `<form>` element to associate the input with. The value of this attribute must be the id of a `<form>` in the same document. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#form). |
| `formatOptions` | `Intl.NumberFormatOptions | undefined` | — | The display format of the value label. |
| `id` | `string | undefined` | — | The element's unique identifier. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id). |
| `isDisabled` | `boolean | undefined` | — | Whether the whole Slider is disabled. |
| `isEmphasized` | `boolean | undefined` | — | Whether the Slider should be displayed with an emphasized style. |
| `label` | `ReactNode` | — | The content to display as the label. |
| `labelAlign` | `Alignment | undefined` | 'start' | The label's horizontal alignment relative to the element it is labeling. |
| `labelPosition` | `LabelPosition | undefined` | 'top' | The label's overall position relative to the element it is labeling. |
| `maxValue` | `number | undefined` | 100 | The slider's maximum value. |
| `minValue` | `number | undefined` | 0 | The slider's minimum value. |
| `name` | `string | undefined` | — | The name of the input element, used when submitting an HTML form. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#htmlattrdefname). |
| `onChange` | `((value: number) => void) | undefined` | — | Handler that is called when the value changes. |
| `onChangeEnd` | `((value: number) => void) | undefined` | — | Fired when the slider stops moving, due to being let go. |
| `size` | `"S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Slider. |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `step` | `number | undefined` | 1 | The slider's step value. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `thumbStyle` | `"default" | "precise" | undefined` | 'default' | The style of the Slider's thumb. |
| `trackStyle` | `"thin" | "thick" | undefined` | 'thin' | The style of the Slider's track. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `number | undefined` | — | The current value (controlled). |
