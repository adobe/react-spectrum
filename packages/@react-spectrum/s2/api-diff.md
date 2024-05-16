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
| variant | 🟢 `'accent' \| 'blue' \| 'brown' \| 'celery' \| 'charteuse' \| 'cinnamon' \| 'cyan' \| 'fuchsia' \| 'gray' \| 'green' \| 'indigo' \| 'informative' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'orange' \| 'pink' \| 'positive' \| 'purple' \| 'red' \| 'seafoam' \| 'silver' \| 'turquoise' \| 'yellow'` | 🔴 `'fuchsia' \| 'indigo' \| 'info' \| 'magenta' \| 'negative' \| 'neutral' \| 'positive' \| 'purple' \| 'seafoam' \| 'yellow'` | |
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
| isDisabled | – | 🔴 `boolean` | Focusable/interactive Avatars aren't supported in S2 yet. |
| size | – | 🔴 `'avatar-size-100' \| 'avatar-size-200' \| 'avatar-size-300' \| 'avatar-size-400' \| 'avatar-size-50' \| 'avatar-size-500' \| 'avatar-size-600' \| 'avatar-size-700' \| 'avatar-size-75' \| (string & {<br>  <br>}) \| number` | This prop has been removed in favor of providing a size via the `styles` prop. |
## ButtonGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
## Checkbox

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| inputRef | 🟢 `MutableRefObject<HTMLInputElement>` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
## CheckboxGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
| showErrorIcon | – | 🔴 `boolean` | Removed for accessibility reasons. |
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
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
| onLoadMore | – | 🔴 `() => any` | Not yet implemented in S2. |
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
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
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
| inputRef | 🟢 `MutableRefObject<HTMLInputElement>` | – | |
| slot | 🟢 `null \| string` | – | |
## RadioGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| slot | 🟢 `null \| string` | – | |
| validationState | – | 🔴 `ValidationState` | Use `isInvalid` instead. |
| showErrorIcon | – | 🔴 `boolean` | Removed for accessibility reasons. |
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
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
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
## StatusLight

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| variant | 🟢 `'brown' \| 'celery' \| 'chartreuse' \| 'cinnamon' \| 'cyan' \| 'fuchsia' \| 'indigo' \| 'informative' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'pink' \| 'positive' \| 'purple' \| 'seafoam' \| 'silver' \| 'turquoise' \| 'yellow'` | 🔴 `'celery' \| 'chartreuse' \| 'fuchsia' \| 'indigo' \| 'info' \| 'magenta' \| 'negative' \| 'neutral' \| 'notice' \| 'positive' \| 'purple' \| 'seafoam' \| 'yellow'` | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
| isDisabled | – | 🔴 `boolean` | Not supported in S2 design. |
## Switch

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| inputRef | 🟢 `MutableRefObject<HTMLInputElement>` | – | |
| slot | 🟢 `null \| string` | – | |
| size | 🟢 `'L' \| 'M' \| 'S' \| 'XL'` | – | |
## TagGroup

| Prop | Spectrum 2 | RSP v3 | Comments |
|------|------------|--------|----------|
| size | 🟢 `'L' \| 'M' \| 'S'` | – | |
| isEmphasized | 🟢 `boolean` | – | |
| selectionBehavior | 🟢 `SelectionBehavior` | – | |
| disabledKeys | 🟢 `Iterable<Key>` | – | |
| selectionMode | 🟢 `SelectionMode` | – | |
| disallowEmptySelection | 🟢 `boolean` | – | |
| selectedKeys | 🟢 `'all' \| Iterable<Key>` | – | |
| defaultSelectedKeys | 🟢 `'all' \| Iterable<Key>` | – | |
| onSelectionChange | 🟢 `(Selection) => void` | – | |
| slot | 🟢 `null \| string` | – | |
| actionLabel | – | 🔴 `string` | Not yet implemented in S2.|
| onAction | – | 🔴 `() => void` | Not yet implemented in S2. |
| maxRows | – | 🔴 `number` | Not yet implemented in S2. |
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
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
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
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
| contextualHelp | – | 🔴 `ReactNode` | Not yet implemented in S2. |
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
* Tag

In addition, the `key` prop has been renamed to `id` on all item components.

## Section

The v3 `Section` component used in `Menu` is now named `MenuSection`. This accepts a `Header` as a child instead of a `title` prop. Both a heading and description are now supported within a section header.

```jsx
<MenuSection>
  <Header>
    <Heading>Publish and export</Heading>
    <Text slot="description">Social media, other formats</Text>
  </Header>
  <MenuItem>Item</MenuItem>
</MenuSection>
```
