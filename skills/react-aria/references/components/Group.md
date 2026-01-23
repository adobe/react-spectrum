# Group

A group represents a set of related UI controls, and supports interactive states for styling.

```tsx
import {InputGroup} from 'vanilla-starter/InputGroup';
import {Input} from 'react-aria-components';

<InputGroup>
  <Input
    style={{width: '3ch', boxSizing: 'content-box'}}
    maxLength={3}
    aria-label="First 3 digits"
    placeholder="000" />
  –
  <Input
    style={{width: '2ch', boxSizing: 'content-box'}}
    maxLength={2}
    aria-label="Middle 2 digits"
    placeholder="00" />
  –
  <Input
    style={{width: '4ch', boxSizing: 'content-box'}}
    maxLength={4}
    aria-label="Last 4 digits"
    placeholder="0000" />
</InputGroup>
```

## A

PI

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `about` | `string | undefined` | — |  |
| `accessKey` | `string | undefined` | — |  |
| `aria-activedescendant` | `string | undefined` | — | Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. |
| `aria-atomic` | `(boolean | "true" | "false") | undefined` | — | Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. |
| `aria-autocomplete` | `"none" | "inline" | "list" | "both" | undefined` | — | Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be presented if they are made. |
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
| `aria-details` | `string | undefined` | — | Identifies the element (or elements) that provide a detailed, extended description for the object. |
| `aria-disabled` | `(boolean | "true" | "false") | undefined` | — | Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. |
| `aria-dropeffect` | `"link" | "copy" | "move" | "none" | "execute" | "popup" | undefined` | — | Indicates what functions can be performed when a dragged object is released on the drop target. |
| `aria-errormessage` | `string | undefined` | — | Identifies the element that provides an error message for the object. |
| `aria-expanded` | `(boolean | "true" | "false") | undefined` | — | Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. |
| `aria-flowto` | `string | undefined` | — | Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion, allows assistive technology to override the general default of reading in document source order. |
| `aria-grabbed` | `(boolean | "true" | "false") | undefined` | — | Indicates an element's "grabbed" state in a drag-and-drop operation. |
| `aria-haspopup` | `boolean | "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog" | undefined` | — | Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. |
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
| `aria-relevant` | `"text" | "all" | "additions" | "additions removals" | "additions text" | "removals" | "removals additions" | "removals text" | "text additions" | "text removals" | undefined` | — | Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified. |
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
| `autoCapitalize` | `"off" | "on" | "none" | "sentences" | "words" | "characters" | (string & {}) | undefined` | — |  |
| `autoCorrect` | `string | undefined` | — |  |
| `autoFocus` | `boolean | undefined` | — |  |
| `autoSave` | `string | undefined` | — |  |
| `children` | `ChildrenOrFunction<GroupRenderProps>` | — | The children of the component. A function may be provided to alter the children based on component state. |
| `className` | `ClassNameOrFunction<GroupRenderProps> | undefined` | 'react-aria-Group' | The CSS [className](https://developer.mozilla.org/en-US/docs/Web/API/Element/className) for the element. A function may be provided to compute the class based on component state. |
| `color` | `string | undefined` | — |  |
| `content` | `string | undefined` | — |  |
| `contentEditable` | `(boolean | "true" | "false") | "inherit" | "plaintext-only" | undefined` | — |  |
| `contextMenu` | `string | undefined` | — |  |
| `dangerouslySetInnerHTML` | `{ __html: string | TrustedHTML; } | undefined` | — |  |
| `datatype` | `string | undefined` | — |  |
| `defaultChecked` | `boolean | undefined` | — |  |
| `defaultValue` | `string | number | readonly string[] | undefined` | — |  |
| `dir` | `string | undefined` | — |  |
| `draggable` | `(boolean | "true" | "false") | undefined` | — |  |
| `enterKeyHint` | `"search" | "enter" | "done" | "go" | "next" | "previous" | "send" | undefined` | — |  |
| `exportparts` | `string | undefined` | — |  |
| `hidden` | `boolean | undefined` | — |  |
| `id` | `string | undefined` | — |  |
| `inert` | `boolean | undefined` | — |  |
| `inlist` | `any` | — |  |
| `inputMode` | `"text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal" | undefined` | — | Hints at the type of data that might be entered by the user while editing the element or its contents |
| `is` | `string | undefined` | — | Specify that a standard HTML element should behave like a defined custom built-in element |
| `isDisabled` | `boolean | undefined` | — | Whether the group is disabled. |
| `isInvalid` | `boolean | undefined` | — | Whether the group is invalid. |
| `isReadOnly` | `boolean | undefined` | — | Whether the group is read only. |
| `itemID` | `string | undefined` | — |  |
| `itemProp` | `string | undefined` | — |  |
| `itemRef` | `string | undefined` | — |  |
| `itemScope` | `boolean | undefined` | — |  |
| `itemType` | `string | undefined` | — |  |
| `lang` | `string | undefined` | — |  |
| `nonce` | `string | undefined` | — |  |
| `onAbort` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onAbortCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEnd` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationEndCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIteration` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationIterationCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStart` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAnimationStartCapture` | `React.AnimationEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onAuxClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeInput` | `React.InputEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeInputCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onBeforeToggle` | `React.ToggleEventHandler<HTMLElement> | undefined` | — |  |
| `onBlur` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onBlurCapture` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlay` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayThrough` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onCanPlayThroughCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onChange` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onChangeCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionEnd` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionEndCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionStart` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionStartCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionUpdate` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onCompositionUpdateCapture` | `React.CompositionEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenu` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onContextMenuCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onCopy` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCopyCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCut` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onCutCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClick` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDoubleClickCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onDrag` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnd` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEndCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnter` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragEnterCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragExit` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragExitCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragLeave` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragLeaveCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragOver` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragOverCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragStart` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDragStartCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDrop` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDropCapture` | `React.DragEventHandler<HTMLElement> | undefined` | — |  |
| `onDurationChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onDurationChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEmptied` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEmptiedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEncrypted` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEncryptedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEnded` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onEndedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onError` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onErrorCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onFocus` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onFocusCapture` | `React.FocusEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onGotPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onHoverChange` | `((isHovering: boolean) => void) | undefined` | — | Handler that is called when the hover state changes. |
| `onHoverEnd` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction ends. |
| `onHoverStart` | `((e: HoverEvent) => void) | undefined` | — | Handler that is called when a hover interaction starts. |
| `onInput` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInputCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInvalid` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onInvalidCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyDown` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyDownCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyPress` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyPressCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyUp` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onKeyUpCapture` | `React.KeyboardEventHandler<HTMLElement> | undefined` | — |  |
| `onLoad` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedData` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedDataCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedMetadata` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadedMetadataCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadStart` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLoadStartCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onLostPointerCaptureCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDown` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseDownCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseEnter` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseLeave` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMove` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseMoveCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOut` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOutCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOver` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseOverCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUp` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onMouseUpCapture` | `React.MouseEventHandler<HTMLElement> | undefined` | — |  |
| `onPaste` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onPasteCapture` | `React.ClipboardEventHandler<HTMLElement> | undefined` | — |  |
| `onPause` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPauseCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlay` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlayCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlaying` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPlayingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancel` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerCancelCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDown` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerDownCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerEnter` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerLeave` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMove` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerMoveCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOut` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOutCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOver` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerOverCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUp` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onPointerUpCapture` | `React.PointerEventHandler<HTMLElement> | undefined` | — |  |
| `onProgress` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onProgressCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onRateChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onRateChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onReset` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onResetCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onScroll` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollEnd` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onScrollEndCapture` | `React.UIEventHandler<HTMLElement> | undefined` | — |  |
| `onSeeked` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeekedCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeeking` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSeekingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSelect` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSelectCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onStalled` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onStalledCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSubmit` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onSubmitCapture` | `React.FormEventHandler<HTMLElement> | undefined` | — |  |
| `onSuspend` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onSuspendCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onTimeUpdate` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onTimeUpdateCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onToggle` | `React.ToggleEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancel` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchCancelCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEnd` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchEndCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMove` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchMoveCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStart` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTouchStartCapture` | `React.TouchEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancel` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionCancelCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEnd` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionEndCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRun` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionRunCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStart` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onTransitionStartCapture` | `React.TransitionEventHandler<HTMLElement> | undefined` | — |  |
| `onVolumeChange` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onVolumeChangeCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWaiting` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWaitingCapture` | `React.ReactEventHandler<HTMLElement> | undefined` | — |  |
| `onWheel` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `onWheelCapture` | `React.WheelEventHandler<HTMLElement> | undefined` | — |  |
| `part` | `string | undefined` | — |  |
| `popover` | `"" | "manual" | "auto" | undefined` | — |  |
| `popoverTarget` | `string | undefined` | — |  |
| `popoverTargetAction` | `"toggle" | "show" | "hide" | undefined` | — |  |
| `prefix` | `string | undefined` | — |  |
| `property` | `string | undefined` | — |  |
| `radioGroup` | `string | undefined` | — |  |
| `rel` | `string | undefined` | — |  |
| `resource` | `string | undefined` | — |  |
| `results` | `number | undefined` | — |  |
| `rev` | `string | undefined` | — |  |
| `role` | `"group" | "region" | "presentation" | undefined` | 'group' | An accessibility role for the group. By default, this is set to `'group'`. Use `'region'` when the contents of the group is important enough to be included in the page table of contents. Use `'presentation'` if the group is visual only and does not represent a semantic grouping of controls. |
| `security` | `string | undefined` | — |  |
| `slot` | `string | null | undefined` | — | A slot name for the component. Slots allow the component to receive props from a parent component. An explicit `null` value indicates that the local props completely override all props received from a parent. |
| `spellCheck` | `(boolean | "true" | "false") | undefined` | — |  |
| `style` | `(React.CSSProperties | ((values: GroupRenderProps & { defaultStyle: React.CSSProperties; }) => React.CSSProperties | undefined)) | undefined` | — | The inline [style](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/style) for the element. A function may be provided to compute the style based on component state. |
| `suppressContentEditableWarning` | `boolean | undefined` | — |  |
| `suppressHydrationWarning` | `boolean | undefined` | — |  |
| `tabIndex` | `number | undefined` | — |  |
| `title` | `string | undefined` | — |  |
| `translate` | `"yes" | "no" | undefined` | — |  |
| `typeof` | `string | undefined` | — |  |
| `unselectable` | `"off" | "on" | undefined` | — |  |
| `vocab` | `string | undefined` | — |  |
