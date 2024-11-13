# Spectrum 2 Migration Guide

Use the following guide to manually upgrade v3 React Spectrum components to use Spectrum 2.

Note that `[PENDING]` indicates that future changes will occur before the final release, and the current solution should be considered temporary.

## All components
- Update imports to use the `@react-spectrum/s2` package instead of `@adobe/react-spectrum` or individual packages like `@react-spectrum/button`
- Update style props to use style macro instead. See the [Style props](#style-props) section below

## Button
- Change `variant=“cta”` to `variant="accent"`
- Change `variant=“overBackground”` to `variant=“primary” staticColor=“white”`
- Change `style` to `fillStyle`
- [PENDING] Comment out `isPending` (it has not been implemented yet)
- Remove `isQuiet` (it is no longer supported)
- If `href` is present, `Button` should be converted to a `LinkButton`
- Remove `elementType` (it is no longer supported)

## ActionButton

## ToggleButton

## Avatar
- [PENDING] Comment out `isDisabled` (it has not been implemented yet)
- Remove `size` and instead provide a size via the style macro (i.e. `styles={style({size: 20})}`)

## Breadcrumbs
- [PENDING] Comment out `showRoot` (it has not been implemented yet)
- [PENDING] Comment out `isMultiline` (it has not been implemented yet)
- [PENDING] Comment out `autoFocusCurrent` (it has not been implemented yet)
- Remove `size="S"` (Small is no longer a supported size in Spectrum 2)

## ButtonGroup

## Checkbox

## CheckboxGroup
- Remove `showErrorIcon` (it has been removed for accessibility reasons)

## ColorArea
- Remove `size` prop and set size via `style` macro instead

## ColorWheel
- Remove `size` prop and set size via `style` macro instead

## ColorSlider
- Remove `showValueLabel` (it has been removed for accessibility reasons)

## ColorField
- Remove `isQuiet` (it is no longer supported)
- Remove `placeholder` (it has been removed for accessibility reasons)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)

## ColorSwatch

## Combobox
- Change `menuWidth` value from a `DimensionValue` to a pixel value
- Remove `isQuiet` (it is no longer supported)
- [PENDING] Comment out `loadingState` (it has not been implemented yet)
- Remove `placeholder` (it is no longer supported)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)
- [PENDING] Comment out `onLoadMore` (it has not been implemented yet)

## Dialog
- Update children to move render props from being the second child of `DialogTrigger` to being a child of `Dialog`
- Remove `onDismiss` and use `onOpenChange` on the `DialogTrigger`, or `onDismiss` on the `DialogContainer` instead

## `DialogTrigger`
- [PENDING] Comment out `type=“tray”` (`Tray` has not been implemented yet)
- [PENDING] Comment out `mobileType=“tray”` (`Tray` has not been implemented yet)
- Remove `targetRef` (it is no longer supported)
- Update `children` to remove render props usage, and note that the `close` function was moved from `DialogTrigger` to `Dialog`

## Divider
- Remove Divider if within Dialog (Updated design for Dialog)

## Flex
- Update `Flex` to be a `div` and apply flex styles using the style macro

## Form
- Remove `isQuiet` (it is no longer supported)
- Remove `isReadOnly` (it is no longer supported)
- Remove `validationState` (it is no longer supported)
- Remove `validationBehavior` (it is no longer supported)

## Grid
- Update `Grid` to be a `div` and apply grid styles using the style macro

## IllustratedMessage

## InlineAlert
- Change `variant=“info”` to `variant=“informative”`

## Link
- Change `variant=“overBackground”` to `staticColor=“white”`

## MenuTrigger
- [PENDING] Comment out `closeOnSelect` (it has not been implemented yet)

## SubmenuTrigger
- Remove `targetKey` (TODO: this may be a v3 bug or API differ bug)

## Menu

## ActionMenu
- [PENDING] Comment out `closeOnSelect` (it has not been implemented yet)
- [PENDING] Comment out `trigger` (it has not been implemented yet)
- What does Item become?

## Picker
- Change `menuWidth` value from a `DimensionValue` to a pixel value
- Remove `isQuiet` (it is no longer supported)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)
- [PENDING] Comment out `isLoading` (it has not been implemented yet)
- [PENDING] Comment out `onLoadMore` (it has not been implemented yet)

## ProgressBar
- Change `variant=“overBackground”` to `staticColor=“white”`
- [PENDING] Comment out `labelPosition` (it has not been implemented yet)
- [PENDING] Comment out `showValueLabel` (it has not been implemented yet)

## ProgressCircle
- Change `variant=“overBackground”` to `staticColor=“white”`

## Radio

## RadioGroup
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)
- Remove `showErrorIcon` (it has been removed for accessibility reasons)

## SearchField
- Remove `placeholder` (it has been removed for accessibility reasons)
- [PENDING] Comment out icon (it has not been implemented yet)
- Remove `isQuiet` (it is no longer supported)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)

# Slider
- Remove `isFilled` (Slider is always filled in Spectrum 2 design)
- Remove `trackGradient` (Not supported in S2 design)
- Remove `showValueLabel` (it has been removed for accessibility reasons)
- [PENDING] Comment out `getValueLabel` (it has not been implemented yet)
- [PENDING] Comment out `orientation` (it has not been implemented yet)

# RangeSlider
- Remove `showValueLabel` (it has been removed for accessibility reasons)
- [PENDING] Comment out `getValueLabel` (it has not been implemented yet)
- [PENDING] Comment out `orientation` (it has not been implemented yet)

## StatusLight
- Remove `isDisabled` (it is no longer supported)
- Change `variant=“info”` to `variant="informative"`

## Switch

## TagGroup
- [PENDING] Comment out `actionLabel` (it has not been implemented yet)
- [PENDING] Comment out `onAction` (it has not been implemented yet)
- [PENDING] Comment out `maxRows` (it has not been implemented yet)
- [PENDING] Comment out `errorMessage` (it has not been implemented yet)
- [PENDING] Comment out `isInvalid` (it has not been implemented yet)
- [PENDING] Comment out `validationState` (`isInvalid` should be used when it becomes available)

## TextArea
- [PENDING] Comment out `icon` (it has not been implemented yet)
- Remove `isQuiet` (it is no longer supported)
- Remove `placeholder`  (it has been removed for accessibility reasons)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)

## TextField
- [PENDING] Comment out `icon` (it has not been implemented yet)
- Remove `isQuiet` (it is no longer supported)
- Remove `placeholder`  (it has been removed for accessibility reasons)
- Change `validationState=“invalid”` to `isInvalid`
- Remove `validationState=“valid”` (it is no longer supported)

## Tooltip
- Remove `variant` (it is no longer supported)
- Remove `placement` and add to the parent `TooltipTrigger` instead
- Remove `showIcon` (it is no longer supported)
- Remove `isOpen` and add to the parent `TooltipTrigger` instead

## TooltipTrigger
- Update `placement="bottom left"` to be `placement=“bottom”`
- Update `placement="bottom right"` to be `placement=“bottom”`
- Update `placement="bottom start"` to be `placement=“bottom”`
- Update `placement="bottom end"` to be `placement=“bottom”`
- Update `placement="top left"` to be `placement=“top”`
- Update `placement="top right"` to be `placement=“top”`
- Update `placement="top start"` to be `placement=“top”`
- Update `placement="top end"` to be `placement=“top”`
- Update `placement="left top"` to be `placement=“left”`
- Update `placement="left bottom"` to be `placement=“left”`
- Update `placement="start top"` to be `placement=“start”`
- Update `placement="start bottom"` to be `placement=“start”`
- Update `placement="right top"` to be `placement=“right”`
- Update `placement="right bottom"` to be `placement=“right”`
- Update `placement="end top"` to be `placement=“end”`
- Update `placement="end bottom"` to be `placement=“end”`

## View
- Update `View` to be a `div` and apply styles using the style macro

## Item
- If within `Menu`:
  - Update `Item` to be a `MenuItem`
- If within `ActionMenu`:
  - Update `Item` to be a `MenuItem`
- If within `TagGroup`:
  - Update `Item` to be a `Tag`
- If within `Breadcrumbs`:
  - Update `Item` to be a `Breadcrumb`
- If within `Picker`:
  - Update `Item` to be a `PickerItem`
- If within `ComboBox`:
  - Update `Item` to be a `ComboBoxItem`
- If within `ListBox`:
  - Update `Item` to be a `ListBoxItem`
- If within `TabList`:
  - Update `Item` to be a `Tab`
- If within `TabPanels`:
  - Update `Item` to be a `TabPanel` and remove surrounding `TabPanels`
- Update `key` to be `id`

## Section
- If within `Menu`:
  - Update `Section` to be a `MenuSection`
  - Move `title` prop string to be a child of new `Heading` within a `Header`
- If within `ComboBox`:
  - Update `Section` to be a `ComboBoxSection`
  - Move `title` prop string to be a child of new `Heading` within a `Header`
- If within `Picker`:
  - Update `Section` to be a `ComboBoxSection`
  - Move `title` prop string to be a child of new `Heading` within a `Header`

---

## Style props

React Spectrum v3 supported a limited set of [style props](https://react-spectrum.adobe.com/react-spectrum/styling.html) for layout and positioning using Spectrum-defined values. Usage of these should be updated to instead use the style macro.

Example:

```diff
- import {ActionButton} from '@adobe/react-spectrum';
+ import {ActionButton} from '@react-spectrum/s2';
+ import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

- <ActionButton marginStart="size-100">
+ <ActionButton styles={style({marginStart: 8})}>
  Edit
</ActionButton>
```

### Border width

Affected style props: `borderWidth`, `borderStartWidth`, `borderEndWidth`, `borderTopWidth`, `orderBottomWidth`, `borderXWidth`, `borderYWidth`.

Example:

```diff
- <View borderWidth="thin"  />
+ <div className={style({borderWidth: 1})} />
```

Border widths should be updated to use pixel values. Use the following mappings:

| v3 | S2 |
|----|----|
| `'none'` | `0` |
| `'thin'` | `1` |
| `'thick'` | `2` |
| `'thicker'` | `4` |
| `'thickest'` | `'[8px]'` |

### Border radius

Affected style props: `borderRadius`, `borderTopStartRadius`, `borderTopEndRadius`, `borderBottomStartRadius`, `borderBottomEndRadius`.

Example:

```diff
- <View borderRadius="small"  />
+ <div className={style({borderRadius: 'sm'})} />
```

Border radius values should be updated to use pixel values. Use the following mappings:

| v3 | S2 |
|----|----|
| `'size-0'` | `0` |
| `'xsmall'` | `'[1px]'` |
| `'small'` | `'sm'` |
| `'regular'` | `'default'` |
| `'medium'` | `'lg'` |
| `'large'` | `'xl'` |

### Dimension values

Affected style props: `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, `maxHeight`, `margin`, `marginStart`, `marginEnd`, `marginTop`, `marginBottom`, `marginX`, `marginY`, `top`, `bottom`, `left`, `right`, `start`, `end`, `flexBasis`, `gap`, `columnGap`, `rowGap`, `padding`, `paddingX`, `paddingY`, `paddingStart`, `paddingEnd`, `paddingTop`, `paddingBottom`.

Dimension values should be converted to pixel values. Use the following mappings:

| v3 | S2 |
|----|----|
| `'size-0'` | `0` |
| `'size-10'` | `1` |
| `'size-25'` | `2` |
| `'size-40'` | `3` |
| `'size-50'` | `4` |
| `'size-65'` | `5` |
| `'size-75'` | `6` |
| `'size-85'` | `7` |
| `'size-100'` | `8` |
| `'size-115'` | `9` |
| `'size-125'` | `10` |
| `'size-130'` | `11` |
| `'size-150'` | `12` |
| `'size-160'` | `13` |
| `'size-175'` | `14` |
| `'size-200'` | `16` |
| `'size-225'` | `18` |
| `'size-250'` | `20` |
| `'size-275'` | `22` |
| `'size-300'` | `24` |
| `'size-325'` | `26` |
| `'size-350'` | `28` |
| `'size-400'` | `32` |
| `'size-450'` | `36` |
| `'size-500'` | `40` |
| `'size-550'` | `44` |
| `'size-600'` | `48` |
| `'size-675'` | `54` |
| `'size-700'` | `56` |
| `'size-800'` | `64` |
| `'size-900'` | `72` |
| `'size-1000'` | `80` |
| `'size-1200'` | `96` |
| `'size-1250'` | `100` |
| `'size-1600'` | `128` |
| `'size-1700'` | `136` |
| `'size-2000'` | `160` |
| `'size-2400'` | `192` |
| `'size-3000'` | `240` |
| `'size-3400'` | `272` |
| `'size-3600'` | `288` |
| `'size-4600'` | `368` |
| `'size-5000'` | `400` |
| `'size-6000'` | `480` |
| `'static-size-0'` | `0` |
| `'static-size-10'` | `1` |
| `'static-size-25'` | `2` |
| `'static-size-40'` | `3` |
| `'static-size-50'` | `4` |
| `'static-size-65'` | `5` |
| `'static-size-100'` | `8` |
| `'static-size-115'` | `9` |
| `'static-size-125'` | `10` |
| `'static-size-130'` | `11` |
| `'static-size-150'` | `12` |
| `'static-size-160'` | `13` |
| `'static-size-175'` | `14` |
| `'static-size-200'` | `16` |
| `'static-size-225'` | `18` |
| `'static-size-250'` | `20` |
| `'static-size-300'` | `24` |
| `'static-size-400'` | `32` |
| `'static-size-450'` | `36` |
| `'static-size-500'` | `40` |
| `'static-size-550'` | `44` |
| `'static-size-600'` | `48` |
| `'static-size-700'` | `56` |
| `'static-size-800'` | `64` |
| `'static-size-900'`| `72` |
| `'static-size-1000'` | `80` |
| `'static-size-1200'` | `96` |
| `'static-size-1700'` | `136` |
| `'static-size-2400'` | `192` |
| `'static-size-2600'` | `208` |
| `'static-size-3400'` | `272` |
| `'static-size-3600'` | `288` |
| `'static-size-4600'` | `368` |
| `'static-size-5000'` | `400` |
| `'static-size-6000'` | `480` |
| `'single-line-height'` | `32` |
| `'single-line-width'` | `192` |

### Breakpoints

Break points previously used in style props can be used in the style macro with updated keys. Use the following mappings:

| v3 | S2 |
|----|----|
| `base` | `default` |
| `S` | `sm` |
| `M` | `md` |
| `L` | `lg` |

Example:

```diff
- <View width={{ base: 'size-2000', L: 'size-5000' }} />
+ <div className={style({width: {default: 160, lg: '[400px]'}) />
```
