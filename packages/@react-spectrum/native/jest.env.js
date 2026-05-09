/* eslint-disable no-undef */
global.IS_REACT_ACT_ENVIRONMENT = true;
global.IS_REACT_NATIVE_TEST_ENVIRONMENT = true;
global.__DEV__ = true;
global.nativeFabricUIManager = {};
if (typeof global.performance === 'undefined') {
  global.performance = {now: Date.now};
}
