# Grid

A set of container components that follow the [Spectrum Grid specs](https://www.dropbox.com/s/1gk90i7s9s01tva/Sp_ResponsiveGrid_2017Q2.xd?dl=0). These components utilize the CSS defined in the [Spectrum FlexBox Grid](https://git.corp.adobe.com/Spectrum/spectrum-flexbox-grid) project.

## Introduction

At a high level, the Spectrum grid system provides 12 columns which components and containers can align themselves to. So, let’s say you have a list which you want to be 1/3 of the screen and a details pane which should be 2/3s of the screen. You would have the list span 4 of the 12 columns and the details pane span 8.

Now, on mobile devices, you may want the list to appear on top of the details, so you would set the list to 12 columns and the details to 12 columns.

## Responsive
I am proposing a data structure called `Responsive` that allows us to define properties for the various different viewport widths.

A property that is `Responsive` defines values for the following sizes:

| Size | Viewport Width |
| ---- | --------------:|
| xs   |       < 768 px |
| s    |      < 1280 px |
| m    |      < 1768 px |
| l    |      < 2160 px |
| xl   |     >= 2160 px |

A property that is Responsive can be an object, an array, or a value.

Let’s use the column size example for the following:

**Object:**
```
<GridColumn size={{ xs: 12, s: 10, m: 8, l: 4: xl: 2 }} />
```
_Here we’ve defined the number of columns for all five spectrum viewports sizes_

**Array:**
```
<GridColumn size={[12, 10, 8, 4, 2]} />
```
_This provides identical results as the object definition above_

**Value:**
```
<GridColumn size={10} />
```
_The container always spans 10 columns_


## Components

### Grid

Defines a grid. A grid can be composed of many `GridRows`.

**Properties:**

| Property        | Description           | Values  |
| ------------- |-------------| -----|
| variant | defines whether or not the table should have a margin. | can be either fluid (no margins) or fixed. Default fluid |

**Example:**

```
<Grid variant='fixed'>
...
</Grid>
```
_Fixed Grid_

### GridRow

A new row within our grid. This acts as a break point, causing the next `GridColumn` to start at column 1 again.

**Properties:**

| Property        | Description           | Values  |
| ------------- |-------------| -----|
| align | Aligns all child containers horizontally | Responsive. Possible values are ’start’, ‘center’, ‘end’. Not set if not provided.
| valign | Aligns all child containers vertically | Responsive. Possible values are ’top’, ‘middle’, ‘bottom'. Not set if not provided.
distribution | Defines where the extra space around containers should go. | Responsive. Possible values are ‘around’ and ‘between'. Not set if not provided.
| reverse | Orders all of this rows children in reverse order | Responsive. Possible values are booleans.

**Example:**

```
<GridRow align='start' valign='top'>
   ...
</GridRow>
```
_GridRow with top-left alignment_


### GridColumn

Defines a layout region within a grid. `GridColumns` can span multiple columns within the grid.

**Properties:**

| Property        | Description           | Values  |
| ------------- |-------------| -----|
| size | The number of grid columns the container should span | Responsive. Possible values are numbers or the string ‘auto’. Default is auto. If using an object or array, any missing fields will default to auto. 
| offset | Offsets the container by a number of columns | Responsive. Possible values are numbers between 1 & 12. 
| first | Makes a container appear first in its row. | Responsive. Possible values are booleans. 
| last | Makes a container appear last in its row. | Responsive. Possible values are booleans. 

**Examples:**

```
  <GridColumn>
  ...
  </GridColumn>
```
`Auto size the grid column`

```
  <GridColumn size={[12, 10, 8, 4, 2]}>
  ...
  </GridColumn>
```
`Column spans 12 cols when xs, 10 cols when s, 8 cols when m, 4 cols when l, and 2 cols when xl`

```
  <GridColumn offset={3} size={3}>
  ...
  </GridColumn>
```
`Column skips 3 columns and then spans 3 columns`