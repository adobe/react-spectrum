import {API, FileInfo, ImportSpecifier, Options} from 'jscodeshift';
const fs = require('fs');
const path = require('path');

function areSpecifiersAlphabetized(specifiers: ImportSpecifier[]) {
  const specifierNames = specifiers.map(
    (specifier) => specifier.imported.name
  );
  const sortedNames = [...specifierNames].sort();
  return specifierNames.join() === sortedNames.join();
}

/**
 * Replaces individual package imports with monopackage imports, where possible.
 *
 * Works for:
 * - `@react-spectrum/*` -> `@adobe/react-spectrum`.
 * - `@react-aria/*` -> `react-aria`.
 * - `@react-stately/*` -> `react-stately`.
 *
 * By default this will apply to all the above packages, or optionally you can specify which packages to apply this by passing a comma-separated list to the packages option: `--packages=react-aria,react-stately,react-spectrum`.
 *
 * Run this from a directory where the relevant packages are installed in node_modules so it knows which monopackage exports are available to use (since exports may vary by version).
 */
export default function transformer(file: FileInfo, api: API, options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const packages: Record<string, { monopackage: string, individualPrefix: string }> = {
    'react-spectrum': {
      monopackage: '@adobe/react-spectrum',
      individualPrefix: '@react-spectrum/'
    },
    'react-aria': {
      monopackage: 'react-aria',
      individualPrefix: '@react-aria/'
    },
    'react-stately': {
      monopackage: 'react-stately',
      individualPrefix: '@react-stately/'
    }
  };

  const selectedPackages =
    (options?.packages as string)?.split(',').filter((pkg) => packages[pkg]) ||
    Object.keys(packages);

  let anyIndexFound = false;
  const monopackageExports: Record<string, string[]> = {};

  selectedPackages.forEach((pkg) => {
    const indexPath = path.join(
      process.cwd(),
      `node_modules/${packages[pkg].monopackage}/dist/types.d.ts`
    );

    if (fs.existsSync(indexPath)) {
      anyIndexFound = true;
      const indexFile = fs.readFileSync(indexPath, 'utf8');
      const indexRoot = j(indexFile);

      monopackageExports[pkg] = [];
      // Collect all named exports from the monopackage index file
      indexRoot.find(j.ExportNamedDeclaration).forEach((path) => {
        path.node.specifiers?.forEach((specifier) => {
          monopackageExports[pkg].push(specifier.exported.name as string);
        });
      });

      // Collect all exports defined in export statements like "export { Component } from '...' "
      indexRoot
        .find(j.ExportNamedDeclaration, {
          source: {
            type: 'Literal'
          }
        })
        .forEach((path) => {
          path.node.specifiers?.forEach((specifier) => {
            monopackageExports[pkg].push(specifier.exported.name as string);
          });
        });
    } else if (options?.packages?.split(',').includes(pkg)) {
      console.warn(
        `The index file for ${packages[pkg].monopackage} at ${indexPath} does not exist. Ensure that ${packages[pkg].monopackage} is installed.`
      );
    }
  });

  if (!anyIndexFound) {
    console.warn(
      'None of the index files for the selected packages exist. Ensure that the packages are installed.'
    );
    return root.toSource();
  }

  selectedPackages.forEach((pkg) => {
    // Find all imports from individual packages
    const individualPackageImports = root
      .find(j.ImportDeclaration)
      .filter((path) => {
        return (path.node.source.value as string)?.startsWith(
          packages[pkg].individualPrefix
        );
      });

    if (individualPackageImports.size() === 0) {
      return;
    }

    // Collect all imported specifiers from individual packages that are also in the monopackage exports
    const importedSpecifiers = individualPackageImports
      .nodes()
      .reduce((acc, node) => {
        node.specifiers?.forEach((specifier) => {
          if (monopackageExports[pkg].includes((specifier as ImportSpecifier).imported.name as string)) {
            acc.push(specifier as ImportSpecifier);
          }
        });
        return acc;
      }, [] as ImportSpecifier[]);

    // Remove the old imports if they are present in monopackage exports
    individualPackageImports.forEach((path) => {
      path.node.specifiers = path.node.specifiers?.filter(
        (specifier) =>
          !monopackageExports[pkg].includes((specifier as ImportSpecifier).imported.name as string)
      );
    });

    // Remove import declarations with no specifiers left
    individualPackageImports
      .filter((path) => path.node.specifiers?.length === 0)
      .remove();

    // Find existing monopackage import if it exists
    const monopackageImport = root.find(j.ImportDeclaration).filter((path) => {
      return path.node.source.value === packages[pkg].monopackage;
    });

    if (monopackageImport.size() > 0) {
      const existingImport = monopackageImport.at(0).get().node;
      const specifiers = existingImport.specifiers as ImportSpecifier[];
      if (areSpecifiersAlphabetized(specifiers)) {
        // If imports are sorted, add the new import in sorted order
        importedSpecifiers.forEach((newSpecifier) => {
          const index = specifiers.findIndex(
            (specifier) => specifier.imported.name > newSpecifier.imported.name
          );
          if (index === -1) {
            specifiers.push(newSpecifier);
          } else {
            specifiers.splice(index, 0, newSpecifier);
          }
        });
      } else {
        // If imports are not sorted, add the new import to the end
        specifiers.push(...importedSpecifiers);
      }
    } else if (importedSpecifiers.length > 0) {
      // Create a new monopackage import with the collected specifiers
      const newImport = j.importDeclaration(
        importedSpecifiers,
        j.literal(packages[pkg].monopackage)
      );

      // Insert the new import below the last existing import
      const lastImport = root.find(j.ImportDeclaration).at(-1);
      if (lastImport.size() > 0) {
        lastImport.insertAfter(newImport);
      } else {
        root.get().node.program.body.unshift(newImport);
      }
    }
  });

  return root.toSource();
}

transformer.parser = 'tsx';
