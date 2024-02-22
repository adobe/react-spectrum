import {API, ASTPath} from 'jscodeshift';
import {namedTypes} from 'ast-types';
import {referencesRSPImport} from './utils';

export function transformDialog(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path).childElements().forEach(path => {
    // S2 dialogs don't have a divider anymore.
    if (referencesRSPImport(path, 'Divider')) {
      path.prune();
    }
  });
}

export function transformDialogTrigger(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path).childNodes().forEach(path => {
    // Move close function inside dialog.
    // TODO: handle other types of functions too?
    if (path.value.type === 'JSXExpressionContainer' && path.value.expression.type === 'ArrowFunctionExpression') {
      let body = path.value.expression.body;
      if (body.type === 'JSXElement' && referencesRSPImport(path.get('expression').get('body'), 'Dialog')) {
        body.children = [j.jsxExpressionContainer(
          j.arrowFunctionExpression(
            path.value.expression.params,
            j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), body.children)
          )
        )];
        path.replace(body);
      } else {
        if (!path.value.expression.body.comments) {
          path.value.expression.body.comments = [];
        }
        path.get('expression').get('body').get('comments').push(j.line(' TODO: update this dialog to move the close function inside', true, false));
      }
    }
  });
}
