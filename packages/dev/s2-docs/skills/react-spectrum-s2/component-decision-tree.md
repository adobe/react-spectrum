# Component Decision Tree

If the user does not specify which component they would like to use, choose one based on the requirements. Use the following as a guide:

- Prefer an existing React Spectrum S2 component over a custom component.
- Match the interaction model first, then the visual treatment.
- Prefer the narrowest component that fits the requirement instead of a more general one.
- If two components could work, choose the more standard and accessible pattern.
- Reach for React Aria Components plus the S2 `style` macro only as a last resort when no S2 component fits the behavior or layout, or if the user specifically asks for a custom component.

## Actions and navigation

- Use `Button` for primary or secondary calls to action and prominent actions. It can also navigate.
- Use `ActionButton` for lower-emphasis actions, toolbar actions, row actions, and compact icon-led actions.
- Use `LinkButton` when the element should navigate like a link but look like a button.
- Use `Link` for inline or standalone text navigation.
- Use `ButtonGroup` or `ActionButtonGroup` only to group related buttons.
- Use `ActionMenu` for a simple "more actions" ellipsis button that opens a menu.
- Use `Menu` when the menu itself is the pattern, especially if you need sections, submenus, selection, links, or a custom trigger arrangement.
- Use `ActionBar` for bulk actions within a collection component.

## Choosing from options

- Use `Switch` for turning a setting on or off.
- Use `Checkbox` for a single independent yes or no option.
- Use `CheckboxGroup` for multiple simple visible options where many may be selected.
- Use `RadioGroup` for a small visible mutually exclusive list.
- Use `SelectBoxGroup` when options should stay visible and need richer presentation such as illustrations, labels, or descriptions.
- Use `Picker` for selecting from a collapsible list of known options when typing to search is not important.
- Use `ComboBox` when the user should type to filter options, search a long list, or create an action from the current input.
- Use `SegmentedControl` for a small mutually exclusive view or mode switch.
- Use `ToggleButton` for a single pressed/unpressed control.
- Use `ToggleButtonGroup` for compact formatting-style or tool-style toggles, especially if multi-select may be needed.

## Text and value input

- Use `TextField` for single-line plain text input.
- Use `SearchField` for a search query with search-specific clear and submit behavior.
- Use `TextArea` for multi-line text.
- Use `NumberField` for precise numeric entry and stepping.
- Use `Slider` for adjusting one numeric value when direct manipulation is more important than exact typed entry.
- Use `RangeSlider` for adjusting a numeric range.
- Use `DateField` or `TimeField` when keyboard editing of a date or time is the main interaction.
- Use `DatePicker` or `DateRangePicker` when a popover calendar should help with choosing dates.
- Use `Calendar` or `RangeCalendar` when the calendar grid itself is needed without the input field or popover.
- Use `ColorField` to edit a hex color or channel value directly.
- Use `ColorSwatch` to display a chosen color.
- Use `ColorSwatchPicker` to choose from predefined colors.
- Use `ColorArea`, `ColorSlider`, and `ColorWheel` for direct color manipulation.

## Collections and data views

- Use `TableView` when users need rows and columns, dense comparison, sortable headers, cell-level content, editable cells, column resizing, or other tabular behaviors.
- Use `ListView` for a flat list of records where each row is the main unit and may include icons, thumbnails, descriptions, and row actions.
- Use `TreeView` when the hierarchy itself must stay visible and expandable in place.
- Use `CardView` for visually rich collections of objects, galleries, or asset browsers with selection and bulk actions.
- Use `TagGroup` for compact tags, tokens, or filters rather than general records.
- Use `TableView` with expandable rows only if the tabular columns still matter after hierarchy is introduced.
- Use `ListView` with `hasChildItems` and breadcrumbs for drill-in navigation when only one level is shown at a time.

## `TableView` vs `ListView` vs `TreeView` vs `CardView`

- Choose `TableView` if the user needs to compare fields across columns.
- Choose `ListView` if the user needs a simple vertical list of records with optional secondary content and actions.
- Choose `TreeView` if parent-child structure is the key mental model.
- Choose `CardView` if preview imagery, card layouts, or gallery browsing matter more than dense comparison.

## Cards

- Use `Card` for one summarized object, not for an entire selectable collection.
- Use `CardView` when many cards need keyboard navigation, selection, loading states, empty states, or bulk actions.
- Prefer `AssetCard` for files, images, folders, documents, or other assets.
- Prefer `UserCard` for people or profiles.
- Prefer `ProductCard` for products or offers with a clear call to action.
- Use `Card` with `CollectionCardPreview` for grouped assets or a preview collage.
- Use a preview-only `Card` for gallery tiles in a waterfall-style presentation.
- Use a custom `Card` only when the object is still clearly a card but the built-in layouts do not fit the content structure.

## Structure and disclosure

- Use `Tabs` when switching between peer sections of content and showing one panel at a time.
- Use `SegmentedControl` instead of `Tabs` when switching app modes or views rather than full content panels.
- Use `Disclosure` for one collapsible section.
- Use `Accordion` for a group of related collapsible sections.
- Use `Breadcrumbs` to show navigation depth or hierarchy location.
- Use `Divider` to separate adjacent groups of content.

## Overlays, help, and feedback

- Use `Tooltip` for a short description of a focusable element. Do not rely on it for essential content.
- Use `ContextualHelp` for additional explanation near content, especially for non-interactive or disabled UI.
- Use `Popover` for interactive contextual content anchored to a nearby trigger when a modal is unnecessary.
- Use `Dialog` for modal tasks or workflows.
- Use `AlertDialog` for confirmations, destructive actions, and critical messages that must be acknowledged.
- Use `FullscreenDialog` for complex workflows that need substantially more space.
- Use `CustomDialog` only when the standard dialog layouts do not fit.
- Use `InlineAlert` for a persistent non-modal message associated with content in the current view.
- Use `Toast` for temporary global feedback after an action.

## Status, loading, media, and empty states

- Use `Badge` for compact color-coded metadata.
- Use `StatusLight` for an object's current status.
- Use `ProgressBar` or `ProgressCircle` for task progress over time.
- Use `Meter` for a level or quantity within a known range when it is not task progress.
- Use `Skeleton` for loading placeholders.
- Use `Avatar` or `AvatarGroup` for people and participants.
- Use `Image` for images that need loading and error handling.
- Use `IllustratedMessage` for empty states or error pages.
- Use `DropZone` for drag-and-drop file or object upload targets.
- Use `Form` to provide layout, submission, and validation structure for grouped fields.

## Quiet vs. full-emphasis variants

Several components expose an `isQuiet` (or `quiet` variant) prop that removes the chrome — borders, fills, and sometimes padding — so the control reads as inline content rather than a discrete object. Pick by *context*, not by visual taste:

- Use **quiet** variants for:
  - Toolbar and toolbar-like rows (`ActionButton`, `ToggleButton`, `ActionMenu` with `isQuiet`).
  - Inline editing affordances embedded in dense content (e.g. a `Picker` inside a table cell, an `ActionButton` inline in a paragraph).
  - Repeated controls in collection rows (`ListView`, `TreeView`, `TableView` row actions) where full button chrome would compete with the row content.
  - Compact secondary affordances next to body copy (a quiet `Link`, a quiet `Breadcrumbs` trail in a tight header).
  - Subordinate disclosures inside another container (`Accordion` with `isQuiet`, `Disclosure` with `isQuiet` inside a panel or card).
- Use the **default (full-emphasis)** variant for:
  - Standalone primary or secondary actions on a page (`Button`, full-chrome `ActionButton`, `LinkButton`).
  - Form controls in a Form layout (`Picker`, `ComboBox`, `TextField`, etc.) — quiet form fields are a deliberate inline-editing choice, not the default.
  - Top-level navigation (`Breadcrumbs`, `Tabs`).
  - The main content view (`ListView`, `TableView`, `TreeView` displayed as the page's primary surface).

If the design clearly shows borders, fills, or a defined hit target, use the default variant. If the control sits *inside* another bordered/filled surface and the design renders it without chrome, use quiet. Don't apply `isQuiet` just to make something look more compact — adjust spacing instead.

## Last-resort custom components

- Only create a custom component when no S2 component matches the required interaction pattern, or when the needed layout cannot be achieved by composing existing S2 components.
- Build custom components with React Aria Components for behavior and accessibility, and the S2 `style` macro for Spectrum styling. See [Creating Custom Components]({{guidesBase}}creating-custom-components.md) for the full pattern (`focusRing`, `baseColor`, `pressScale`, render props, animations, etc.).
- Do not bypass an existing S2 component just to apply unsupported visual customization.
