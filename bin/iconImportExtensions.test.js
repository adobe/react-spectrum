
const rule = require('./iconImportExtensions'),
  RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2015
  }
});

ruleTester.run('iconImportExtensions', rule, {
  valid: [
    {
      code: "import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium.js';"
    }
  ],

  invalid: [
    {
      code: "import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium';",
      errors: [{
        message: 'Icons must use cjs ".js" file extension in an import.'
      }],
      output: "import ChevronDownMedium from '@spectrum-icons/ui/ChevronDownMedium.js';"
    }
  ]
});
