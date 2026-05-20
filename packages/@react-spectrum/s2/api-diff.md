<!-- Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

# API Changelog

This changelog documents the differences between React Spectrum v3 and Spectrum 2.

## All

React Spectrum v3 [style props](https://react-spectrum.adobe.com/react-spectrum/styling.html) have been replaced by the [style macro](https://react-spectrum.corp.adobe.com/s2/#styling) across all components.

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| styles | 🟢 `StylesProp` | – | Pass the result of the `style` macro to this prop. |
| margin | – | 🔴 `Responsive<DimensionValue>` | |
| marginStart | – | 🔴 `Responsive<DimensionValue>` | |
| marginEnd | – | 🔴 `Responsive<DimensionValue>` | |
| marginTop | – | 🔴 `Responsive<DimensionValue>` | |
| marginBottom | – | 🔴 `Responsive<DimensionValue>` | |
| marginX | – | 🔴 `Responsive<DimensionValue>` | |
| marginY | – | 🔴 `Responsive<DimensionValue>` | |
| width | – | 🔴 `Responsive<DimensionValue>` | |
| height | – | 🔴 `Responsive<DimensionValue>` | |
| minWidth | – | 🔴 `Responsive<DimensionValue>` | |
| minHeight | – | 🔴 `Responsive<DimensionValue>` | |
| maxWidth | – | 🔴 `Responsive<DimensionValue>` | |
| maxHeight | – | 🔴 `Responsive<DimensionValue>` | |
| flex | – | 🔴 `Responsive<boolean \| number \| string>` | |
| flexGrow | – | 🔴 `Responsive<number>` | |
| flexShrink | – | 🔴 `Responsive<number>` | |
| flexBasis | – | 🔴 `Responsive<number \| string>` | |
| justifySelf | – | 🔴 `Responsive<'auto' \| 'center' \| 'end' \| 'flex-end' \| 'flex-start' \| 'left' \| 'normal' \| 'right' \| 'self-end' \| 'self-start' \| 'start' \| 'stretch'>` | |
| alignSelf | – | 🔴 `Responsive<'auto' \| 'center' \| 'end' \| 'flex-end' \| 'flex-start' \| 'normal' \| 'self-end' \| 'self-start' \| 'start' \| 'stretch'>` | |
| order | – | 🔴 `Responsive<number>` | |
| gridArea | – | 🔴 `Responsive<string>` | |
| gridColumn | – | 🔴 `Responsive<string>` | |
| gridRow | – | 🔴 `Responsive<string>` | |
| gridColumnStart | – | 🔴 `Responsive<string>` | |
| gridColumnEnd | – | 🔴 `Responsive<string>` | |
| gridRowStart | – | 🔴 `Responsive<string>` | |
| gridRowEnd | – | 🔴 `Responsive<string>` | |
| position | – | 🔴 `Responsive<'absolute' \| 'fixed' \| 'relative' \| 'static' \| 'sticky'>` | |
| zIndex | – | 🔴 `Responsive<number>` | |
| top | – | 🔴 `Responsive<DimensionValue>` | |
| bottom | – | 🔴 `Responsive<DimensionValue>` | |
| start | – | 🔴 `Responsive<DimensionValue>` | |
| end | – | 🔴 `Responsive<DimensionValue>` | |
| left | – | 🔴 `Responsive<DimensionValue>` | |
| right | – | 🔴 `Responsive<DimensionValue>` | |
| isHidden | – | 🔴 `Responsive<boolean>` | |
## Badge

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| variant | 🟢 `'accent' \| 'blue' \| 'brown' \| 'celery' \| 'chartreuse' \| 'cinnamon' \| 'cyan' \| 'fuchsia' \| 'gray' \| 'green' \| 'indigo' \| 'informative' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'orange' \| 'pink' \| 'positive' \| 'purple' \| 'red' \| 'seafoam' \| 'silver' \| 'turquoise' \| 'yellow'` | 🔴 `'fuchsia' \| 'indigo' \| 'info' \| 'magenta' \| 'negative' \| 'neutral' \| 'positive' \| 'purple' \| 'seafoam' \| 'yellow'` | |
## Button

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| form | 🟢 `string` | – | |
| formAction | 🟢 `string` | – | |
| formEncType | 🟢 `string` | – | |
| formMethod | 🟢 `string` | – | |
| formNoValidate | 🟢 `boolean` | – | |
| formTarget | 🟢 `string` | – | |
| name | 🟢 `string` | – | |
| value | 🟢 `string` | – | |
| slot | 🟢 `null \| string` | – | |
| variant | 🟢 `'accent' \| 'negative' \| 'primary' \| 'secondary'` | 🔴 `'accent' \| 'negative' \| 'primary' \| 'secondary' \| LegacyButtonVariant` | Note that the deprecated `cta` and `overBackground` variants are no longer supported. Please use `accent` and `primary` + `staticColor: 'white'` as replacements respectively. |
| fillStyle | 🟢 `'fill' \| 'outline'` | – | This prop replaces v3's `style` prop. |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| style | – | 🔴 `'fill' \| 'outline'` | This prop is replaced by the `fillStyle` prop. |
| isPending | – | 🔴 `boolean` | Not yet implemented in S2. |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| href | – | 🔴 `string` | This prop has been removed in favor of the new LinkButton component. |
| target | – | 🔴 `string` | This prop has been removed in favor of the new LinkButton component. |
| rel | – | 🔴 `string` | This prop has been removed in favor of the new LinkButton component. |
| elementType | – | 🔴 `ElementType \| JSXElementConstructor<any>` | Not supported in S2. |
## ActionButton

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| form | 🟢 `string` | – | |
| formAction | 🟢 `string` | – | |
| formEncType | 🟢 `string` | – | |
| formMethod | 🟢 `string` | – | |
| formNoValidate | 🟢 `boolean` | – | |
| formTarget | 🟢 `string` | – | |
| name | 🟢 `string` | – | |
| value | 🟢 `string` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL' \| 'XS'` | – | |
## ToggleButton

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL' \| 'XS'` | – | |
## Avatar

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `16 \| 20 \| 24 \| 28 \| 32 \| 36 \| 40 \| 44 \| 48 \| 56 \| 64 \| 80 \| 96 \| 112 \| number` | 🔴 `'avatar-size-100' \| 'avatar-size-200' \| 'avatar-size-300' \| 'avatar-size-400' \| 'avatar-size-50' \| 'avatar-size-500' \| 'avatar-size-600' \| 'avatar-size-700' \| 'avatar-size-75' \| string \| number` | Named sizes have been replaced with pixel values. |
| isOverBackground | 🟢 `boolean` | – | |
| isDisabled | – | 🔴 `boolean` | Focusable/interactive Avatars aren't supported in S2 yet. |
## Breadcrumbs

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| dependencies | 🟢 `Array<any>` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M'` | 🔴 `'L' \| 'M' \| 'S'` | Small is no longer supported in Spectrum Design. |
| showRoot | – | 🔴 `boolean` | Not yet implemented in S2. |
| isMultiline | – | 🔴 `boolean` | Not yet implemented in S2. |
| autoFocusCurrent | – | 🔴 `boolean` | Not yet implemented in S2. |
## ButtonGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
## Checkbox

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| inputRef | 🟢 `RefObject<HTMLInputElement \| null>` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
## CheckboxGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
## ColorArea

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| size | – | 🔴 `DimensionValue` | Set size via `style` macro instead. |
## ColorWheel

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `number` | 🔴 `DimensionValue` | Use pixel values instead. |
| slot | 🟢 `null \| string` | – | |
## ColorSlider

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| label | 🟢 `string` | 🔴 `ReactNode` | |
| slot | 🟢 `null \| string` | – | |
| showValueLabel | – | 🔴 `boolean` | Removed for accessibility reasons. |
## ColorField

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| placeholder | – | 🔴 `string` | Removed for accessibility reasons. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## ColorSwatch

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
## ComboBox

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| menuWidth | 🟢 `number` | 🔴 `DimensionValue` | This accepts pixel values in S2. |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| loadingState | – | 🔴 `LoadingState` | Not yet implemented in S2. |
| placeholder | – | 🔴 `string` | Removed for accessibility reasons. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
| onLoadMore | – | 🔴 `() => any` | Not yet implemented in S2. |
## ContextualHelp

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'S' \| 'XS'` | – | |
## Dialog

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| children | 🟢 `(DialogRenderProps) => ReactNode \| ReactNode` | 🔴 `ReactNode` | Close function moved from `DialogTrigger` to `Dialog`. |
| slot | 🟢 `null \| string` | – | |
| onDismiss | – | 🔴 `() => void` | Use `onOpenChange` on the DialogTrigger or `onDismiss` on the DialogContainer instead. |
## DialogTrigger

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| type | 🟢 `'fullscreen' \| 'fullscreenTakeover' \| 'modal' \| 'popover'` | 🔴 `'fullscreen' \| 'fullscreenTakeover' \| 'modal' \| 'popover' \| 'tray'` | Tray not yet implemented in S2. |
| mobileType | – | 🔴 `'fullscreen' \| 'fullscreenTakeover' \| 'modal' \| 'tray'` | Not yet implemented in S2. |
| targetRef | – | 🔴 `RefObject<HTMLElement>` | No longer supported in S2. |
| children | 🟢 `ReactNode` | 🔴 `[ReactElement, ReactElement \| SpectrumDialogClose]` | Close function moved from `DialogTrigger` to `Dialog`. |

## Divider

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| staticColor | 🟢 `'black' \| 'white'` | – | |

## Form

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| isReadOnly | – | 🔴 `boolean` | Not yet implemented in S2. |
| validationState | – | 🔴 `ValidationState` | No longer supported in S2. |
| validationBehavior | – | 🔴 `'aria' \| 'native'` | Not yet implemented in S2. |
## IllustratedMessage

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S'` | – | |
| orientation | 🟢 `'horizontal' \| 'vertical'` | – | |
## InlineAlert

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| variant | 🟢 `'informative' \| 'negative' \| 'neutral' \| 'notice' \| 'positive'` | 🔴 `'info' \| 'negative' \| 'neutral' \| 'notice' \| 'positive'` | |
| fillStyle | 🟢 `'boldFill' \| 'border' \| 'subtleFill'` | – | |
## Link

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| variant | 🟢 `'primary' \| 'secondary'` | 🔴 `'overBackground' \| 'primary' \| 'secondary'` | Use `staticColor` to replace `overBackground`. |
| staticColor | 🟢 `'black' \| 'white'` | – | |
| isStandalone | 🟢 `boolean` | – | |
## Meter

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| variant | 🟢 `'informative' \| 'negative' \| 'notice' \| 'positive'` | 🔴 `'critical' \| 'informative' \| 'positive' \| 'warning'` | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | 🔴 `'L' \| 'S'` | |
| staticColor | 🟢 `'black' \| 'white'` | – | |
| labelPosition | – | 🔴 `LabelPosition` | Not yet implemented in S2. |
| showValueLabel | – | 🔴 `boolean` | Removed for accessibility reasons. |
## MenuTrigger

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| closeOnSelect | – | 🔴 `boolean` | Not yet implemented in S2. |
## SubmenuTrigger

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| targetKey | – | 🔴 `Key` | |
## Menu

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
| onScroll | 🟢 `(UIEvent<Element>) => void` | – | |
## ActionMenu

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| closeOnSelect | – | 🔴 `boolean` | Not yet implemented in S2. |
| trigger | – | 🔴 `MenuTriggerType` | Not yet implemented in S2. |
## NumberField

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## Picker

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| menuWidth | 🟢 `number` | 🔴 `DimensionValue` | This accepts pixel values in S2. |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
| isLoading | – | 🔴 `boolean` | Not yet implemented in S2. |
| onLoadMore | – | 🔴 `() => any` | Not yet implemented in S2. |
## ProgressBar

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | 🔴 `'L' \| 'S'` | |
| variant | – | 🔴 `'overBackground'` | Use `staticColor` to replace `overBackground`.  |
| labelPosition | – | 🔴 `LabelPosition` | Not yet implemented in S2. |
| showValueLabel | – | 🔴 `boolean` | Removed for accessibility reasons. |
## ProgressCircle

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| variant | – | 🔴 `'overBackground'` | Use `staticColor` to replace `overBackground`. |
## Radio

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| inputRef | 🟢 `RefObject<HTMLInputElement \| null>` | – | |
| slot | 🟢 `null \| string` | – | |
## RadioGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
| showErrorIcon | – | 🔴 `boolean` | Removed for accessibility reasons. |
## SearchField

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| placeholder | – | 🔴 `string` | Removed for accessibility reasons. |
| icon | – | 🔴 `ReactElement \| null` | Not yet implemented in S2. |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## Slider

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| labelAlign | 🟢 `Alignment` | – | |
| isEmphasized | 🟢 `boolean` | – | |
| trackStyle | 🟢 `'thick' \| 'thin'` | – | |
| thumbStyle | 🟢 `'default' \| 'precise'` | – | |
| slot | 🟢 `null \| string` | – | |
| isFilled | – | 🔴 `boolean` | Always filled in S2 design. |
| trackGradient | – | 🔴 `Array<string>` | Not supported in S2 design. |
| showValueLabel | – | 🔴 `boolean` | Removed for accessibility reasons. |
| getValueLabel | – | 🔴 `(number) => string` | Not yet implemented in S2. |
| orientation | – | 🔴 `Orientation` | Not yet implemented in S2. |
## RangeSlider

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| labelAlign | 🟢 `Alignment` | – | |
| isEmphasized | 🟢 `boolean` | – | |
| trackStyle | 🟢 `'thick' \| 'thin'` | – | |
| thumbStyle | 🟢 `'default' \| 'precise'` | – | |
| slot | 🟢 `null \| string` | – | |
| showValueLabel | – | 🔴 `boolean` | Removed for accessibility reasons. |
| getValueLabel | – | 🔴 `(RangeValue<number>) => string` | Not yet implemented in S2. |
| orientation | – | 🔴 `Orientation` | Not yet implemented in S2. |
## StatusLight

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| variant | 🟢 `'brown' \| 'celery' \| 'chartreuse' \| 'cinnamon' \| 'cyan' \| 'fuchsia' \| 'indigo' \| 'informative' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'pink' \| 'positive' \| 'purple' \| 'seafoam' \| 'silver' \| 'turquoise' \| 'yellow'` | 🔴 `'celery' \| 'chartreuse' \| 'fuchsia' \| 'indigo' \| 'info' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'positive' \| 'purple' \| 'seafoam' \| 'yellow'` | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isDisabled | – | 🔴 `boolean` | Not supported in S2 design. |
## Switch

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| inputRef | 🟢 `RefObject<HTMLInputElement \| null>` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
## TabList

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| aria-label | 🟢 `string` | – | |
| aria-labelledby | 🟢 `string` | – | |
| aria-describedby | 🟢 `string` | – | |
| aria-details | 🟢 `string` | – | |
| dependencies | 🟢 `Array<any>` | – | |
| items | 🟢 `Iterable<T>` | – | |
| id | – | 🔴 `string` | |
## Tabs

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| slot | 🟢 `null \| string` | – | |
| items | – | 🔴 `Iterable<{}>` | Pass items to `TabList` instead. |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| isEmphasized | – | 🔴 `boolean` | Not supported in S2 design. |
| disallowEmptySelection | – | 🔴 `boolean` | Tabs always disallow empty selection. |
## TabPanels

This component has been removed in S2. Provide `<TabPanel>` elements as direct children of `<Tabs>` instead.

## TagGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S'` | – | |
| isEmphasized | 🟢 `boolean` | – | |
| actionLabel | – | 🔴 `string` | Use `groupActionLabel` instead. |
| onAction | – | 🔴 `() => void` | Use `onGroupAction` instead. |
| groupActionLabel | 🟢 `string` | – | |
| onGroupAction | 🟢 `() => void` | – | |
| selectionBehavior | 🟢 `SelectionBehavior` | – | |
| disabledKeys | 🟢 `Iterable<Key>` | – | |
| selectionMode | 🟢 `SelectionMode` | – | |
| disallowEmptySelection | 🟢 `boolean` | – | |
| selectedKeys | 🟢 `'all' \| Iterable<Key>` | – | |
| defaultSelectedKeys | 🟢 `'all' \| Iterable<Key>` | – | |
| onSelectionChange | 🟢 `(Selection) => void` | – | |
| slot | 🟢 `null \| string` | – | |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## TextArea

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| icon | – | 🔴 `ReactElement \| null` | Not yet implemented in S2. |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| placeholder | – | 🔴 `string` | Removed for accessibility reasons. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## TextField

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isInvalid | 🟢 `boolean` | – | |
| slot | 🟢 `null \| string` | – | |
| icon | – | 🔴 `ReactElement \| null` | Not yet implemented in S2. |
| isQuiet | – | 🔴 `boolean` | Not supported in S2 design. |
| placeholder | – | 🔴 `string` | Removed for accessibility reasons. |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
## Tooltip

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| variant | – | 🔴 `'info' \| 'negative' \| 'neutral' \| 'positive'` | Not supported in S2 design. |
| placement | – | 🔴 `'bottom' \| 'end' \| 'left' \| 'right' \| 'start' \| 'top'` | Use TooltipTrigger's `placement` instead |
| showIcon | – | 🔴 `boolean` | Not supported in S2 design. |
| isOpen | – | 🔴 `boolean` | Should be passed to TooltipTrigger instead. |
| id | – | 🔴 `string` | |
## TooltipTrigger

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| placement | 🟢 `'bottom' \| 'end' \| 'left' \| 'right' \| 'start' \| 'top'` | 🔴 `'bottom' \| 'bottom left' \| 'bottom right' \| 'bottom start' \| 'bottom end' \| 'top' \| 'top left' \| 'top right' \| 'top start' \| 'top end' \| 'left' \| 'left top' \| 'left bottom' \| 'start' \| 'start top' \| 'start bottom' \| 'right' \| 'right top' \| 'right bottom' \| 'end' \| 'end top' \| 'end bottom'` | |
## Item

The v3 `Item` component has been split into multiple components depending on the type of collection it is within. These include:

* MenuItem
* PickerItem
* ComboBoxItem
* Breadcrumb
* Tag

In addition, the `key` prop has been renamed to `id` on all item components.

## Section

The v3 `Section` component has been split into multiple components depending on the type of collection it is within. These include:

* MenuSection
* PickerSection
* ComboBoxSection

The section components accept a `Header` as a child instead of a `title` prop. Both a heading and description are now supported within a section header.

```jsx
<MenuSection>
  <Header>
    <Heading>Publish and export</Heading>
    <Text slot="description">Social media, other formats</Text>
  </Header>
  <MenuItem>Item</MenuItem>
</MenuSection>
```
