import path from 'path';
import { Resolver } from "@parcel/plugin";
const reactVersion = require("react-dom/package.json").version;
import { default as NodeResolver } from "@parcel/node-resolver-core";
// @ts-ignore
import { isGlob, glob, normalizeSeparators, relativePath } from '@parcel/utils';
import { globalsNameReferenceMap } from 'storybook/internal/preview/globals';

const REACT_MAJOR_VERSION = parseInt(reactVersion.split('.')[0], 10);

module.exports = new Resolver({
  async resolve({ dependency, options, specifier, pipeline, logger }) {
    if (specifier in globalsNameReferenceMap) {
      return {
        filePath: __dirname + "/globals.js",
        code: `module.exports = ${globalsNameReferenceMap[specifier]};`
      };
    }

    // Workaround for interop issue
    if (specifier === "react-dom/client" && REACT_MAJOR_VERSION < 18) {
      return {
        filePath: __dirname + "/react.js",
        code: `
        export * from 'react-dom';
        export * as default from 'react-dom'
        `,
      };
    }

    // Resolve story entry globs. Storybook expects an object with relative paths from the process cwd as keys.
    // We do this in a resolver so that it invalidates the watcher when new stories are created.
    if (pipeline === 'story') {
      let sourceFile = dependency.resolveFrom ?? dependency.sourcePath!;
      let normalized = normalizeSeparators(path.resolve(path.dirname(sourceFile), atob(specifier)));
      let files = await glob(normalized, options.inputFS, {
        onlyFiles: true,
      });

      let cwd = process.cwd();
      let dir = path.dirname(sourceFile);
      let entries = files.map(file => {
        let key = relativePath(cwd, file);
        let relative = relativePath(dir, file);
        return `  ${JSON.stringify(key)}: () => import(${JSON.stringify(relative)}),`;
      });

      return {
        filePath: path.join(
          dir,
          'stories.js'
        ),
        code:
          `const importMap = {\n${entries.join('\n')}\n};\n` +
          `export const importer = async (path) => {\n` +
          `  const fn = importMap[path];\n` +
          `  return fn ? fn() : undefined;\n` +
          `};\n`,
        invalidateOnFileCreate: [
          {glob: normalized}
        ],
        pipeline: null,
        priority: 'sync',
      };
    }
  },
});
