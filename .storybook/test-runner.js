const { injectAxe, checkA11y } = require('axe-playwright');

/*
* See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
* to learn more about the test-runner hooks API.
*/
module.exports = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page) {
    await checkA11y(page, '#root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  },
};
