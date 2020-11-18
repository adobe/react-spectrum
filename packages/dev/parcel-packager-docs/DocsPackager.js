/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {Packager} = require('@parcel/plugin');
const v8 = require('v8');

module.exports = new Packager({
  async package({bundle, bundleGraph, options}) {
    let promises = [];
    bundle.traverseAssets(asset => {
      promises.push(parse(asset));
    });

    let nodes = {};

    let code = new Map(await Promise.all(promises));
    let cache = new Map();
    try {
      var result = processAsset(bundle.getEntryAssets()[0]);
    } catch (err) {
      console.log(err.stack);
    }

    function processAsset(asset) {
      if (cache.has(asset.id)) {
        return cache.get(asset.id);
      }

      let res = {};
      cache.set(asset.id, res);
      _processAsset(asset, res);
      return res;
    }

    function _processAsset(asset, res) {
      let obj = processCode(asset, code.get(asset.id));
      for (let [exported] of asset.symbols) {
        let {asset: resolvedAsset, exportSymbol} = bundleGraph.resolveSymbol(asset, exported);
        let processed = resolvedAsset.id === asset.id ? obj : processAsset(resolvedAsset);
        if (exportSymbol === '*') {
          Object.assign(res, processed);
        } else {
          res[exported] = processed[exportSymbol];
        }
      }

      let deps = bundleGraph.getDependencies(asset);
      for (let dep of deps) {
        let wildcard = dep.symbols.get('*');
        if (wildcard && wildcard.local === '*') {
          let resolved = bundleGraph.getDependencyResolution(dep, bundle);
          Object.assign(res, processAsset(resolved));
        }
      }
    }

    function processCode(asset, obj) {
      let application;
      let paramStack = [];
      let keyStack = [];
      return walk(obj, (t, k, recurse) => {
        if (t && t.type === 'reference') {
          let dep = bundleGraph.getDependencies(asset).find(d => d.moduleSpecifier === t.specifier);
          let res = bundleGraph.getDependencyResolution(dep, bundle);
          let result = res ? processAsset(res)[t.imported] : null;
          if (result) {
            t = result;
          } else {
            return {
              type: 'identifier',
              name: t.local
            };
          }
        }

        if (t && t.type === 'application') {
          application = recurse(t.typeParameters);
        }

        let hasParams = false;
        if (t && (t.type === 'alias' || t.type === 'interface') && t.typeParameters && application) {
          let params = Object.assign({}, paramStack[paramStack.length - 1]);
          t.typeParameters.forEach((p, i) => {
            let v = application[i] || p.default;
            params[p.name] = v;
          });

          paramStack.push(params);
          hasParams = true;
        }

        keyStack.push(k);
        t = recurse(t);
        keyStack.pop();

        if (hasParams) {
          paramStack.pop();
        }

        let params = paramStack[paramStack.length - 1];
        if (t && t.type === 'application') {
          application = null;
          if (t.base && t.base.type !== 'identifier' && t.base.type !== 'link') {
            return t.base;
          }
        }

        if (t && t.type === 'identifier' && t.name === 'Omit' && application) {
          return omit(application[0], application[1]);
        }

        if (t && t.type === 'identifier' && params && params[t.name]) {
          return params[t.name];
        }

        if (t && t.type === 'interface') {
          let merged = mergeInterface(t);
          if (!nodes[t.id]) {
            nodes[t.id] = merged;
          }

          // Return merged interface if the parent is a component or an interface we're extending.
          if (!k || k === 'props' || k === 'extends') {
            return merged;
          }

          // If the key is "base", then it came from a generic type application, so we need to
          // check one level above. If that was a component or extended interface, return the
          // merged interface.
          let lastKey = keyStack[keyStack.length - 1];
          if (k === 'base' && (lastKey === 'props' || lastKey === 'extends')) {
            return merged;
          }

          // Otherwise return a type link.
          return {
            type: 'link',
            id: t.id
          };
        }

        if (t && t.type === 'alias') {
          let lastKey = keyStack[keyStack.length - 1];
          if (k === 'base' && (lastKey === 'props' || lastKey === 'extends')) {
            return t.value;
          }

          if (!nodes[t.id]) {
            nodes[t.id] = t;
          }

          return {
            type: 'link',
            id: t.id
          };
        }

        return t;
      });
    }

    let links = {};
    walkLinks(result);

    function walkLinks(obj) {
      walk(obj, (t, k, recurse) => {
        // don't follow the link if it's already in links, that's circular
        if (t && t.type === 'link' && !links[t.id]) {
          links[t.id] = nodes[t.id];
          walkLinks(nodes[t.id]);
        }

        return recurse(t);
      });
    }

    return {contents: JSON.stringify({exports: result, links}, false, 2)};
  }
});

async function parse(asset) {
  let buffer = await asset.getBuffer();
  return [asset.id, v8.deserialize(buffer)];
}
// cache things in pre-visit order so the references exist
function walk(obj, fn) {
  // cache so we don't recompute
  let cache = new Map();
  // circular is to make sure we don't traverse over an object we visited earlier in the recursion
  let circular = new Set();

  let visit = (obj, fn, k = null) => {
    let recurse = (obj) => {
      if (circular.has(obj)) {
        return {
          type: 'link',
          id: obj.id
        };
      }
      if (cache.has(obj)) {
        return cache.get(obj);
      }
      if (Array.isArray(obj)) {
        let resultArray = [];
        cache.set(obj, resultArray);
        obj.forEach((item, i) => resultArray[i] = visit(item, fn, k));
        return resultArray;
      } else if (obj && typeof obj === 'object') {
        circular.add(obj);
        let res = {};
        cache.set(obj, res);
        for (let key in obj) {
          res[key] = visit(obj[key], fn, key);
        }
        circular.delete(obj);
        return res;
      } else {
        // don't cache things like null/undefined
        return obj;
      }
    };

    return fn(obj, k, recurse);
  };

  let res = {};
  for (let k in obj) {
    res[k] = visit(obj[k], fn);
  }

  return res;
}

function mergeInterface(obj) {
  let properties = {};
  if (obj.type === 'interface') {
    merge(properties, obj.properties);

    for (let ext of obj.extends) {
      merge(properties, mergeInterface(ext).properties);
    }
  }

  return {
    type: 'interface',
    id: obj.id,
    name: obj.name,
    properties,
    typeParameters: obj.typeParameters,
    extends: [],
    description: obj.description
  };
}

function merge(a, b) {
  for (let key in b) {
    if (!(key in a)) {
      a[key] = b[key];
    }
  }
}

function omit(obj, toOmit) {
  if (obj.type === 'interface' || obj.type === 'object') {
    let keys = new Set();
    if (toOmit.type === 'string' && toOmit.value) {
      keys.add(toOmit.value);
    } else if (toOmit.type === 'union') {
      for (let e of toOmit.elements) {
        if (e.type === 'string' && e.value) {
          keys.add(e.value);
        }
      }
    }

    if (keys.size === 0) {
      return obj;
    }

    let properties = {};
    for (let key in obj.properties) {
      if (!keys.has(key)) {
        properties[key] = obj.properties[key];
      }
    }

    return {
      ...obj,
      properties
    };
  }

  return obj;
}
