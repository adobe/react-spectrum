<!-- Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License. -->

- Start Date: 11/11/2021
- RFC PR: https://github.com/adobe/react-spectrum/pull/2883
- Authors: Danny North (dnorth), Marshall Peterson (marshallpete)

# TableView Column Resizing

## Summary

Being able to resize columns in TableView is a highly requested feature. This feature is common in table components. This RFC proposes how to make columns resizable in TableView.

## Motivation

This feature bas been heavily requested by Adobe Analytics Workspace customers. Being able to resize columns is a feature that users expect when they interact with tables. Column resizing also makes the table content more usable because if content is truncated, the user can resize the column so that it's no longer truncated.

## Detailed Design

Column resizing will be added to the TableView. It will involve updates to `TableView`, `TableLayout` and `useTableState`. We will also need to add the following components/hooks:

* Resizer component
* A11y hook to handle resizing behavior
* State hook for column widths

### Props

Individual columns can be set to allow resizing by adding the `allowsResizing` prop to the `<Column>` component. 

The `defaultWidth` prop is used on the `<Column>` component to set the width for uncontrolled column resizing. `defaultWidth` supports pixel values (ex. `defaultWidth=500`), percentage values (ex. `defualtWidth='50%'`) and fractional units like css grid (ex. `defaultWidth='1fr'`).

The `minWidth` and `maxWidth` props are used on the `<Column>` component to define the minimum and maximum allowed column widths respectively. These props support pixel values and percentages.

The `onColumnResize`and `onColumnResizeEnd` props can be added to the `<TableView>` component. `onColumnResize` will call the onResize callback whenever columns are resized by the user, passing in an array of all the columns that were affected by the resize. `onColumnResizeEnd` is the same as `onColumnResize` but only get's called when done resizing.

```
<TableView width={800} onColumnResize={onResize} onColumnResizeEnd={onResizeEnd}>
    <TableHeader>
        <Column allowsResizing defaultWidth={200} minWidth={175}>File Name</Column>
        <Column allowsResizing defaultWidth="1fr" maxWidth={500}>Size</Column>
        <Column allowsResizing defaultWidth="20%">Type</Column>
    </TableHeader>
    ...
</TableView>
```

### Resize Behavior

Code sandbox used to develop the resize alogrithm and test it: https://codesandbox.io/s/column-width-resizer-final-jo4rr?file=/src/column-utils.spec.js

Codepen demo of the resize alogrithm: https://codepen.io/mpeterson/pen/PoJpJvK

Columns get bucketed into two different categories when resizing. These buckets are static columns and dynamic columns. Static columns do not change size unless the user explicitly resizes them. Dynamic columns can change size when columns around them are resized as well as when they are explicitly resized by the user.

Static columns are any column where the `defaultWidth` is set to a pixel value or a percentage. If a user manually resizes a column, this will also convert it to static.

Dynamic columns are any column where the `defaultWidth` is not set or if the `defaultWidth` is set to a fractional unit.

Users can only resize within the bounds of the min and max for that column.

Column limits default to a min of 75 and a max of infinity unless a different value is provided by the dev using `minWidth` and `maxWidth`.

Resizing a column will only affect the dynamic columns that come after that column (to the right in left to right layouts).

### Resize Algorithm

Calculating column widths follows this flow:

1. Static columns are calculated first. Pixel values are straightforward, these are simply checked to see if they should be clamped by a min or max. Percent values are set as a percent of the visible table width (not the total width of all table contents).
2. Dynamic columns are calculated next. With dynamic columns, the amount of space remaining is divided up amongst the remaining columns. If no `defaultWidth` is provided, the column defaults to `1fr`.

### Accessibilty Functionality
* Using arrow keys, users can navigate to the column header
* While the column header is focused, pressing `return/enter` or `space` will activate a dropdown
* One of the options in the dropdown will be to resize the column (if column is resizable)
* User can navigate through the dropdown using arrow keys
* Pressing `return/enter` or `space` on the dropdown item will activate the resize mode, closing the dropdown and focussing the resizer
* When in resize mode, the user can use the left and right arrow keys to adjust the width of the column in increments (10px)
* Pressing `Esc` will exit resize mode and return focus to the column header
* Pressing `Tab` will also exit resize mode and tab out of the table entirely
* If user tries to return focus to the table using `Shift` + `Tab`, the column header will be focussed

## Documentation

Stories will be added to the storybook for column resizing. The react spectrum documentation will also be updated to add the new props and show examples of how to setup column resizing

## Drawbacks

There may be minor performance hits from adding resizing. This adds to the amount of calculation that happens each time the table renders.

The a11y proposal involves changing the default behavior for clicking on a table column header if it is sortable and resizable. Currently clicking on a column header that is sortable will toggle the sort. If it is resizable and sortable, clicking on the column header will activate a dropdown where the user can select to sort or resize. This is an extra click for the end user.

## Backwards Compatibility Analysis

There shouldn't be any breaking changes with this feature addition.

The only change in existing behavior is the change to table header click behavior if something is both sortable and resizable. Currently clicking on a column header that is sortable will toggle the sort. If it is resizable and sortable, clicking on the column header will activate a dropdown where the user can select to sort or resize. This is an extra click for the end user.

## Alternatives

We researched many commonly used tables components to help define the desired behavior for this column resizing feature. Three main examples that we researched were Excel, Marketo Engage and AG Grid.

## Open Questions

Still need to define how a controlled model will work for column resizing.

## Help Needed

<!--
    This section is optional.

    Are you able to implement this RFC on your own? If not, what kind
    of help would you need from the team?
-->

## Frequently Asked Questions

<!--
    This section is optional but suggested.

    Try to anticipate points of clarification that might be needed by
    the people reviewing this RFC. Include those questions and answers
    in this section.
-->

## Related Discussions

<!--
    This section is optional but suggested.

    If there is an issue, pull request, or other URL that provides useful
    context for this proposal, please include those links here.
-->
