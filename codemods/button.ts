import {API, ASTPath} from 'jscodeshift';
import {namedTypes} from 'ast-types';
import {getPropValue} from './utils';

export function transformButton(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>) {
  j(path.node.openingElement).find(j.JSXAttribute).forEach(path => {
    let prop = path.value.name;
    let value = getPropValue(path.value.value);
    if (prop.type !== 'JSXIdentifier' || !value) {
      return;
    }

    switch (prop.name) {
      case 'variant': {
        if (value.type === 'StringLiteral') {
          if (value.value === 'cta') {
            value.value = 'accent';
          } else if (value.value === 'overBackground') {
            value.value = 'primary';
            path.insertAfter(j.jsxAttribute(
              j.jsxIdentifier('staticColor'),
              j.stringLiteral('white')
            ));
          }
        }
        break;
      }
    }
  });
}
