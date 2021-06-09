let noGetByRoleToThrow = require('./rules/no-getByRole-toThrow');
let actEventsTest = require('./rules/act-events-test');

const rules = {
  'act-events-test': actEventsTest,
  'no-getByRole-toThrow': noGetByRoleToThrow
};


module.exports = {rules};
