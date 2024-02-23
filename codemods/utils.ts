import {namedTypes} from 'ast-types';
import * as kinds from 'ast-types/lib/gen/kinds';
import {ASTPath} from 'jscodeshift';

export function getPropValue(node: namedTypes.JSXAttribute['value'] | namedTypes.ObjectProperty['value']): kinds.ExpressionKind | null | undefined {
  if (node?.type === 'JSXExpressionContainer') {
    if (node.expression.type === 'JSXEmptyExpression') {
      return null;
    }
    return node.expression;
  }
  if (
    node?.type === 'RestElement' ||
    node?.type === 'SpreadElementPattern' ||
    node?.type === 'PropertyPattern' ||
    node?.type === 'ObjectPattern' ||
    node?.type === 'ArrayPattern' ||
    node?.type === 'AssignmentPattern' || 
    node?.type === 'SpreadPropertyPattern' ||
    node?.type === 'TSParameterProperty'
  ) {
    return null;
  }
  return node;
}

export function referencesRSPImport(path: ASTPath, expectedName: string) {
  if (path.value?.type === 'JSXElement') {
    path = path.get('openingElement');
  }

  if (path.value?.type === 'JSXOpeningElement') {
    path = path.get('name');
  }

  if (path.value?.type !== 'Identifier' && path.value?.type !== 'JSXIdentifier') {
    return false;
  }
  
  let name = path.value.name;
  let importSpecifier = getImportSpecifier(path, name);
  if (!importSpecifier) {
    return false;
  }

  if (importSpecifier.value.imported.name !== expectedName) {
    return false;
  }

  let source = importSpecifier.parent.value.source.value;
  return source === '@adobe/react-spectrum' || source.startsWith('@react-spectrum/');
}

export function getImportSpecifier(path: ASTPath, name: string) {
  let scope = path.scope.lookup(name);
  if (!scope) {
    return null;
  }

  let bindings = scope.getBindings()[name];
  if (!bindings || bindings.length !== 1) {
    return null;
  }

  let binding: ASTPath = bindings[0];
  while (binding && binding.value.type !== 'ImportSpecifier') {
    binding = binding.parentPath;
  }

  if (binding && binding.value.type === 'ImportSpecifier') {
    return binding as ASTPath<namedTypes.ImportSpecifier>;
  }

  return null;
}

export function nameFromExpression(expr: namedTypes.ObjectProperty['value']): string {
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
    case 'ChainExpression':
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
