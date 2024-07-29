import {getPropValue} from './utils';
import {NodePath} from '@babel/traverse';
import * as t from '@babel/types';

export function transformButton(path: NodePath<t.JSXElement>) {
  path.traverse({
    JSXAttribute(path) {
      let value = getPropValue(path.node.value);
      if (path.node.name.type !== 'JSXIdentifier' || !value) {
        return;
      }

      switch (path.node.name.name) {
        case 'variant': {
          if (value.type === 'StringLiteral') {
            if (value.value === 'cta') {
              value.value = 'accent';
            } else if (value.value === 'overBackground') {
              value.value = 'primary';
              path.insertAfter(t.jsxAttribute(
                t.jsxIdentifier('staticColor'),
                t.stringLiteral('white')
              ));
            }
          }
          break;
        }
      }
    }
  });
}
