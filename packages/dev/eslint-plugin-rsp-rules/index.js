let noGetByRoleToThrow = require('./rules/no-getByRole-toThrow');
let actEventsTest = require('./rules/act-events-test');
let actRunTimers = require('./rules/act-run-timers');

const rules = {
  'act-events-test': actEventsTest,
  'no-getByRole-toThrow': noGetByRoleToThrow,
  'act-run-timers': actRunTimers
};


module.exports = {rules};
