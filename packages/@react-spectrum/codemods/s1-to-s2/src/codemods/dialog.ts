import {addComment} from './utils';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

export function transformDialog(path: NodePath<t.JSXElement>) {
  path.get('children').forEach(path => {
    // S2 dialogs don't have a divider anymore.
    if (path.isJSXElement()) {
      let name = path.get('openingElement').get('name');
      if (name.referencesImport('@adobe/react-spectrum', 'Divider') || name.referencesImport('@react-spectrum/divider', 'Divider')) {
        path.remove();
      }
    }
  });
}

export function transformDialogTrigger(path: NodePath<t.JSXElement>) {
  path.get('children').forEach(path => {
    // Move close function inside dialog.
    // TODO: handle other types of functions too?
    if (!path.isJSXExpressionContainer()) {
      return;
    }

    let expression = path.get('expression');
    if (!expression.isArrowFunctionExpression()) {
      return;
    }
    
    let body = expression.get('body');
    if (body.isJSXElement()) {
      let name = body.get('openingElement').get('name');
      if ((name.referencesImport('@adobe/react-spectrum', 'Dialog') || name.referencesImport('@react-spectrum/dialog', 'Dialog'))) {
        body.node.children = [t.jsxExpressionContainer(
          t.arrowFunctionExpression(
            expression.node.params,
            t.jsxFragment(t.jsxOpeningFragment(), t.jsxClosingFragment(), body.node.children)
          )
        )];
        path.replaceWith(body.node);
        return;
      }
    }

    addComment(body.node, ' TODO(S2-upgrade): update this dialog to move the close function inside');
  });
}
