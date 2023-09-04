const path = require('path');
const tailwind = require('tailwindcss');
const postcss = require('postcss');

let html = String.raw;
let css = String.raw;

function run({options, content}) {
  let {currentTestName} = expect.getState();
  let config = {
    plugins: [require('./index.js')(options)],
    corePlugins: {preflight: false},
    theme: {colors: {red: 'red'}},
    content: [{raw: content}]
  };

  return postcss(tailwind(config)).process(
    ['@tailwind base;', '@tailwind components;', '@tailwind utilities'].join('\n'),
    {
      from: `${path.resolve(__filename)}?test=${currentTestName}`
    }
  );
}

test('variants', async () => {
  let content = html`<div data-rac className="hover:bg-red focus:bg-red focus-visible:bg-red pressed:bg-red disabled:bg-red drop-target:bg-red dragging:bg-red empty:bg-red allows-removing:bg-red allows-sorting:bg-red placeholder:bg-red selected:bg-red indeterminate:bg-red readonly:bg-red required:bg-red entering:bg-red exiting:bg-red open:bg-red unavailable:bg-red current:bg-red invalid:bg-red placement-left:bg-red placement-right:bg-red placement-top:bg-red placement-bottom:bg-red type-literal:bg-red type-year:bg-red type-month:bg-red type-day:bg-red layout-grid:bg-red layout-stack:bg-red orientation-horizontal:bg-red orientation-vertical:bg-red"></div>`;
  return run({content}).then((result) => {
    expect(result.css).toContain(css`
.hover\:bg-red:is([data-rac][data-hovered], :not([data-rac]):hover) {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus\:bg-red:is([data-rac][data-focused], :not([data-rac]):focus) {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.focus-visible\:bg-red:is([data-rac][data-focus-visible], :not([data-rac]):focus-visible) {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.pressed\:bg-red[data-pressed] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.disabled\:bg-red:is([data-rac][data-disabled], :not([data-rac]):disabled) {
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
.empty\:bg-red:is([data-rac][data-empty], :not([data-rac]):empty) {
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
.indeterminate\:bg-red:is([data-rac][data-indeterminate], :not([data-rac]):indeterminate) {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.readonly\:bg-red[data-readonly] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.required\:bg-red:is([data-rac][data-required], :not([data-rac]):required) {
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
.open\:bg-red:is([data-rac][data-open], :not([data-rac])[open]) {
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
.invalid\:bg-red:is([data-rac][data-invalid], :not([data-rac]):invalid) {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
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
}`
    );
  });
});

test('variants with prefix', async () => {
  let content = html`<div data-rac className="rac-hover:bg-red rac-focus:bg-red rac-focus-visible:bg-red rac-pressed:bg-red rac-disabled:bg-red rac-drop-target:bg-red rac-dragging:bg-red rac-empty:bg-red rac-allows-removing:bg-red rac-allows-sorting:bg-red rac-placeholder:bg-red rac-selected:bg-red rac-indeterminate:bg-red rac-readonly:bg-red rac-required:bg-red rac-entering:bg-red rac-exiting:bg-red rac-open:bg-red rac-unavailable:bg-red rac-current:bg-red rac-invalid:bg-red rac-placement-left:bg-red rac-placement-right:bg-red rac-placement-top:bg-red rac-placement-bottom:bg-red rac-type-literal:bg-red rac-type-year:bg-red rac-type-month:bg-red rac-type-day:bg-red rac-layout-grid:bg-red rac-layout-stack:bg-red rac-orientation-horizontal:bg-red rac-orientation-vertical:bg-red"></div>`;
  return run({content, options: {prefix: 'rac'}}).then((result) => {
    expect(result.css).toContain(css`
.rac-hover\:bg-red[data-hovered] {
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
.rac-disabled\:bg-red[data-disabled] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-drop-target\:bg-red[data-drop-target] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-dragging\:bg-red[data-dragging] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-empty\:bg-red[data-empty] {
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
.rac-placeholder\:bg-red[data-placeholder] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-selected\:bg-red[data-selected] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-indeterminate\:bg-red[data-indeterminate] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-readonly\:bg-red[data-readonly] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-required\:bg-red[data-required] {
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
.rac-open\:bg-red[data-open] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-unavailable\:bg-red[data-unavailable] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-current\:bg-red[data-current] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
.rac-invalid\:bg-red[data-invalid] {
    --tw-bg-opacity: 1;
    background-color: rgb(255 0 0 / var(--tw-bg-opacity))
}
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
}`
    );
  });
});
