let obj = {};
let handler = {
  get: () => {
    return () => {};
  },
  toString: () => ''
};
let proxy = new Proxy(obj, handler);
module.exports = proxy;
