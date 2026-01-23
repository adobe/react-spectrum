# Visually

Hidden

VisuallyHidden hides its children visually, while keeping content visible
to screen readers.

```tsx
import {VisuallyHidden} from 'react-aria';

<VisuallyHidden>I am hidden</VisuallyHidden>
```

<InlineAlert variant="notice">
  <Heading>Positioning</Heading>
  <Content>VisuallyHidden is positioned absolutely, so it must have a `position: relative` or `position: absolute` ancestor. Otherwise, undesired scrollbars may appear.</Content>
</InlineAlert>

## A

PI

### Visually

Hidden

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "true" | "false") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"list" | "none" | "inline" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| `aria-braillelabel` | `string | undefined` | — | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| `aria-brailleroledescription` | `string | undefined` | — | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` | `(boolean | "true" | "false") | undefined` | — |  |
| `aria-checked` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` | `number | undefined` | — | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` | `number | undefined` | — | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` | `number | undefined` | — | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "true" | "false" | "page" | "step" | "location" | "date" | "time" | undefined` | — | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-description` | `string | undefined` | — | Defines a string value that describes or annotates the current element. |
| `aria-details` | `string | undefined` | — | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"link" | "none" | "copy" | "execute" | "move" | "popup" | undefined` | — | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` | `string | undefined` | — | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `(boolean | "true" | "false") | undefined` | — | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "dialog" | "grid" | "listbox" | "menu" | "tree" | "true" | "false" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` | `boolean | "true" | "false" | "grammar" | "spelling" | undefined` | — | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` | `string | undefined` | — | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-level` | `number | undefined` | — | Defines the hierarchical level of an element within a structure. |
| `aria-live` | `"off" | "assertive" | "polite" | undefined` | — | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` | `(boolean | "true" | "false") | undefined` | — | Indicates whether an element is modal when displayed. |
| `aria-multiline` | `(boolean | "true" | "false") | undefined` | — | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` | `(boolean | "true" | "false") | undefined` | — | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` | `"horizontal" | "vertical" | undefined` | — | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` | `string | undefined` | — | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` | `string | undefined` | — | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` | `number | undefined` | — | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` | `boolean | "true" | "false" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` | `"additions" | "additions removals" | "additions text" | "all" | "removals" | "removals additions" | "removals text" | "text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` | `(boolean | "true" | "false") | undefined` | — | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` | `string | undefined` | — | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` | `number | undefined` | — | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` | `number | undefined` | — | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` | `number | undefined` | — | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` | `(boolean | "true" | "false") | undefined` | — | Indicates the current "selected" state of various widgets. |
| `aria-setsize` | `number | undefined` | — | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` | `"none" | "ascending" | "descending" | "other" | undefined` | — | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` | `number | undefined` | — | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` | `number | undefined` | — | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` | `number | undefined` | — | Defines the current value for a range widget. |
| `aria-valuetext` | `string | undefined` | — | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `children` | `React.ReactNode` | — | The content to visually hide. |
| `className` | `string | undefined` | — |  |
| `dangerouslySetInnerHTML` | `{ __html: string | TrustedHTML; } | undefined` | — |  |
| `elementType` | `string | React.JSXElementConstructor<any> | undefined` | 'div' | The element type for the container. |
| `id` | `string | undefined` | — |  |
| `isFocusable` | `boolean | undefined` | — | Whether the element should become visible on focus, for example skip links. |
| `onAbort` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<FocusableElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<FocusableElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<FocusableElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<FocusableElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<FocusableElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onChange` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<FocusableElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<FocusableElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<FocusableElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<FocusableElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onInput` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<FocusableElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<FocusableElement> | undefined` | — |  |
| `onPaste` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<FocusableElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<FocusableElement> | undefined` | — |  |
| `onProgress` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<FocusableElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<FocusableElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<FocusableElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<FocusableElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<FocusableElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<FocusableElement> | undefined` | — |  |
| `onVolumeChange` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<FocusableElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<FocusableElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<FocusableElement> | undefined` | — |  |
| `role` | `React.AriaRole | undefined` | — |  |
| `style` | `React.CSSProperties | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |

### use

VisuallyHidden

For additional rendering flexibility, use the `useVisuallyHidden` hook . It supports the same
options as the component, and returns props to spread onto the element that should be hidden.

<FunctionAPI
  links={docs.links}
  function={docs.exports.useVisuallyHidden}
/>

## Example

See [useRadioGroup](RadioGroup/useRadioGroup.md#styling) and [useCheckbox](Checkbox/useCheckbox.md#styling)
for examples of using `VisuallyHidden` to hide native form elements visually.
