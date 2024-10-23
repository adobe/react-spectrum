const path = require('path');
const tailwind = require('tailwindcss');
const postcss = require('postcss');

let html = String.raw;
let css = String.raw;

function run({options, content, future = {}}) {
  let {currentTestName} = expect.getState();
  let config = {
    plugins: [require('./index.js')(options)],
    corePlugins: {preflight: false},
    theme: {colors: {red: 'red'}},
    content: [{raw: content}],
    future
  };
    
  return postcss(tailwind(config)).process(
        ['@tailwind base;', '@tailwind components;', '@tailwind utilities'].join('\n'),
    {
      from: `${path.resolve(__filename)}?test=${currentTestName}`
    }
    );
}

test('variants', async () => {
  let content = html`<div data-rac className="hover:bg-red focus:bg-red focus-visible:bg-red focus-within:bg-red pressed:bg-red disabled:bg-red drop-target:bg-red dragging:bg-red empty:bg-red allows-dragging:bg-red allows-removing:bg-red allows-sorting:bg-red has-submenu:bg-red placeholder-shown:bg-red selected:bg-red indeterminate:bg-red read-only:bg-red required:bg-red entering:bg-red exiting:bg-red open:bg-red expanded:bg-red unavailable:bg-red outside-month:bg-red outside-visible-range:bg-red selection-start:bg-red selection-end:bg-red current:bg-red invalid:bg-red resizing:bg-red placement-left:bg-red placement-right:bg-red placement-top:bg-red placement-bottom:bg-red type-literal:bg-red type-year:bg-red type-month:bg-red type-day:bg-red layout-grid:bg-red layout-stack:bg-red orientation-horizontal:bg-red orientation-vertical:bg-red selection-single:bg-red selection-multiple:bg-red resizable-right:bg-red resizable-left:bg-red resizable-both:bg-red sort-ascending:bg-red sort-descending:bg-red group-pressed:bg-red peer-pressed:bg-red group-hover:bg-red group/custom-name group-hover/custom-name:bg-red peer-pressed/custom-name:bg-red"></div>`;
  return run({content}).then((result) => {
    expect(result.css).toContain(css`
.placement-left\:bg-red[data-placement="left"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-right\:bg-red[data-placement="right"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-top\:bg-red[data-placement="top"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-bottom\:bg-red[data-placement="bottom"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-literal\:bg-red[data-type="literal"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-year\:bg-red[data-type="year"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-month\:bg-red[data-type="month"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-day\:bg-red[data-type="day"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.layout-grid\:bg-red[data-layout="grid"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.layout-stack\:bg-red[data-layout="stack"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.orientation-horizontal\:bg-red[data-orientation="horizontal"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.orientation-vertical\:bg-red[data-orientation="vertical"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selection-single\:bg-red[data-selection-mode="single"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selection-multiple\:bg-red[data-selection-mode="multiple"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.resizable-right\:bg-red[data-resizable-direction="right"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.resizable-left\:bg-red[data-resizable-direction="left"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.resizable-both\:bg-red[data-resizable-direction="both"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.sort-ascending\:bg-red[data-sort-direction="ascending"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.sort-descending\:bg-red[data-sort-direction="descending"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.allows-removing\:bg-red[data-allows-removing] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.allows-sorting\:bg-red[data-allows-sorting] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.allows-dragging\:bg-red[data-allows-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.has-submenu\:bg-red[data-has-submenu] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.open\:bg-red:where([data-rac])[data-open] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.open\:bg-red:where(:not([data-rac]))[open] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.expanded\:bg-red:where([data-rac])[data-expanded] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.expanded\:bg-red:where(:not([data-rac]))[expanded] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.entering\:bg-red[data-entering] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.exiting\:bg-red[data-exiting] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.indeterminate\:bg-red:where([data-rac])[data-indeterminate] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.indeterminate\:bg-red:where(:not([data-rac])):indeterminate {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placeholder-shown\:bg-red[data-placeholder] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placeholder-shown\:bg-red:placeholder-shown {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.current\:bg-red[data-current] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.required\:bg-red:where([data-rac])[data-required] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.required\:bg-red:where(:not([data-rac])):required {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.unavailable\:bg-red[data-unavailable] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.invalid\:bg-red:where([data-rac])[data-invalid] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.invalid\:bg-red:where(:not([data-rac])):invalid {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.read-only\:bg-red:where([data-rac])[data-readonly] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.read-only\:bg-red:where(:not([data-rac])):read-only {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.outside-month\:bg-red[data-outside-month] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.outside-visible-range\:bg-red[data-outside-visible-range] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.empty\:bg-red:where([data-rac])[data-empty] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.empty\:bg-red:where(:not([data-rac])):empty {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-within\:bg-red:where([data-rac])[data-focus-within] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-within\:bg-red:where(:not([data-rac])):focus-within {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.hover\:bg-red:where([data-rac])[data-hovered] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.hover\:bg-red:where(:not([data-rac])):hover {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group\/custom-name:where([data-rac])[data-hovered] .group-hover\/custom-name\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group:where([data-rac])[data-hovered] .group-hover\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group\/custom-name:where(:not([data-rac])):hover .group-hover\/custom-name\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group:where(:not([data-rac])):hover .group-hover\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus\:bg-red:where([data-rac])[data-focused] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus\:bg-red:where(:not([data-rac])):focus {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-visible\:bg-red:where([data-rac])[data-focus-visible] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-visible\:bg-red:where(:not([data-rac])):focus-visible {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.pressed\:bg-red[data-pressed] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group[data-pressed] .group-pressed\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.peer\/custom-name[data-pressed] ~ .peer-pressed\/custom-name\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.peer[data-pressed] ~ .peer-pressed\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selected\:bg-red[data-selected] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selection-start\:bg-red[data-selection-start] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selection-end\:bg-red[data-selection-end] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.dragging\:bg-red[data-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.drop-target\:bg-red[data-drop-target] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.resizing\:bg-red[data-resizing] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.disabled\:bg-red:where([data-rac])[data-disabled] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.disabled\:bg-red:where(:not([data-rac])):disabled {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}`
        );
  });
});

test('variants with prefix', async () => {
  let content = html`<div data-rac className="rac-hover:bg-red rac-focus:bg-red rac-focus-visible:bg-red rac-focus-within:bg-red rac-pressed:bg-red rac-disabled:bg-red rac-drop-target:bg-red rac-dragging:bg-red rac-empty:bg-red rac-allows-dragging:bg-red rac-allows-removing:bg-red rac-allows-sorting:bg-red rac-has-submenu:bg-red rac-placeholder-shown:bg-red rac-selected:bg-red rac-indeterminate:bg-red rac-read-only:bg-red rac-required:bg-red rac-entering:bg-red rac-exiting:bg-red rac-open:bg-red rac-expanded:bg-red rac-unavailable:bg-red rac-outside-month:bg-red rac-outside-visible-range:bg-red rac-selection-start:bg-red rac-selection-end:bg-red rac-current:bg-red rac-invalid:bg-red rac-resizing:bg-red rac-placement-left:bg-red rac-placement-right:bg-red rac-placement-top:bg-red rac-placement-bottom:bg-red rac-type-literal:bg-red rac-type-year:bg-red rac-type-month:bg-red rac-type-day:bg-red rac-layout-grid:bg-red rac-layout-stack:bg-red rac-orientation-horizontal:bg-red rac-orientation-vertical:bg-red rac-selection-single:bg-red rac-selection-multiple:bg-red rac-resizable-right:bg-red rac-resizable-left:bg-red rac-resizable-both:bg-red rac-sort-ascending:bg-red rac-sort-descending:bg-red group-rac-pressed:bg-red group/custom-name group-rac-hover/custom-name:bg-red peer-rac-pressed:bg-red peer-rac-pressed/custom-name:bg-red"></div>`;
  return run({content, options: {prefix: 'rac'}}).then((result) => {
    expect(result.css).toContain(css`
.rac-placement-left\:bg-red[data-placement="left"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-placement-right\:bg-red[data-placement="right"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-placement-top\:bg-red[data-placement="top"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-placement-bottom\:bg-red[data-placement="bottom"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-type-literal\:bg-red[data-type="literal"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-type-year\:bg-red[data-type="year"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-type-month\:bg-red[data-type="month"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-type-day\:bg-red[data-type="day"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-layout-grid\:bg-red[data-layout="grid"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-layout-stack\:bg-red[data-layout="stack"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-orientation-horizontal\:bg-red[data-orientation="horizontal"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-orientation-vertical\:bg-red[data-orientation="vertical"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selection-single\:bg-red[data-selection-mode="single"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selection-multiple\:bg-red[data-selection-mode="multiple"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-resizable-right\:bg-red[data-resizable-direction="right"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-resizable-left\:bg-red[data-resizable-direction="left"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-resizable-both\:bg-red[data-resizable-direction="both"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-sort-ascending\:bg-red[data-sort-direction="ascending"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-sort-descending\:bg-red[data-sort-direction="descending"] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-allows-removing\:bg-red[data-allows-removing] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-allows-sorting\:bg-red[data-allows-sorting] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-allows-dragging\:bg-red[data-allows-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-has-submenu\:bg-red[data-has-submenu] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-open\:bg-red[data-open] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-expanded\:bg-red[data-expanded] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-entering\:bg-red[data-entering] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-exiting\:bg-red[data-exiting] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-indeterminate\:bg-red[data-indeterminate] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-placeholder-shown\:bg-red[data-placeholder] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-current\:bg-red[data-current] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-required\:bg-red[data-required] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-unavailable\:bg-red[data-unavailable] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-invalid\:bg-red[data-invalid] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-read-only\:bg-red[data-readonly] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-outside-month\:bg-red[data-outside-month] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-outside-visible-range\:bg-red[data-outside-visible-range] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-empty\:bg-red[data-empty] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-focus-within\:bg-red[data-focus-within] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-hover\:bg-red[data-hovered] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group\/custom-name[data-hovered] .group-rac-hover\/custom-name\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-focus\:bg-red[data-focused] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-focus-visible\:bg-red[data-focus-visible] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-pressed\:bg-red[data-pressed] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.group[data-pressed] .group-rac-pressed\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.peer\/custom-name[data-pressed] ~ .peer-rac-pressed\/custom-name\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.peer[data-pressed] ~ .peer-rac-pressed\:bg-red {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selected\:bg-red[data-selected] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selection-start\:bg-red[data-selection-start] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selection-end\:bg-red[data-selection-end] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-dragging\:bg-red[data-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-drop-target\:bg-red[data-drop-target] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-resizing\:bg-red[data-resizing] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-disabled\:bg-red[data-disabled] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}`
        );
  });
});

test('hoverOnlyWhenSupported', () => {
  let content = html`<div data-rac className="hover:bg-red"></div>`;
  return run({content, future: {hoverOnlyWhenSupported: true}}).then((result) => {
    expect(result.css).toContain(css`
.hover\:bg-red:where([data-rac])[data-hovered] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
@media (hover: hover) and (pointer: fine) {
    .hover\:bg-red:where(:not([data-rac])):hover {
        --tw-bg-opacity: 1;
        background-color: rgb(255 0 0 / var(--tw-bg-opacity))
    }
}`);
  });
});
    
