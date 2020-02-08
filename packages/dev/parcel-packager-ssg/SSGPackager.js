const {Packager} = require('@parcel/plugin');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const requireFromString = require('require-from-string');

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
    let Component = requireFromString(bundleResult.contents, mainAsset.filePath).default;

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

    bundles = bundles.concat(bundleGraph.getSiblingBundles(bundle).filter(b => !b.isInline));
    bundles.reverse();

    let pages = [];
    bundleGraph.traverseBundles(b => {
      if (b.isEntry && b.type === 'html') {
        pages.push({url: '/' + b.name, name: b.name});
      }
    });

    let code = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Component, {
        scripts: bundles.filter(b => b.type === 'js').map(b => ({
          type: b.outputFormat === 'esmodule' ? 'module' : undefined,
          url: '/' + b.name
        })),
        styles: bundles.filter(b => b.type === 'css').map(b => ({
          url: '/' + b.name
        })),
        pages,
        currentPage: bundle.name
      })
    );

    return {
      contents: code
    };
  }
});
