/*
 * Copyright 2023 Adobe. All rights reserved.
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
const {PromiseQueue, urlJoin, replaceInlineReferences, replaceURLReferences, blobToString} = require('@parcel/utils');
const Module = require('module');
const path = require('path');
const ReactDOMServer = require('react-dom/server');
const React = require('react');

const packagingBundles = new Map();
const moduleCacheIds = new Set();

module.exports = new Packager({
  async loadConfig({bundleGraph}) {
    // clear cache at the start of each build.
    packagingBundles.clear();
    for (let id of moduleCacheIds) {
      delete Module._cache[id];
    }
    moduleCacheIds.clear();
  },
  async package({bundle, bundleGraph, getInlineBundleContents}) {
    let queue = new PromiseQueue({maxConcurrent: 32});
    bundle.traverse(node => {
      if (node.type === 'dependency') {
        let dep = node.value;
        let entryBundle = bundleGraph.getReferencedBundle(dep, bundle);
        if (entryBundle?.bundleBehavior === 'inline') {
          queue.add(async () => {
            if (!packagingBundles.has(entryBundle)) {
              packagingBundles.set(entryBundle, getInlineBundleContents(
                entryBundle,
                bundleGraph,
              ));
            }

            let packagedBundle = await packagingBundles.get(entryBundle);
            let contents = await blobToString(packagedBundle.contents);
            contents = `module.exports = ${contents}`;
            return [entryBundle.id, [entryBundle.getMainEntry(), contents]];
          });
        }
      } else if (node.type === 'asset') {
        let asset = node.value;
        queue.add(async () => [asset.id, [asset, await asset.getCode()]]);
      }
    });

    let assets = new Map(await queue.run());
    let load = (id, parent) => {
      const cachedModule = Module._cache[id];
      if (cachedModule) {
        return cachedModule.exports;
      }

      let m = new Module(id, parent);
      Module._cache[id] = m;

      let [asset, code] = assets.get(id);
      m.filename = asset.filePath;
      m.paths = Module._nodeModulePaths(path.dirname(asset.filePath));
      moduleCacheIds.add(id);

      let deps = new Map();
      for (let dep of bundleGraph.getDependencies(asset)) {
        if (bundleGraph.isDependencySkipped(dep)) {
          deps.set(getSpecifier(dep), {skipped: true});
          continue;
        }

        let entryBundle = bundleGraph.getReferencedBundle(dep, bundle);
        if (entryBundle?.bundleBehavior === 'inline') {
          deps.set(getSpecifier(dep), {id: entryBundle.id});
          continue;
        }

        let resolved = bundleGraph.getResolvedAsset(dep, bundle);
        if (resolved) {
          deps.set(getSpecifier(dep), {id: resolved.id});
        } else {
          deps.set(getSpecifier(dep), {specifier: dep.specifier})
        }
      }

      let defaultRequire = m.require;
      m.require = id => {
        let resolution = deps.get(id);
        if (resolution?.skipped) {
          return {};
        }

        if (resolution?.id) {
          return load(resolution.id, m);
        }

        if (resolution?.specifier) {
          id = resolution.specifier;
        }

        return defaultRequire.call(m, id);
      };

      m._compile(code, asset.filePath);
      return m.exports;
    };

    let Component = load(bundle.getMainEntry().id, module).default;
    let bundles = bundleGraph.getReferencedBundles(bundle).reverse();

    let pages = [];
    bundleGraph.traverseBundles(b => {
      let mainAsset = b.getMainEntry();
      if (mainAsset && mainAsset.meta.isMDX && !mainAsset.meta.hidden) {
        let meta = mainAsset.meta;
        pages.push({
          url: urlJoin(b.target.publicUrl, rename(b)),
          name: rename(b),
          title: meta.navigationTitle ?? meta.title,
          category: meta.category,
          description: meta.description,
          keywords: meta.keywords,
          date: meta.date,
          author: meta.author,
          image: getImageURL(meta.image, bundleGraph, b),
          order: meta.order,
          preRelease: meta.preRelease,
          type: meta.type
        });
      }
    }, null);

    let name = rename(bundle);
    let mainAsset = bundle.getMainEntry();
    let code = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Component, {
        scripts: bundles.filter(b => b.type === 'js').map(b => ({
          type: b.env.outputFormat === 'esmodule' ? 'module' : undefined,
          url: urlJoin(b.target.publicUrl, b.name)
        })),
        styles: bundles.filter(b => b.type === 'css').map(b => ({
          url: urlJoin(b.target.publicUrl, b.name)
        })),
        pages,
        currentPage: {
          filePath: mainAsset.filePath,
          category: mainAsset.meta.category,
          name,
          title: mainAsset.meta.title,
          url: urlJoin(bundle.target.publicUrl, name),
          description: mainAsset.meta.description,
          keywords: mainAsset.meta.keywords,
          date: mainAsset.meta.date,
          author: mainAsset.meta.author,
          image: getImageURL(mainAsset.meta.image, bundleGraph, bundle),
          order: mainAsset.meta.order,
          preRelease: mainAsset.meta.preRelease,
          type: mainAsset.meta.type
        },
        toc: mainAsset.meta.toc,
        publicUrl: bundle.target.publicUrl
      })
    );

    return {
      contents: '<!doctype html>' + code
    }
  }
});

function getSpecifier(dep) {
  if (typeof dep.meta.placeholder === 'string') {
    return dep.meta.placeholder;
  }

  return dep.specifier;
}

function rename(bundle) {
  return bundle.name.slice(0, -path.extname(bundle.name).length) + '.html';
}

function getImageURL(image, bundleGraph, bundle) {
  if (!image) {
    return '';
  }

  let dep = bundle.getMainEntry().getDependencies().find(d => d.id === image);
  if (!dep) {
    return '';
  }

  let resolved = bundleGraph.getReferencedBundle(dep, bundle);
  if (!resolved) {
    return '';
  }

  return resolved.name;
}
