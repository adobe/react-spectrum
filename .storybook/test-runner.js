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
      rules: storyContext.parameters?.a11y?.config?.rules,
    });

    await checkA11y(page, '#root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: storyContext.parameters?.a11y?.options,
    });

    // This can properly target a selector pattern to run the rule on when running the tests but
    // for some reason it causes a bunch of elements to fail even though they aren't aria hidden...
    // try a different selector?
    // await configureAxe(page, {
    //   rules: [
    //     {
    //       id: 'aria-hidden-focus',
    //       // selector: '*:not(#blah)'
    //       // selector: '.react-spectrum-story *:not(#blah)'
    //     }
    //   ]
    // })


    // const disabledRulesForStory = () => {
    //   switch (context.title) {
    //     case "Picker":
    //       return {
    //         'aria-hidden-focus': {enabled: false}
    //       }

    //     default:
    //       return {}
    //   }
    // }



    // await checkA11y(page, '#root', {
    //   detailedReport: true,
    //   detailedReportOptions: {
    //     html: true,
    //   },
    //   axeOptions: {
    //     rules: {
    //       // The below disables aria-hidden-focus run for the Picker story tests properly but
    //       // can't use the selector strategy... This feels overly broad
    //       // 'aria-hidden-focus': {enabled: false}
    //       ...disabledRulesForStory()
    //     }
    //   }
    // });
  },
};
