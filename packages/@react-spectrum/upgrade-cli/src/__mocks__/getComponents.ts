'use strict';
// added mock so we can test all of our components regardless of release status
exports.getComponents = () => {
  let result = jest.requireActual('../getComponents').getComponents();
  return result;
};
