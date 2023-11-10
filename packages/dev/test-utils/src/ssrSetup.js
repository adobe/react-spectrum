const {Worker} = require('worker_threads');

module.exports = async () => {
  global.__SSR_SERVER__ = new Worker(__dirname + '/ssrWorker.js');
};
