const path = require('path');
const tailwind = require('@tailwindcss/postcss');
const postcss = require('postcss');

let css = String.raw;

// jest doesn't have this in its environment?
global.structuredClone = a => JSON.parse(JSON.stringify(a));

function run(content) {
  let {currentTestName} = expect.getState();
  return postcss(tailwind()).process(
    content,
    {
      from: `${path.resolve(__filename)}?test=${currentTestName}`
    }
  );
}

test('variants', async () => {
  let result = await run(css`
@import "tailwindcss/utilities.css" source(none);
@source "../fixtures/variants.html";
@plugin "tailwindcss-react-aria-components";
@theme {
  --color-red: red
}
`);
  expect(result.css).toMatchSnapshot();
});

test('variants with prefix', async () => {
  let result = await run(css`
@import "tailwindcss/utilities.css" source(none);
@source "../fixtures/prefix.html";
@plugin "tailwindcss-react-aria-components" {
  prefix: rac;
}
@theme {
  --color-red: red
}
`);
  expect(result.css).toMatchSnapshot();
});
