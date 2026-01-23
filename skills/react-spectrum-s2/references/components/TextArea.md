# Text

Area

A textarea allows a user to input mult-line text.

```tsx
import {TextArea} from '@react-spectrum/s2';

<TextArea />
```

## Value

Use the `value` or `defaultValue` prop to set the text value, and `onChange` to handle user input.

```tsx
import {TextArea} from '@react-spectrum/s2';
import {useState} from 'react';

function Example() {
  let [name, setName] = useState('');

  return (
    <>
      <TextArea
        label="Comment"
        placeholder="Share your thoughts!"
        value={name}
        onChange={setName} />
      {/*- end highlight -*/}
      <p>Your comment: {name}</p>
    </>
  );
}
```

## Forms

Use the `name` prop to submit the text value to the server. Set the `isRequired`, `minLength`, or `maxLength` props to validate the value, or implement custom client or server-side validation. See the [Forms](forms.md) guide to learn more.

```tsx
import {TextArea, Button, Form} from '@react-spectrum/s2';

function Example(props) {
  return (
    <Form>
      <TextArea
        {...props}
        label="Comment"
        placeholder="Share your thoughts!"
        name="email"
        description="Please provide at least 10 characters."
        
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
}
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `about` | `string | undefined` | — |  |
| `accessKey` | `string | undefined` | — |  |
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "false" | "true") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "list" | "inline" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
| `aria-braillelabel` | `string | undefined` | — | Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. |
| `aria-brailleroledescription` | `string | undefined` | — | Defines a human-readable, author-localized abbreviated description for the role of an element, which is intended to be converted into Braille. |
| `aria-busy` | `(boolean | "false" | "true") | undefined` | — |  |
| `aria-checked` | `boolean | "false" | "true" | "mixed" | undefined` | — | Indicates the current "checked" state of checkboxes, radio buttons, and other widgets. |
| `aria-colcount` | `number | undefined` | — | Defines the total number of columns in a table, grid, or treegrid. |
| `aria-colindex` | `number | undefined` | — | Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid. |
| `aria-colindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-colindex. |
| `aria-colspan` | `number | undefined` | — | Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-controls` | `string | undefined` | — | Identifies the element (or elements) whose contents or presence are controlled by the current element. |
| `aria-current` | `boolean | "step" | "time" | "false" | "true" | "page" | "location" | "date" | undefined` | — | Indicates the element that represents the current item within a container or set of related elements. |
| `aria-describedby` | `string | undefined` | — | Identifies the element (or elements) that describes the object. |
| `aria-description` | `string | undefined` | — | Defines a string value that describes or annotates the current element. |
| `aria-details` | `string | undefined` | — | Identifies the element that provides a detailed, extended description for the object. |
| `aria-disabled` | `(boolean | "false" | "true") | undefined` | — | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"none" | "link" | "copy" | "move" | "execute" | "popup" | undefined` | — | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `(boolean | "false" | "true") | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` | `string | undefined` | — | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `(boolean | "false" | "true") | undefined` | — | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "grid" | "dialog" | "menu" | "false" | "true" | "listbox" | "tree" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
| `aria-hidden` | `(boolean | "false" | "true") | undefined` | — | Indicates whether the element is exposed to an accessibility API. |
| `aria-invalid` | `boolean | "false" | "true" | "grammar" | "spelling" | undefined` | — | Indicates the entered value does not conform to the format expected by the application. |
| `aria-keyshortcuts` | `string | undefined` | — | Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. |
| `aria-label` | `string | undefined` | — | Defines a string value that labels the current element. |
| `aria-labelledby` | `string | undefined` | — | Identifies the element (or elements) that labels the current element. |
| `aria-level` | `number | undefined` | — | Defines the hierarchical level of an element within a structure. |
| `aria-live` | `"off" | "assertive" | "polite" | undefined` | — | Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. |
| `aria-modal` | `(boolean | "false" | "true") | undefined` | — | Indicates whether an element is modal when displayed. |
| `aria-multiline` | `(boolean | "false" | "true") | undefined` | — | Indicates whether a text box accepts multiple lines of input or only a single line. |
| `aria-multiselectable` | `(boolean | "false" | "true") | undefined` | — | Indicates that the user may select more than one item from the current selectable descendants. |
| `aria-orientation` | `"horizontal" | "vertical" | undefined` | — | Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. |
| `aria-owns` | `string | undefined` | — | Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship between DOM elements where the DOM hierarchy cannot be used to represent the relationship. |
| `aria-placeholder` | `string | undefined` | — | Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value. A hint could be a sample value or a brief description of the expected format. |
| `aria-posinset` | `number | undefined` | — | Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-pressed` | `boolean | "false" | "true" | "mixed" | undefined` | — | Indicates the current "pressed" state of toggle buttons. |
| `aria-readonly` | `(boolean | "false" | "true") | undefined` | — | Indicates that the element is not editable, but is otherwise operable. |
| `aria-relevant` | `"all" | "text" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
| `aria-required` | `(boolean | "false" | "true") | undefined` | — | Indicates that user input is required on the element before a form may be submitted. |
| `aria-roledescription` | `string | undefined` | — | Defines a human-readable, author-localized description for the role of an element. |
| `aria-rowcount` | `number | undefined` | — | Defines the total number of rows in a table, grid, or treegrid. |
| `aria-rowindex` | `number | undefined` | — | Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid. |
| `aria-rowindextext` | `string | undefined` | — | Defines a human readable text alternative of aria-rowindex. |
| `aria-rowspan` | `number | undefined` | — | Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid. |
| `aria-selected` | `(boolean | "false" | "true") | undefined` | — | Indicates the current "selected" state of various widgets. |
| `aria-setsize` | `number | undefined` | — | Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM. |
| `aria-sort` | `"none" | "ascending" | "descending" | "other" | undefined` | — | Indicates if items in a table or grid are sorted in ascending or descending order. |
| `aria-valuemax` | `number | undefined` | — | Defines the maximum allowed value for a range widget. |
| `aria-valuemin` | `number | undefined` | — | Defines the minimum allowed value for a range widget. |
| `aria-valuenow` | `number | undefined` | — | Defines the current value for a range widget. |
| `aria-valuetext` | `string | undefined` | — | Defines the human readable text alternative of aria-valuenow for a range widget. |
| `autoCapitalize` | `(string & {}) | "none" | "off" | "on" | "sentences" | "words" | "characters" | undefined` | — |  |
| `autoComplete` | `string | undefined` | — |  |
| `autoCorrect` | `string | undefined` | — |  |
| `autoFocus` | `boolean | undefined` | — |  |
| `autoSave` | `string | undefined` | — |  |
| `children` | `React.ReactNode` | — |  |
| `className` | `ClassNameOrFunction<InputRenderProps> | undefined` | 'react-aria-TextArea' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `color` | `string | undefined` | — |  |
| `cols` | `number | undefined` | — |  |
| `content` | `string | undefined` | — |  |
| `contentEditable` | `(boolean | "false" | "true") | "inherit" | "plaintext-only" | undefined` | — |  |
| `contextMenu` | `string | undefined` | — |  |
| `dangerouslySetInnerHTML` | `{ __html: string | TrustedHTML; } | undefined` | — |  |
| `datatype` | `string | undefined` | — |  |
| `defaultChecked` | `boolean | undefined` | — |  |
| `defaultValue` | `string | number | readonly string[] | undefined` | — |  |
| `dir` | `string | undefined` | — |  |
| `dirName` | `string | undefined` | — |  |
| `disabled` | `boolean | undefined` | — |  |
| `draggable` | `(boolean | "false" | "true") | undefined` | — |  |
| `enterKeyHint` | `"search" | "enter" | "done" | "go" | "next" | "previous" | "send" | undefined` | — |  |
| `exportparts` | `string | undefined` | — |  |
| `form` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `inlist` | `any` | — |  |
| `inputMode` | `"none" | "text" | "search" | "url" | "tel" | "email" | "numeric" | "decimal" | undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` | `string | undefined` | — | Specify that a standard HTML element should behave like a defined custom built-in element |
| `itemID` | `string | undefined` | — |  |
| `itemProp` | `string | undefined` | — |  |
| `itemRef` | `string | undefined` | — |  |
| `itemScope` | `boolean | undefined` | — |  |
| `itemType` | `string | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `maxLength` | `number | undefined` | — |  |
| `minLength` | `number | undefined` | — |  |
| `name` | `string | undefined` | — |  |
| `nonce` | `string | undefined` | — |  |
| `onAbort` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onChange` | `React.ChangeEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onInput` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPaste` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onProgress` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onVolumeChange` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLTextAreaElement> | undefined` | — |  |
| `part` | `string | undefined` | — |  |
| `placeholder` | `string | undefined` | — |  |
| `popover` | `"" | "manual" | "auto" | undefined` | — |  |
| `popoverTarget` | `string | undefined` | — |  |
| `popoverTargetAction` | `"show" | "hide" | "toggle" | undefined` | — |  |
| `prefix` | `string | undefined` | — |  |
| `property` | `string | undefined` | — |  |
| `radioGroup` | `string | undefined` | — |  |
| `readOnly` | `boolean | undefined` | — |  |
| `rel` | `string | undefined` | — |  |
| `required` | `boolean | undefined` | — |  |
| `resource` | `string | undefined` | — |  |
| `results` | `number | undefined` | — |  |
| `rev` | `string | undefined` | — |  |
| `role` | `React.AriaRole | undefined` | — |  |
| `rows` | `number | undefined` | — |  |
| `security` | `string | undefined` | — |  |
| `slot` | `string | undefined` | — |  |
| `spellCheck` | `(boolean | "false" | "true") | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: InputRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `suppressContentEditableWarning` | `boolean | undefined` | — |  |
| `suppressHydrationWarning` | `boolean | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |
| `title` | `string | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `typeof` | `string | undefined` | — |  |
| `unselectable` | `"off" | "on" | undefined` | — |  |
| `value` | `string | number | readonly string[] | undefined` | — |  |
| `vocab` | `string | undefined` | — |  |
| `wrap` | `string | undefined` | — |  |
