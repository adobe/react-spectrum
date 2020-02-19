const {Packager} = require('@parcel/plugin');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const requireFromString = require('require-from-string');
const {bufferStream, urlJoin} = require('@parcel/utils');
const {Readable} = require('stream');

module.exports = new Packager({
  async package({bundle, bundleGraph, getInlineBundleContents}) {
    let mainAsset = bundle.getMainEntry();
    let inlineBundle;
    bundleGraph.traverseBundles((bundle, context, {stop}) => {
      let entry = bundle.getMainEntry();
      if (bundle.type === 'js' && bundle.isInline && entry && entry.filePath === mainAsset.filePath) {
        inlineBundle = bundle;
        stop();
      }
    });

    let bundleResult = await getInlineBundleContents(inlineBundle, bundleGraph);
    let contents = (bundleResult.contents instanceof Readable ? await bufferStream(bundleResult.contents) : bundleResult.contents).toString();
    let Component = requireFromString(contents, mainAsset.filePath).default;

    // Insert references to sibling bundles. For example, a <script> tag in the original HTML
    // may import CSS files. This will result in a sibling bundle in the same bundle group as the
    // JS. This will be inserted as a <link> element into the HTML here.
    let bundleGroups = bundleGraph
      .getExternalDependencies(bundle)
      .map(dependency => bundleGraph.resolveExternalDependency(dependency))
      .filter(Boolean);
    let bundles = bundleGroups.reduce((p, bundleGroup) => {
      let bundles = bundleGraph.getBundlesInBundleGroup(bundleGroup);
      return p.concat(bundles);
    }, []);

    bundles.reverse();

    let pages = [];
    bundleGraph.traverseBundles(b => {
      if (b.isEntry && b.type === 'html') {
        pages.push({url: urlJoin(b.target.publicUrl, b.name), name: b.name});
      }
    });

    let code = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Component, {
        scripts: bundles.filter(b => b.type === 'js' && !b.isInline).map(b => ({
          type: b.env.outputFormat === 'esmodule' ? 'module' : undefined,
          url: urlJoin(b.target.publicUrl, b.name)
        })),
        styles: bundles.filter(b => b.type === 'css').map(b => ({
          url: urlJoin(b.target.publicUrl, b.name)
        })),
        pages,
        currentPage: bundle.name,
        toc: mainAsset.meta.toc,
        publicUrl: bundle.target.publicUrl
      })
    );

    return {
      contents: '<!doctype html>' + code
    };
  }
});
