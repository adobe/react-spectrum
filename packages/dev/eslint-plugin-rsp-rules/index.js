let noGetByRoleToThrow = require('./rules/no-getByRole-toThrow');
let actEventsTest = require('./rules/act-events-test');
let noReactKey = require('./rules/no-react-key');
let sortImports = require('./rules/sort-imports');

const rules = {
  'act-events-test': actEventsTest,
  'no-getByRole-toThrow': noGetByRoleToThrow,
  'no-react-key': noReactKey,
  'sort-imports': sortImports
};


module.exports = {rules};
