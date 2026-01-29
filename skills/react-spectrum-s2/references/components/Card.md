# Card

A Card summarizes an object that a user can select or navigate to.

```tsx
import {Card, CardPreview, Image, Content, Text, ActionMenu, MenuItem, Footer, StatusLight} from '@react-spectrum/s2';
import preview from 'url:./assets/preview.png';

<Card>
  <CardPreview>
    <Image src={preview} />
  </CardPreview>
  <Content>
    <Text slot="title">Card title</Text>
    <ActionMenu>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Share</MenuItem>
      <MenuItem>Delete</MenuItem>
    </ActionMenu>
    <Text slot="description">Card description. Give a concise overview of the context or functionality that's mentioned in the card title.</Text>
  </Content>
  <Footer>
    <StatusLight size="S" variant="positive">Published</StatusLight>
  </Footer>
</Card>
```

## Content

Cards are flexible containers that represent objects a user can select or navigate to. Most cards include a preview, metadata, and an optional footer. Spectrum includes several pre-defined card components with layouts for specific use cases, or you can combine these sections to create custom cards.

### Asset

A `AssetCard` represents an asset such as an image, video, document, or folder. The `CardPreview` can contain either an `Image` or illustration. By default, images are displayed in a square preview without cropping. Add metadata in the `Content` section using the `title` and `description` slots.

## S2 example

```tsx
import {AssetCard, CardPreview, Image, Content, Text, ActionMenu, MenuItem} from '@react-spectrum/s2';

<AssetCard>
  <CardPreview>
    <Image src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
  </CardPreview>
  <Content>
    <Text slot="title">Desert Sunset</Text>
    <ActionMenu>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Share</MenuItem>
      <MenuItem>Delete</MenuItem>
    </ActionMenu>
    <Text slot="description">PNG • 2/3/2024</Text>
  </Content>
</AssetCard>
```

```tsx
import {AssetCard, CardPreview, Content, Text, ActionMenu, MenuItem} from '@react-spectrum/s2';
import FolderGradient from '@react-spectrum/s2/illustrations/gradient/generic2/FolderClose';

<AssetCard>
  <CardPreview>
    <FolderGradient />
  </CardPreview>
  <Content>
    <Text slot="title">Projects</Text>
    <ActionMenu>
      <MenuItem>Edit</MenuItem>
      <MenuItem>Share</MenuItem>
      <MenuItem>Delete</MenuItem>
    </ActionMenu>
    <Text slot="description">10 items • 6/14/2024</Text>
  </Content>
</AssetCard>
```

### User

A `UserCard` represents a user profile. It includes an [Avatar](Avatar.md) and a `Content` section with `title` and `description` slots, along with an optional header image and `Footer`.

```tsx
import {UserCard, CardPreview, Image, Avatar, Content, Text, Footer, StatusLight} from '@react-spectrum/s2';
import preview from 'url:./assets/preview.png';

<UserCard>
  <CardPreview>
    <Image src={preview} />
  </CardPreview>
  <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
  <Content>
    <Text slot="title">Simone Carter</Text>
    <Text slot="description">Art Director at Luma Creative Studios. Visual storyteller and coffee enthusiast.</Text>
  </Content>
  <Footer>
    <StatusLight size="S" variant="positive">Available</StatusLight>
  </Footer>
</UserCard>
```

### Product

A `ProductCard` represents a product a user can take action on. It has a a thumbnail image and a `Content` section with `title` and `description` slots, a `Footer` containing a call to action, and an optional header image.

```tsx
import {ProductCard, CardPreview, Image, Content, Text, Footer, Button} from '@react-spectrum/s2';
import preview from 'url:./assets/preview.png';
import logo from 'url:./assets/logo.svg';

<ProductCard>
  <CardPreview>
    <Image slot="preview" src={preview} />
  </CardPreview>
  <Image slot="thumbnail" src={logo} />
  <Content>
    <Text slot="title">Command + R</Text>
    <Text slot="description">Your all-in-one shortcut for apps, automations, and devices.</Text>
  </Content>
  <Footer>
    <Button variant="primary">Buy now</Button>
  </Footer>
</ProductCard>
```

### Collection

A `CollectionCardPreview` displays up to 4 images in a collection of assets. When 4 images are provided, the first one is displayed as a larger hero image.

```tsx
import {Card, CollectionCardPreview, Image, Content, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Folder from '@react-spectrum/s2/icons/Folder';

<Card>
  <CollectionCardPreview>
    <Image alt="" src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    <Image alt="" src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    <Image alt="" src="https://images.unsplash.com/photo-1722172118908-1a97c312ce8c?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    <Image alt="" src="https://images.unsplash.com/photo-1718378037953-ab21bf2cf771?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
  </CollectionCardPreview>
  <Content>
    <Text slot="title">Travel</Text>
    <div className={style({gridColumnEnd: 'span 2', display: 'flex', alignItems: 'center', gap: 8})}>
      <Folder />
      <Text slot="description">20 photos</Text>
    </div>
  </Content>
</Card>
```

### Gallery

A card can omit its `Content` section and display only a preview to create a gallery card typically seen in a waterfall layout. Ensure that the preview image has `alt` text, and any content placed above the preview has enough contrast against the background.

```tsx
import {Card, CardPreview, Image, Badge, Avatar} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

<Card>
  <CardPreview>
    <Image
      alt="Narrow mountain trail with green grass and sharp peaks in the background"
      src="https://images.unsplash.com/photo-1722233987129-61dc344db8b6?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      styles={style({width: 'full', aspectRatio: 'square', objectFit: 'cover', pointerEvents: 'none'})} />
    <Badge
      variant="yellow"
      styles={style({
        position: 'absolute',
        top: 16,
        insetEnd: 16
      })}>
      Free
    </Badge>
    <Avatar
      src="https://i.imgur.com/xIe7Wlb.png"
      size={24}
      isOverBackground
      styles={style({
        position: 'absolute',
        bottom: 16,
        insetStart: 16
      })} />
  </CardPreview>
</Card>
```

### Custom

Combine the `CardPreview`, `Content`, and `Footer` components to create custom cards. Add additional elements and styles within these sections to create custom layouts as needed.

```tsx
import {Card, CardPreview, Image, Content, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import Select from '@react-spectrum/s2/icons/Select';

<Card>
  <CardPreview>
    <Image
      alt=""
      src="https://images.unsplash.com/photo-1671225137978-aa9a19071b9a?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
  </CardPreview>
  <Content>
    <div className={style({display: 'flex', alignItems: 'center', justifyContent: 'space-between'})}>
      <div className={style({display: 'flex', alignItems: 'center', gap: 4})}>
        <Select />
        <Text slot="description">Click through rate</Text>
      </div>
      <div className={style({display: 'flex', flexDirection: 'column'})}>
        <Text styles={style({font: 'title-xl'})}>1.012%</Text>
        <Text styles={style({font: 'ui-sm', color: 'positive-900'})}>21% ↑ average</Text>
      </div>
    </div>
  </Content>
</Card>
```

## Skeleton

Wrap a card in a [Skeleton](Skeleton.md) to display a loading state. Placeholder text content and images are displayed in a skeleton style.

```tsx
import {Skeleton, Card, CardPreview, Image, Content, Text} from '@react-spectrum/s2';

<Skeleton isLoading>
  <Card>
    <CardPreview>
      <Image src="https://images.unsplash.com/photo-1705034598432-1694e203cdf3?q=80&w=600&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" />
    </CardPreview>
    <Content>
      <Text slot="title">Placeholder title</Text>
      <Text slot="description">This is placeholder content approximating the length of the real content to avoid layout shifting when the real content appears.</Text>
    </Content>
  </Card>
</Skeleton>
```

## A

PI

### Card

```tsx
<Card>
  <CardPreview>
    <Image /> or <Illustration />
  </CardView>
  <Content>
    <Text slot="title" />
    <ActionMenu />
    <Text slot="description" />
  </Content>
  <Footer />
</Card>
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode | ((renderProps: CardRenderProps) => ReactNode)` | — | The children of the Card. |
| `density` | `"compact" | "regular" | "spacious" | undefined` | 'regular' | The amount of internal padding within the Card. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Card. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |
| `variant` | `"primary" | "secondary" | "tertiary" | "quiet" | undefined` | 'primary' | The visual style of the Card. |

### Asset

Card

```tsx
<AssetCard>
  <CardPreview>
    <Image /> or <Illustration />
  </CardView>
  <Content>
    <Text slot="title" />
    <ActionMenu />
    <Text slot="description" />
  </Content>
</AssetCard>
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode | ((renderProps: CardRenderProps) => ReactNode)` | — | The children of the Card. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Card. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |
| `variant` | `"primary" | "secondary" | "tertiary" | "quiet" | undefined` | 'primary' | The visual style of the Card. |

### User

Card

```tsx
<UserCard>
  <CardPreview>
    <Image />
  </CardView>
  <Avatar />
  <Content>
    <Text slot="title" />
    <ActionMenu />
    <Text slot="description" />
  </Content>
  <Footer />
</UserCard>
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode | ((renderProps: CardRenderProps) => ReactNode)` | — | The children of the Card. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Card. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |
| `variant` | `"primary" | "secondary" | "tertiary" | undefined` | — | The visual style of the Card. |

### Product

Card

```tsx
<ProductCard>
  <CardPreview>
    <Image slot="preview" />
  </CardView>
  <Image slot="thumbnail" />
  <Content>
    <Text slot="title" />
    <ActionMenu />
    <Text slot="description" />
  </Content>
  <Footer>
    <Button /> or <LinkButton />
  </Footer>
</ProductCard>
```

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode | ((renderProps: CardRenderProps) => ReactNode)` | — | The children of the Card. |
| `download` | `string | boolean | undefined` | — | Causes the browser to download the linked URL. A string may be provided to suggest a file name. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#download). |
| `href` | `string | undefined` | — | A URL to link to. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#href). |
| `hrefLang` | `string | undefined` | — | Hints at the human language of the linked URL. See[MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#hreflang). |
| `id` | `Key | undefined` | — | The unique id of the item. |
| `isDisabled` | `boolean | undefined` | — | Whether the item is disabled. |
| `onAction` | `(() => void) | undefined` | — | Handler that is called when a user performs an action on the item. The exact user event depends on the collection's `selectionBehavior` prop and the interaction modality. |
| `onPress` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when the press is released over the target. |
| `onPressChange` | `((isPressed: boolean) => void) | undefined` | — | Handler that is called when the press state changes. |
| `onPressEnd` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction ends, either over the target or when the pointer leaves the target. |
| `onPressStart` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press interaction starts. |
| `onPressUp` | `((e: PressEvent) => void) | undefined` | — | Handler that is called when a press is released over the target, regardless of whether it started on the target or not. |
| `ping` | `string | undefined` | — | A space-separated list of URLs to ping when the link is followed. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#ping). |
| `referrerPolicy` | `HTMLAttributeReferrerPolicy | undefined` | — | How much of the referrer to send when following the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#referrerpolicy). |
| `rel` | `string | undefined` | — | The relationship between the linked resource and the current page. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel). |
| `routerOptions` | `undefined` | — | Options for the configured client side router. |
| `size` | `"XS" | "S" | "M" | "L" | "XL" | undefined` | 'M' | The size of the Card. |
| `styles` | `StylesProp | undefined` | — | Spectrum-defined styles, returned by the `style()` macro. |
| `target` | `HTMLAttributeAnchorTarget | undefined` | — | The target window for the link. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target). |
| `textValue` | `string | undefined` | — | A string representation of the item's contents, used for features like typeahead. |
| `UNSAFE_className` | `UnsafeClassName | undefined` | — | Sets the CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `UNSAFE_style` | `CSSProperties | undefined` | — | Sets inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. Only use as a **last resort**. Use the `style` macro via the `styles` prop instead. |
| `value` | `object | undefined` | — | The object value that this item represents. When using dynamic collections, this is set automatically. |
| `variant` | `"primary" | "secondary" | "tertiary" | undefined` | — | The visual style of the Card. |
