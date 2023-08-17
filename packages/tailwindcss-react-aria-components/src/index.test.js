const path = require('path');
const tailwind = require('tailwindcss');
const postcss = require('postcss');
const racPlugin = require('./index.js');

let html = String.raw;
let css = String.raw;

function run() {
  let {currentTestName} = expect.getState();
  let config = {
    plugins: [racPlugin],
    corePlugins: {preflight: false},
    theme: {colors: {red: 'red'}},
    content: [{raw: html`<div className="hovered:bg-red focused:bg-red focus-visible:bg-red pressed:bg-red disabled:bg-red drop-target:bg-red dragging:bg-red empty:bg-red allows-removing:bg-red allows-sorting:bg-red placeholder:bg-red selected:bg-red indeterminate:bg-red readonly:bg-red required:bg-red entering:bg-red exiting:bg-red open:bg-red unavailable:bg-red current:bg-red invalid:bg-red validation-state-invalid:bg-red validation-state-valid:bg-red placement-left:bg-red placement-right:bg-red placement-top:bg-red placement-bottom:bg-red type-literal:bg-red type-year:bg-red type-month:bg-red type-day:bg-red layout-grid:bg-red layout-stack:bg-red orientation-horizontal:bg-red orientation-vertical:bg-red "></div>`}]
  };

  return postcss(tailwind(config)).process(
    ['@tailwind base;', '@tailwind components;', '@tailwind utilities'].join('\n'),
    {
      from: `${path.resolve(__filename)}?test=${currentTestName}`
    }
  );
}

test('variants', async () => {
  return run().then((result) => {
    expect(result.css).toContain(css`
.hovered\:bg-red[data-hovered] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focused\:bg-red[data-focused] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-visible\:bg-red[data-focus-visible] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.pressed\:bg-red[data-pressed] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.disabled\:bg-red[data-disabled] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.drop-target\:bg-red[data-drop-target] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.dragging\:bg-red[data-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.empty\:bg-red[data-empty] {
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
.placeholder\:bg-red[data-placeholder] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.selected\:bg-red[data-selected] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.indeterminate\:bg-red[data-indeterminate] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.readonly\:bg-red[data-readonly] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.required\:bg-red[data-required] {
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
.open\:bg-red[data-open] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.unavailable\:bg-red[data-unavailable] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.current\:bg-red[data-current] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.invalid\:bg-red[data-invalid] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.validation-state-invalid\:bg-red[data-validation-state]="invalid" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.validation-state-valid\:bg-red[data-validation-state]="valid" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-left\:bg-red[data-placement]="left" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-right\:bg-red[data-placement]="right" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-top\:bg-red[data-placement]="top" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.placement-bottom\:bg-red[data-placement]="bottom" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-literal\:bg-red[data-type]="literal" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-year\:bg-red[data-type]="year" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-month\:bg-red[data-type]="month" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.type-day\:bg-red[data-type]="day" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.layout-grid\:bg-red[data-layout]="grid" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.layout-stack\:bg-red[data-layout]="stack" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.orientation-horizontal\:bg-red[data-orientation]="horizontal" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.orientation-vertical\:bg-red[data-orientation]="vertical" {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}`
    );
  });
});
