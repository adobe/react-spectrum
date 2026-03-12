const {Worker: NodeWorker} = require('worker_threads');

module.exports = async () => {
  global.__SSR_SERVER__ = new NodeWorker(__dirname + '/ssrWorker.js');
};
