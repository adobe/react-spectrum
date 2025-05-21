"use strict";

var Refresh = require('react-refresh/runtime');
function debounce(func, delay) {
  if (process.env.NODE_ENV === 'test') {
    return function (args) {
      func.call(null, args);
    };
  } else {
    let timeout = undefined;
    let lastTime = 0;
    return function (args) {
      // Call immediately if last call was more than the delay ago.
      // Otherwise, set a timeout. This means the first call is fast
      // (for the common case of a single update), and subsequent updates
      // are batched.
      let now = Date.now();
      if (now - lastTime > delay) {
        lastTime = now;
        func.call(null, args);
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          timeout = undefined;
          lastTime = Date.now();
          func.call(null, args);
        }, delay);
      }
    };
  }
}
var enqueueUpdate = debounce(function () {
  Refresh.performReactRefresh();
}, 30);

// Everything below is either adapted or copied from
// https://github.com/facebook/metro/blob/61de16bd1edd7e738dd0311c89555a644023ab2d/packages/metro/src/lib/polyfills/require.js
// MIT License - Copyright (c) Facebook, Inc. and its affiliates.

module.exports.prelude = function (module) {
  window.$RefreshReg$ = function (type, id) {
    Refresh.register(type, module.id + ' ' + id);
  };
  window.$RefreshSig$ = Refresh.createSignatureFunctionForTransform;
};
module.exports.postlude = function (module) {
  registerExportsForReactRefresh(module);
  if (module.hot) {
    module.hot.dispose(function (data) {
      if (Refresh.hasUnrecoverableErrors()) {
        window.location.reload();
      }
      data.prevExports = module.exports;
    });
    module.hot.accept(function (getParents) {
      var prevExports = module.hot.data.prevExports;
      var nextExports = module.exports;
      // It can also become ineligible if its exports are incompatible
      // with the previous exports.
      // For example, if you add/remove/change exports, we'll want
      // to re-execute the importing modules, and force those components
      // to re-render. Similarly, if you convert a class component
      // to a function, we want to invalidate the boundary.
      var didInvalidate = shouldInvalidateReactRefreshBoundary(prevExports, nextExports);
      if (didInvalidate) {
        // We'll be conservative. The only case in which we won't do a full
        // reload is if all parent modules are also refresh boundaries.
        // In that case we'll add them to the current queue.
        var parents = getParents();
        if (parents.length === 0) {
          // Looks like we bubbled to the root. Can't recover from that.
          window.location.reload();
          return;
        }
        return parents;
      }
      enqueueUpdate();
    });
  }
};

function shouldInvalidateReactRefreshBoundary(prevExports, nextExports) {
  var prevSignature = getRefreshBoundarySignature(prevExports);
  var nextSignature = getRefreshBoundarySignature(nextExports);
  if (prevSignature.length !== nextSignature.length) {
    return true;
  }
  for (var i = 0; i < nextSignature.length; i++) {
    if (prevSignature[i] !== nextSignature[i]) {
      return true;
    }
  }
  return false;
}

// When this signature changes, it's unsafe to stop at this refresh boundary.
function getRefreshBoundarySignature(exports) {
  let signature = [];
  if (exports.default) {
    // Full reload if story meta object changes.
    signature.push(exports.default._hash);
  }

  let isESM = ('__esModule' in exports);
  for (let key in exports) {
    if (key === '__esModule' || key === 'default') {
      continue;
    }
    let desc = Object.getOwnPropertyDescriptor(exports, key);
    if (desc && desc.get && !isESM) {
      // Don't invoke getters for CJS as they may have side effects.
      continue;
    }
    let exportValue = exports[key];
    let hash = exportValue?._hash;
    if (exportValue && exportValue._internalComponent) {
      exportValue = exportValue._internalComponent;
    }
    signature.push(key);
    signature.push(Refresh.getFamilyByType(exportValue));
    signature.push(hash);
  }
  return signature;
}
function registerExportsForReactRefresh(module) {
  var exports = module.exports,
    id = module.id;
  if (exports == null || typeof exports !== 'object') {
    // Exit if we can't iterate over exports.
    // (This is important for legacy environments.)
    return;
  }
  let isESM = ('__esModule' in exports);
  for (var key in exports) {
    var desc = Object.getOwnPropertyDescriptor(exports, key);
    if (desc && desc.get && !isESM) {
      // Don't invoke getters for CJS as they may have side effects.
      continue;
    }
    if (key === 'default') {
      continue;
    }
    var exportValue = exports[key];
    if (exportValue && exportValue._internalComponent) {
      exportValue = exportValue._internalComponent;
    }
    var typeID = id + ' %exports% ' + key;
    Refresh.register(exportValue, typeID);
  }
}
