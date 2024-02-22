import {API, FileInfo} from 'jscodeshift';
import {transformStyleProps} from './styleProps';
import {transformButton} from './button';
import {transformDialog, transformDialogTrigger} from './dialog';
import {getImportSpecifier} from './utils';

const availableComponents = new Set([
  'ActionButton',
  'Button',
  'Checkbox',
  'CheckboxGroup',
  'Heading',
  'Header',
  'Content',
  'Footer',
  'Image',
  'ButtonGroup',
  'Dialog',
  'DialogTrigger',
  'DialogContainer',
  'useDialogContainer',
  'Form',
  'InlineAlert',
  'SearchField',
  'Switch',
  'TextField',
  'ToggleButton',
  'Flex',
  'Grid',
  'View'
]);

export default function transformer(file: FileInfo, api: API) {
  const j = api.jscodeshift;

  let root = j(file.source);

  let imports = root.find(j.ImportDeclaration)
    .filter(path => typeof path.node.source.value === 'string' && (path.node.source.value === '@adobe/react-spectrum' || path.node.source.value.startsWith('@react-spectrum/')));
    
  let importedComponents = new Map();
  let hasMacros = false;
  let elements = imports.map(path => {
    if (path.node.specifiers) {
      return path.node.specifiers.flatMap(specifier => {
        if (specifier.type === 'ImportNamespaceSpecifier') {
          // TODO
        } else if (
          specifier.type === 'ImportSpecifier' &&
          typeof specifier.local?.name === 'string' && 
          typeof specifier.imported.name === 'string' &&
          availableComponents.has(specifier.imported.name)
        ) {
          importedComponents.set(specifier.imported.name, specifier.local.name);
          return root.findJSXElements(specifier.local.name).paths();
        }
        return [];
      });
    }
    return [];
  });
  
  elements.forEach(path => {
    let element = path.value.openingElement.name;
    if (element.type !== 'JSXIdentifier') {
      return;
    }

    // Remap element name to the original imported name. For example, for
    // `import {View as RSView} from '...'`, we want 'View' rather than 'RSView'.
    let importSpecifier = getImportSpecifier(path, element.name);
    if (!importSpecifier) {
      return;
    }
    
    let elementName = importSpecifier.value.imported.name as string;
    let res = transformStyleProps(j, path, elementName);
    if (res) {
      hasMacros = true;
    }

    switch (elementName) {
      case 'Button':
        transformButton(j, path);
        break;
      case 'Dialog':
        transformDialog(j, path);
        break;
      case 'DialogTrigger':
        transformDialogTrigger(j, path);
        break;
    }
  });
  
  if (hasMacros) {
    let macroImport = j.importDeclaration(
      [j.importSpecifier(j.identifier('style'))],
      j.literal('@react-spectrum/rainbow/style-macro/spectrum-theme')
    );

    macroImport.assertions = [j.importAttribute(
      j.identifier('type'),
      j.literal('macro')
    )];
    
    imports.paths().at(0)!.insertAfter(macroImport);
  }

  if (importedComponents.size) {
    imports.find(j.ImportSpecifier).forEach(path => {
      if (typeof path.value.imported.name === 'string' && availableComponents.has(path.value.imported.name)) {
        path.prune();
      }
    });

    let importSpecifiers = [...importedComponents]
      .filter(([c]) => c !== 'Flex' && c !== 'Grid' && c !== 'View')
      .map(([imported, local]) => j.importSpecifier(j.identifier(imported), j.identifier(local)));
    if (importSpecifiers.length) {
      let importDecl = j.importDeclaration(
        importSpecifiers,
        j.literal('@react-spectrum/rainbow')
      );
      
      imports.paths().at(0)!.insertAfter(importDecl);
    }

    imports.forEach(path => {
      if (path.value.specifiers?.length === 0) {
        path.prune();
      }
    });
  }
    
  return root.toSource();
}

transformer.parser = 'tsx';
