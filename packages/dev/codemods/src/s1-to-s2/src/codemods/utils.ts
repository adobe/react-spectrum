import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

export function getPropValue(node: t.JSXAttribute['value'] | t.ObjectProperty['value']): t.Expression | null | undefined {
  if (node?.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'JSXEmptyExpression') {
      return null;
    }
    return node.expression;
  }
  if (
    node?.type === 'RestElement' ||
    node?.type === 'ObjectPattern' ||
    node?.type === 'ArrayPattern' ||
    node?.type === 'AssignmentPattern'
  ) {
    return null;
  }
  return node;
}

export function nameFromExpression(expr: t.Node): string {
  switch (expr.type) {
    case 'Identifier':
    case 'JSXIdentifier':
      return expr.name;
    case 'CallExpression':
    case 'NewExpression':
    case 'OptionalCallExpression':
      return nameFromExpression(expr.callee);
    case 'MemberExpression':
    case 'OptionalMemberExpression':
      return nameFromExpression(expr.object) + capitalize(nameFromExpression(expr.property));
    case 'FunctionExpression':
    case 'ClassExpression':
      return expr.id ? nameFromExpression(expr.id) : '';
    case 'ConditionalExpression':
      return nameFromExpression(expr.test);
    case 'UnaryExpression':
      return nameFromExpression(expr.argument);
    case 'ParenthesizedExpression':
      return nameFromExpression(expr.expression);
    case 'JSXExpressionContainer':
      return expr.expression.type !== 'JSXEmptyExpression' ? nameFromExpression(expr.expression) : '';
    case 'BinaryExpression':
    case 'LogicalExpression':
    case 'AssignmentExpression':
      return nameFromExpression(expr.left) + capitalize(nameFromExpression(expr.right));
    case 'AwaitExpression':
      return expr.argument ? nameFromExpression(expr.argument) : '';
    case 'SequenceExpression':
      return expr.expressions.reduce((p, e) => {
        let v = nameFromExpression(e);
        return p ? p + capitalize(v) : v;
      }, '');
    default:
      return '';
  }
}

export function capitalize(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}

export function addComment(node: any, comment: string) {
  if (!node.comments) {
    node.comments = [];
  }
  node.comments.push({
    type: 'Line',
    value: comment,
    leading: true
  });
}

export function addComponentImport(path: NodePath<t.Program>, newComponent: string) {
  // If newComponent variable already exists in scope, alias new import to avoid conflict.
  let existingBinding = path.scope.getBinding(newComponent);
  let localName = newComponent;
  if (existingBinding) {
    let newName = newComponent;
    let i = 1;
    while (path.scope.hasBinding(newName)) {
      newName = newComponent + i;
      i++;
    }
    localName = newName;
  }

  let existingImport = path.node.body.find((node) => t.isImportDeclaration(node) && node.source.value === '@react-spectrum/s2');
  if (existingImport && t.isImportDeclaration(existingImport)) {
    let specifier = existingImport.specifiers.find((specifier) => {
      return (
        t.isImportSpecifier(specifier) &&
        specifier.imported.type === 'Identifier' &&
        specifier.imported.name === newComponent
      );
    });
    if (specifier) {
      // Already imported
      return localName;
    }
    existingImport.specifiers.push(
      t.importSpecifier(t.identifier(localName), t.identifier(newComponent))
    );
  } else {
    let importDeclaration = t.importDeclaration(
      [
        t.importSpecifier(
          t.identifier(localName),
          t.identifier(newComponent)
        )
      ],
      t.stringLiteral('@react-spectrum/s2')
    );
    path.node.body.unshift(importDeclaration);
  }
  return localName;
}

export function removeComponentImport(path: NodePath<t.Program>, component: string) {
  let existingImport = path.node.body.find((node) => t.isImportDeclaration(node) && node.source.value === '@adobe/react-spectrum' || t.isImportDeclaration(node) &&  node.source.value.startsWith('@react-spectrum/'));
  if (existingImport && t.isImportDeclaration(existingImport)) {
    let specifier = existingImport.specifiers.find((specifier) => {
      return (
        t.isImportSpecifier(specifier) &&
        specifier.imported.type === 'Identifier' &&
        specifier.imported.name === component
      );
    });
    if (specifier) {
      existingImport.specifiers = existingImport.specifiers.filter((s) => s !== specifier);
      if (existingImport.specifiers.length === 0) {
        path.node.body = path.node.body.filter((node) => node !== existingImport);
      }
    }
  }
}

/**
 * Look up the name in path.scope and find the original binding.
 * Returns the original name even if an alias is used.
 */
export function getName(path: NodePath<t.JSXElement>, identifier: t.JSXIdentifier) {
  let binding = path.scope.getBinding(identifier.name);
  if (binding && t.isImportSpecifier(binding.path.node) && t.isIdentifier(binding.path.node.imported)) {
    return binding.path.node.imported.name;
  }
  return identifier.name;
}
