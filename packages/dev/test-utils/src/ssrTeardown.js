// teardown.js
module.exports = async function () {
  global.__SSR_SERVER__.terminate();
};
