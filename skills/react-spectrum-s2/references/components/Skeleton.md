# Skeleton

A Skeleton wraps around content to render it as a placeholder.

```tsx
import {Skeleton, Image, Text} from '@react-spectrum/s2'
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import preview from 'url:./assets/preview.png';
import Select from '@react-spectrum/s2/icons/Select';

<Skeleton>
  <div className={style({display: 'flex', gap: 16, flexDirection: {default: 'column', sm: 'row'}})}>
    <Image
      src={preview}
      width={1600}
      height={1200}
      styles={style({height: 160, borderRadius: 'default', flexShrink: 0, aspectRatio: '4 / 3'})} />
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
      <Text styles={style({font: 'heading-lg'})}>Placeholder title</Text>
      <Text styles={style({font: 'body'})}>This is placeholder content approximating the length of the real content to avoid layout shifting when the real content appears.</Text>
      <div className={style({display: 'flex', gap: 4, alignItems: 'center'})}>
        <Select />
        <Text styles={style({font: 'ui'})}>Here is an icon.</Text>
      </div>
    </div>
  </div>
</Skeleton>
```

## Content

Skeleton replaces text, images, and icons inside it with a placeholder shimmer effect. Use mock data within your real component to create a loading screen that accurately simulates the final layout.

The following components are currently affected by Skeleton:

* [Image](Image.md)
* `Text`
* [Link](Link.md)
* `Icon`
* [StatusLight](StatusLight.md)
* [Badge](Badge.md)
* [Meter](Meter.md)

Form components within a skeleton are also disabled.

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — |  |
| `isLoading` | `boolean` | — |  |
