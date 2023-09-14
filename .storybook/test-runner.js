const {configureAxe, checkA11y, injectAxe} = require('axe-playwright');
const {getStoryContext} = require('@storybook/test-runner');


/*
* See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
* to learn more about the test-runner hooks API.
*/
module.exports = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page, context) {
    // Grab accessibility settings from the story itself
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }

    await configureAxe(page, {
      // TODO: Ideally would have a selector target for the storybook's sb main body element
      rules: [
        {
          id: 'aria-hidden-focus',
          selector: 'body *:not([data-a11y-ignore="aria-hidden-focus"])',
        },
        ...(storyContext.parameters?.a11y?.config?.rules ?? [])
      ]
    });

    await checkA11y(page, '#root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};
