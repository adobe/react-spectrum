/* eslint-disable max-depth */
import {addComment, getName, removeUnusedImports} from './shared/utils';
import {API, FileInfo} from 'jscodeshift';
import {getComponents} from '../getComponents';
import {iconMap} from './icons/iconMap';
import {illustrationMap} from './illustrations/illustrationMap';
import {parse as recastParse} from 'recast';
import * as t from '@babel/types';
import transformStyleProps from './shared/styleProps';
import traverse, {Binding, NodePath} from '@babel/traverse';

// Determine list of available components in S2 from index.ts
let availableComponents = getComponents();

// These components in v3 were replaced by divs
availableComponents.add('View');
availableComponents.add('Flex');
availableComponents.add('Grid');
availableComponents.add('Well');

// Replaced by collection component-specific items
availableComponents.add('Item');
availableComponents.add('Section');

// Don't update v3 Provider
availableComponents.delete('Provider');

// Replaced by ActionButtonGroup and ToggleButtonGroup
availableComponents.add('ActionGroup');

// components renamed between v3 and S2
let renamedComponents: Record<string, string> = {
  ContextualHelpTrigger: 'UnavailableMenuItemTrigger'
};

interface Options {
  /**
   * Comma separated list of components to transform. If not specified, all available components
   * will be transformed.
   */
  components?: string;
}

interface RelatedComponentGroup {
  components?: string[];
  scopedComponents?: Record<string, string[]>;
}

interface ComponentSelection {
  components: Set<string>;
  explicitComponents: Set<string>;
  scopedComponents: Map<string, Set<string>>;
}

const relatedComponentGroups: Record<string, RelatedComponentGroup> = {
  ActionMenu: {
    scopedComponents: {
      Item: ['ActionMenu']
    }
  },
  Breadcrumbs: {
    scopedComponents: {
      Item: ['Breadcrumbs']
    }
  },
  ComboBox: {
    scopedComponents: {
      Item: ['ComboBox'],
      Section: ['ComboBox']
    }
  },
  DialogContainer: {
    components: ['Dialog']
  },
  DialogTrigger: {
    components: ['Dialog']
  },
  Menu: {
    components: ['ContextualHelpTrigger', 'MenuTrigger', 'SubmenuTrigger'],
    scopedComponents: {
      Item: ['Menu'],
      Section: ['Menu']
    }
  },
  Picker: {
    scopedComponents: {
      Item: ['Picker'],
      Section: ['Picker']
    }
  },
  TableView: {
    components: ['Cell', 'Column', 'Row', 'TableBody', 'TableHeader']
  },
  Tabs: {
    components: ['TabList', 'TabPanels']
  },
  TagGroup: {
    scopedComponents: {
      Item: ['TagGroup']
    }
  },
  TooltipTrigger: {
    components: ['Tooltip']
  }
};

function addScopedParents(
  scopedComponents: Map<string, Set<string>>,
  component: string,
  parents: string[]
) {
  let existingParents = scopedComponents.get(component) ?? new Set<string>();
  for (let parent of parents) {
    existingParents.add(parent);
  }
  scopedComponents.set(component, existingParents);
}

function getComponentSelection(components?: string): ComponentSelection {
  if (!components) {
    return {
      components: new Set(availableComponents),
      explicitComponents: new Set(availableComponents),
      scopedComponents: new Map()
    };
  }

  let explicitComponents = new Set(
    components
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  );
  let expandedComponents = new Set(explicitComponents);
  let scopedComponents = new Map<string, Set<string>>();

  for (let component of explicitComponents) {
    let relatedComponents = relatedComponentGroups[component];
    if (!relatedComponents) {
      continue;
    }

    for (let relatedComponent of relatedComponents.components ?? []) {
      expandedComponents.add(relatedComponent);
    }

    for (let [relatedComponent, parents] of Object.entries(
      relatedComponents.scopedComponents ?? {}
    )) {
      expandedComponents.add(relatedComponent);
      if (!explicitComponents.has(relatedComponent)) {
        addScopedParents(scopedComponents, relatedComponent, parents);
      }
    }
  }

  return {
    components: new Set(
      [...expandedComponents].filter(component => availableComponents.has(component))
    ),
    explicitComponents: new Set(
      [...explicitComponents].filter(component => availableComponents.has(component))
    ),
    scopedComponents
  };
}

function shouldTransformElement(
  componentName: string,
  path: NodePath<t.JSXElement>,
  selection: ComponentSelection
): boolean {
  if (selection.explicitComponents.has(componentName)) {
    return true;
  }

  let allowedParents = selection.scopedComponents.get(componentName);
  if (!allowedParents || allowedParents.size === 0) {
    return true;
  }

  return !!path.findParent(
    parentPath =>
      t.isJSXElement(parentPath.node) &&
      t.isJSXIdentifier(parentPath.node.openingElement.name) &&
      allowedParents.has(getName(path, parentPath.node.openingElement.name))
  );
}

export default function transformer(file: FileInfo, api: API, options: Options): string {
  let j = api.jscodeshift.withParser({
    parse(source: string) {
      return recastParse(source, {
        parser: require('recast/parsers/babel')
      });
    }
  });
  let root = j(file.source);
  let selection = getComponentSelection(options.components);
  let componentsToTransform = selection.components;
  let v3ComponentsToRename = new Set(Object.keys(renamedComponents));
  let S2ComponentsToImport = new Set<string>();

  let bindings: Binding[] = [];
  let importedComponents = new Map<string, t.ImportSpecifier | t.ImportNamespaceSpecifier>();
  let elements: [string, NodePath<t.JSXElement>][] = [];
  let lastImportPath: NodePath<t.ImportDeclaration> | null = null;
  let iconImports: Map<string, {path: NodePath<t.ImportDeclaration>; newName: string | null}> =
    new Map();
  let illustrationImports: Map<
    string,
    {path: NodePath<t.ImportDeclaration>; newName: string | null}
  > = new Map();
  let programPath: NodePath<t.Program> | null = null;
  const leadingComments = root.find(j.Program).get('body', 0).node.leadingComments;
  traverse(root.paths()[0].node, {
    Program(path) {
      programPath = path;
    },
    ImportDeclaration(path) {
      if (
        path.node.source.value === '@adobe/react-spectrum' ||
        (path.node.source.value.startsWith('@react-spectrum/') &&
          path.node.source.value !== '@react-spectrum/s2')
      ) {
        lastImportPath = path;
        for (let specifier of path.node.specifiers) {
          if (specifier.type === 'ImportNamespaceSpecifier') {
            // e.g. import * as RSP from '@adobe/react-spectrum';
            let binding = path.scope.getBinding(specifier.local.name);
            let clonedSpecifier = t.cloneNode(specifier);
            if (binding) {
              let isUsed = false;
              for (let path of binding.referencePaths) {
                let propName =
                  path.parentPath?.isJSXMemberExpression() && path.parentPath.node.property.name;
                if (propName && path.parentPath!.parentPath?.parentPath?.isJSXElement()) {
                  if (componentsToTransform.has(propName)) {
                    importedComponents.set(propName, clonedSpecifier);
                    let elementPath = path.parentPath!.parentPath
                      .parentPath as NodePath<t.JSXElement>;
                    if (shouldTransformElement(propName, elementPath, selection)) {
                      elements.push([propName, elementPath]);
                    }
                  } else if (v3ComponentsToRename.has(propName)) {
                    S2ComponentsToImport.add(renamedComponents[propName]);
                    elements.push([propName, path.parentPath!.parentPath.parentPath]);
                  } else {
                    isUsed = true;
                  }
                } else {
                  isUsed = true;
                }
              }
              if (!isUsed) {
                bindings.push(binding);
              } else {
                let name;
                let i = 0;
                do {
                  name = `${specifier.local.name}${++i}`;
                } while (path.scope.hasBinding(name));
                clonedSpecifier.local = t.identifier(name);
              }
            }
          } else if (
            specifier.type === 'ImportSpecifier' &&
            typeof specifier.local.name === 'string' &&
            specifier.imported.type === 'Identifier' &&
            typeof specifier.imported.name === 'string' &&
            (componentsToTransform.has(specifier.imported.name) ||
              v3ComponentsToRename.has(specifier.imported.name))
          ) {
            // e.g. import {Button} from '@adobe/react-spectrum'; or import {ContextualHelpTrigger} from '@adobe/react-spectrum';
            let binding = path.scope.getBinding(specifier.local.name);
            if (binding) {
              if (componentsToTransform.has(specifier.imported.name)) {
                importedComponents.set(specifier.imported.name, specifier);
              } else {
                S2ComponentsToImport.add(renamedComponents[specifier.imported.name]);
              }
              bindings.push(binding);
              for (let path of binding.referencePaths) {
                if (
                  path.parentPath?.isJSXOpeningElement() &&
                  path.parentPath.parentPath.isJSXElement()
                ) {
                  let elementPath = path.parentPath.parentPath as NodePath<t.JSXElement>;
                  if (shouldTransformElement(specifier.imported.name, elementPath, selection)) {
                    elements.push([specifier.imported.name, elementPath]);
                  }
                }
              }
            }
          }
        }
      } else if (path.node.source.value.startsWith('@spectrum-icons/workflow/')) {
        let importSource = path.node.source.value;
        let iconName = importSource.split('/').pop();
        if (!iconName) {
          return;
        }

        let specifier = path.node.specifiers[0];
        if (!specifier || !t.isImportDefaultSpecifier(specifier)) {
          return;
        }

        let localName = specifier.local.name;

        if (iconMap.has(iconName)) {
          let newIconName = iconMap.get(iconName)!;
          iconImports.set(localName, {path, newName: newIconName});
        } else {
          iconImports.set(localName, {path, newName: null});
        }
      } else if (path.node.source.value.startsWith('@spectrum-icons/illustrations/')) {
        let illustrationName = path.node.source.value.split('/').pop();
        if (!illustrationName) {
          return;
        }

        let specifier = path.node.specifiers[0];
        if (!specifier || !t.isImportDefaultSpecifier(specifier)) {
          return;
        }

        let localName = specifier.local.name;

        if (illustrationMap.has(illustrationName)) {
          let newIllustrationName = illustrationMap.get(illustrationName)!;
          illustrationImports.set(localName, {path, newName: newIllustrationName});
        } else {
          illustrationImports.set(localName, {path, newName: null});
        }
      }
    },
    Import(path) {
      let call = path.parentPath;
      if (!call?.isCallExpression()) {
        return;
      }

      let arg = call.node.arguments[0];
      if (arg.type !== 'StringLiteral') {
        return;
      }

      let isV3ImportSource =
        arg.value === '@adobe/react-spectrum' ||
        (arg.value.startsWith('@react-spectrum/') && arg.value !== '@react-spectrum/s2');
      if (!isV3ImportSource) {
        return;
      }

      // TODO: implement this. could be a bit challenging. punting for now.
      addComment(call.node, ' TODO(S2-upgrade): check this dynamic import');
    },
    JSXOpeningElement(path) {
      let name = path.node.name;
      if (t.isJSXIdentifier(name) && iconImports.has(name.name)) {
        let iconInfo = iconImports.get(name.name)!;
        if (iconInfo.newName === null) {
          addComment(
            path.node,
            ` TODO(S2-upgrade): A Spectrum 2 equivalent to '${name.name}' was not found. Please update this icon manually.`
          );
        }
      }
      if (t.isJSXIdentifier(name) && illustrationImports.has(name.name)) {
        let illustrationInfo = illustrationImports.get(name.name)!;
        if (illustrationInfo.newName === null) {
          addComment(
            path.node,
            ` TODO(S2-upgrade): A Spectrum 2 equivalent to '${name.name}' was not found. Please update this illustration manually.`
          );
        }
      }
    }
  });

  iconImports.forEach((iconInfo, localName) => {
    let {path, newName} = iconInfo;
    if (newName) {
      let newImportSource = `@react-spectrum/s2/icons/${newName}`;

      // Check if we can update local name
      let newLocalName = localName;
      if (localName === path.node.source.value.split('/').pop() && localName !== newName) {
        let binding = path.scope.getBinding(localName);
        if (binding && !path.scope.hasBinding(newName)) {
          newLocalName = newName;
          // Rename all references
          binding.referencePaths.forEach(refPath => {
            if (t.isJSXIdentifier(refPath.node)) {
              refPath.node.name = newName;
            }
          });
        }
      }

      // Update the import
      path.node.source = t.stringLiteral(newImportSource);
      path.node.specifiers = [t.importDefaultSpecifier(t.identifier(newLocalName))];
    }
  });

  illustrationImports.forEach((illustrationInfo, localName) => {
    let {path, newName} = illustrationInfo;
    if (newName) {
      let newImportSource = `@react-spectrum/s2/illustrations/linear/${newName}`;

      let newLocalName = localName;
      if (localName === path.node.source.value.split('/').pop() && localName !== newName) {
        let binding = path.scope.getBinding(localName);
        if (binding && !path.scope.hasBinding(newName)) {
          newLocalName = newName;
          binding.referencePaths.forEach(refPath => {
            if (t.isJSXIdentifier(refPath.node)) {
              refPath.node.name = newName;
            }
          });
        }
      }

      path.node.source = t.stringLiteral(newImportSource);
      path.node.specifiers = [t.importDefaultSpecifier(t.identifier(newLocalName))];
    }
  });

  let hasMacros = false;
  let usedLightDark = false;
  elements.forEach(([elementName, path]) => {
    if (!path.node) {
      return;
    }

    try {
      let res = transformStyleProps(path, elementName);
      if (res) {
        hasMacros ||= res.hasMacros;
        usedLightDark ||= res.usedLightDark;
      }
    } catch (error) {
      addComment(
        path.node,
        ' TODO(S2-upgrade): Could not transform style prop automatically: ' + error
      );
    }

    // Try to find a specific transform
    try {
      // Dynamically import the transform based on elementName
      const transformPath = `./components/${elementName}/transform`;
      // Use require for dynamic import in CommonJS context
      const componentTransform = require(transformPath);
      if (componentTransform && typeof componentTransform.default === 'function') {
        componentTransform.default(path);
      }
    } catch {
      // Do nothing if the transform doesn't exist
    }
  });

  if (hasMacros) {
    let specifiers = [t.importSpecifier(t.identifier('style'), t.identifier('style'))];
    if (usedLightDark) {
      specifiers.push(t.importSpecifier(t.identifier('lightDark'), t.identifier('lightDark')));
    }
    let macroImport = t.importDeclaration(specifiers, t.stringLiteral('@react-spectrum/s2/style'));

    macroImport.assertions = [t.importAttribute(t.identifier('type'), t.stringLiteral('macro'))];

    lastImportPath!.insertAfter(macroImport);
  }

  if (importedComponents.size || S2ComponentsToImport.size) {
    // Add imports to existing @react-spectrum/s2 import if it exists, otherwise add a new one.
    let importSpecifiers = new Set(
      [...importedComponents]
        .filter(
          ([c]) =>
            c !== 'Flex' &&
            c !== 'Grid' &&
            c !== 'View' &&
            c !== 'Item' &&
            c !== 'Section' &&
            c !== 'ActionGroup'
        )
        .map(([, specifier]) => specifier)
    );
    for (let s2Name of S2ComponentsToImport) {
      importSpecifiers.add(t.importSpecifier(t.identifier(s2Name), t.identifier(s2Name)));
    }

    let existingImport = root.find(j.ImportDeclaration, {
      source: {value: '@react-spectrum/s2'}
    });

    if (existingImport.length) {
      let importDecl = existingImport.get();
      let existingSpecifiers = importDecl.value.specifiers;
      // add importSpecifiers to existing import
      importDecl.value.specifiers = [
        ...importDecl.value.specifiers,
        ...[...importSpecifiers].filter(specifier => {
          if (t.isImportSpecifier(specifier) && t.isIdentifier(specifier.imported)) {
            if (specifier.imported.name === 'Item') {
              return false;
            }

            let importedName = specifier.imported.name;
            let localName = specifier.local?.name || importedName;
            return !existingSpecifiers.find(
              (s: t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier) =>
                t.isImportSpecifier(s) &&
                t.isIdentifier(s.imported) &&
                s.imported.name === importedName &&
                (s.local?.name || s.imported.name) === localName
            );
          }

          if (t.isImportNamespaceSpecifier(specifier)) {
            return !existingSpecifiers.find(
              (s: t.ImportSpecifier | t.ImportDefaultSpecifier | t.ImportNamespaceSpecifier) =>
                t.isImportNamespaceSpecifier(s) && s.local.name === specifier.local.name
            );
          }

          return false;
        })
      ];
    } else {
      if (importSpecifiers.size > 0) {
        let importDecl = t.importDeclaration(
          [...importSpecifiers],
          t.stringLiteral('@react-spectrum/s2')
        );

        lastImportPath!.insertAfter(importDecl);
      }
    }

    // Remove the original imports from v3.
    bindings.forEach(b => {
      if (
        t.isImportSpecifier(b.path.node) &&
        t.isIdentifier(b.path.node.imported) &&
        (b.path.node.imported.name === 'Item' || b.path.node.imported.name === 'Section')
      ) {
        // Keep Item and Section imports if they are still used
        bindings[0]?.path.scope.crawl();
        if (bindings[0]?.path.scope.bindings[b.path.node.local.name]?.referencePaths.length > 0) {
          return;
        }
      }
      b.path.remove();

      // If the import statement is now empty, remove it entirely.
      let decl = b.path.find(p => p.isImportDeclaration());
      if (decl?.isImportDeclaration() && decl.node.specifiers.length === 0) {
        decl.remove();
      }
    });
  }

  if (programPath) {
    removeUnusedImports(programPath, ['@react-spectrum/s2']);
  }

  root.find(j.Program).get('body', 0).node.comments = leadingComments;
  return root.toSource().replace(/assert\s*\{\s*type:\s*"macro"\s*\}/g, 'with { type: "macro" }');
}
