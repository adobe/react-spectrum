const { injectAxe, checkA11y, configureAxe } = require('axe-playwright');

/*
* See https://storybook.js.org/docs/react/writing-tests/test-runner#test-hook-api-experimental
* to learn more about the test-runner hooks API.
*/
module.exports = {
  async preRender(page) {
    await injectAxe(page);
  },
  async postRender(page, context) {

    // This can properly target a selector pattern to run the rule on when running the tests but
    // for some reason it causes a bunch of elements to fail even though they aren't aria hidden...
    // try a different selector?
    // await configureAxe(page, {
    //   rules: [
    //     {
    //       id: 'aria-hidden-focus',
    //       // selector: '*:not(#blah)'
    //       selector: 'span'
    //     }
    //   ]
    // })


    const disabledRulesForStory = () => {
      switch (context.title) {
        case "Picker":
          return {
            'aria-hidden-focus': {enabled: false}
          }

        default:
          return {}
      }
    }



    await checkA11y(page, '#root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {
        rules: {
          // The below disables aria-hidden-focus run for the Picker story tests properly but
          // can't use the selector strategy... This feels overly broad
          // 'aria-hidden-focus': {enabled: false}
          ...disabledRulesForStory()
        }
      }
    });
  },
};
