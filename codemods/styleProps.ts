import {namedTypes} from 'ast-types';
import * as kinds from 'ast-types/lib/gen/kinds';
import * as j from 'jscodeshift';
import {API, ASTPath} from 'jscodeshift';
import {getPropValue} from './utils';
import {convertDimension, convertGridTrack} from './dimensions';
import {convertColor} from './colors';
import {transformUnsafeStyle} from './unsafeStyle';

export const borderWidths = {
  none: 0,
  thin: 1,
  thick: 2,
  thicker: 4,
  thickest: '[8px]' // not in new theme
};

export const borderRadius = {
  xsmall: '[1px]',
  small: 'sm', // 2px -> 4px
  regular: 'default', // 4px -> 8px
  medium: 'lg', // 8px -> 10px
  large: 'xl' // 16px
};

const propertyMappings = {
  start: 'insetStart',
  end: 'insetEnd',
  rows: 'gridTemplateRows',
  columns: 'gridTemplateColumns',
  areas: 'gridTemplateAreas',
  wrap: 'flexWrap',
  direction: 'flexDirection',
  autoFlow: 'gridAutoFlow'
};

interface MacroValue {
  key: string,
  value: object | string | number | boolean
}

interface DynamicValue {
  key: string,
  value: namedTypes.ObjectProperty['value']
}

interface Condition {
  key: string,
  value: namedTypes.ObjectProperty['value']
}

export interface StylePropValue {
  macroValues: MacroValue[],
  dynamicValues?: DynamicValue[],
  conditions?: Condition[]
}

function getStylePropValue(prop: string, value: namedTypes.ObjectProperty['value'], element: string, colorVersion: number | null, condition = ''): StylePropValue | null | undefined {
  let mappedProp: string = propertyMappings[prop as keyof typeof propertyMappings] || prop;
  // let customProp = `--${mappedProp}${condition ? '-' + condition : ''}`;
  switch (prop) {
    case 'width':
    case 'minWidth':
    case 'maxWidth':
    case 'height':
    case 'minHeight':
    case 'maxHeight':
    case 'margin':
    case 'marginStart':
    case 'marginEnd':
    case 'marginTop':
    case 'marginBottom':
    case 'marginX':
    case 'marginY':
    case 'top':
    case 'bottom':
    case 'left':
    case 'right':
    case 'start':
    case 'end':
    case 'flexBasis': {
      if (value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
        let val = convertDimension(value.value);
        if (val != null) {
          return {
            macroValues: [{key: mappedProp, value: val}]
          };
        }
      } else if (value.type === 'ObjectExpression') {
        return getResponsiveValue(prop, value, element, colorVersion);
      }
      // return [mappedProp, customProp, [[customProp, value]]];
      return null;
    }
    case 'alignSelf':
    case 'justifySelf':
    case 'position':
    case 'zIndex':
    case 'order':
    case 'flexGrow':
    case 'flexShrink':
    case 'gridArea':
    case 'gridColumn':
    case 'gridRow':
    case 'gridRowEnd':
    case 'gridRowStart':
      if (value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
        return {
          macroValues: [{key: mappedProp, value: value.value}]
        };
      } else if (value.type === 'ObjectExpression') {
        return getResponsiveValue(prop, value, element, colorVersion);
      }
      // return [mappedProp, customProp, [[customProp, value]]];
      return null;
    case 'flex':
      if (value.type === 'BooleanLiteral' || value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
        let val: any = value.value;
        if (val === true) {
          val = 1;
        } else if (val === false) {
          val = undefined;
        }
        return {
          macroValues: [{key: mappedProp, value: val}]
        };
      } else if (value.type === 'ObjectExpression') {
        return getResponsiveValue(prop, value, element, colorVersion);
      }
      // return [mappedProp, customProp, [[customProp, value]]];
      return null;
    case 'isHidden':
      if (value.type === 'BooleanLiteral' && value.value === true) {
        return {
          macroValues: [{key: 'display', value: 'none'}]
        };
      } else if (value.type === 'ObjectExpression') {
        return getResponsiveValue(prop, value, element, colorVersion);
      }
      // TODO
      // return ['display', `--display${condition ? '-' + condition : ''}`, value];
      return null;

    // Flex and Grid specific props
    case 'justifyContent':
    case 'alignContent':
    case 'alignItems':
      if (element === 'Flex' || element === 'Grid') {
        if (value.type === 'StringLiteral') {
          return {
            macroValues: [{key: mappedProp, value: value.value}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        } else if (!condition) {
          return {
            macroValues: [],
            dynamicValues: [{key: mappedProp, value}]
          };
        }
      }
      break;
    case 'gap':
    case 'columnGap':
    case 'rowGap':
      if (element === 'Flex' || element === 'Grid') {
        if (value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
          let val = convertDimension(value.value);
          if (val != null) {
            return {
              macroValues: [{key: mappedProp, value: val}]
            };
          }
          return null;
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;
    case 'wrap':
      if (element === 'Flex' && value.type === 'BooleanLiteral') {
        value = {type: 'StringLiteral', value: 'wrap'};
      }
      // fallthrough
    case 'direction':
      if (element === 'Flex') {
        if (value.type === 'StringLiteral') {
          return {
            macroValues: [{key: mappedProp, value: value.value}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        } else {
          return {
            macroValues: [],
            dynamicValues: [{key: mappedProp, value}]
          };
        }
      }
      break;
    case 'areas':
      if (element === 'Grid') {
        if (value.type === 'ArrayExpression' && value.elements.every(e => e?.type === 'StringLiteral')) {
          return {
            macroValues: [{key: mappedProp, value: value.elements.map(e => e?.type === 'StringLiteral' && e.value)}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        } else {
          let val = j.callExpression(
            j.memberExpression(
              j.callExpression(
                j.memberExpression(value as any, j.identifier('map')),
                [j.arrowFunctionExpression(
                  [j.identifier('v')],
                  j.templateLiteral([j.templateElement({raw: '"', cooked: null}, false), j.templateElement({raw: '"', cooked: null}, true)], [j.identifier('v')])
                )]
              ),
              j.identifier('join')
            ),
            [j.stringLiteral('')]
          );
          return {
            macroValues: [],
            dynamicValues: [{key: mappedProp, value: val}]
          };
        }
      }
      break;
    case 'rows':
    case 'columns':
      if (element === 'Grid') {
        if (value.type === 'StringLiteral') {
          return {
            macroValues: [{key: mappedProp, value: value.value}]
          };
        } else if (value.type === 'ArrayExpression') {
          let values = [];
          for (let element of value.elements) {
            if (element?.type === 'StringLiteral' || element?.type === 'NumericLiteral') {
              values.push(convertGridTrack(element.value));
            } else if (element?.type === 'CallExpression') {
              // TODO: match to import using scope
              if (
                element.callee.type === 'Identifier' &&
                element.callee.name === 'minmax' &&
                element.arguments.length === 2 &&
                (element.arguments[0].type === 'StringLiteral' || element.arguments[0].type === 'NumericLiteral') &&
                (element.arguments[1].type === 'StringLiteral' || element.arguments[1].type === 'NumericLiteral')
              ) {
                // TODO: use theme value somehow?
                let min = convertGridTrack(element.arguments[0].value, true);
                let max = convertGridTrack(element.arguments[1].value, true);
                values.push(`minmax(${min}, ${max})`);
              }
              // TODO: handle repeat() and fit-content()
            } else {
              // bail
              return;
            }
          }
          return {
            macroValues: [{key: mappedProp, value: values}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;
    case 'autoFlow':
    case 'justifyItems':
      if (element === 'Grid') {
        if (value.type === 'StringLiteral') {
          return {
            macroValues: [{key: mappedProp, value: value.value}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;

    // View specific props
    case 'padding':
    case 'paddingX':
    case 'paddingY':
    case 'paddingStart':
    case 'paddingEnd':
    case 'paddingTop':
    case 'paddingBottom':
      if (element === 'View') {
        if (value.type === 'StringLiteral' || value.type === 'NumericLiteral') {
          let val = convertDimension(value.value);
          if (val != null) {
            return {
              macroValues: [{key: mappedProp, value: val}]
            };
          }
          return null;
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;
    case 'overflow':
      if (element === 'View') {
        if (value.type === 'StringLiteral') {
          return {
            macroValues: [{key: mappedProp, value: value.value}]
          };
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        } else {
          return {
            macroValues: [],
            dynamicValues: [{key: mappedProp, value}]
          };
        }
      }
      break;
    case 'borderWidth':
    case 'borderStartWidth':
    case 'borderEndWidth':
    case 'borderTopWidth':
    case 'borderBottomWidth':
    case 'borderXWidth':
    case 'borderYWidth':
      if (element === 'View') {
        if (value.type === 'StringLiteral') {
          let val = borderWidths[value.value as keyof typeof borderWidths];
          if (val != null) {
            return {
              macroValues: [{key: mappedProp, value: val}]
            };
          }
          return null;
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;
    case 'borderColor':
    // We don't have individual border side colors anymore.
    // TODO: do we need them?
    // case 'borderStartColor':
    // case 'borderEndColor':
    // case 'borderTopColor':
    // case 'borderBottomColor':
    // case 'borderXColor':
    // case 'borderYColor':
    case 'backgroundColor':
      if (element === 'View') {
        if (value.type === 'StringLiteral') {
          let color = convertColor(prop, value.value, colorVersion);
          if (color != null) {
            return {
              macroValues: [{key: mappedProp, value: color}]
            };
          }
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
        return null;
      }
      break;
    case 'borderRadius':
    case 'borderTopStartRadius':
    case 'borderTopEndRadius':
    case 'borderBottomStartRadius':
    case 'borderBottomEndRadius':
      if (element === 'View') {
        if (value.type === 'StringLiteral') {
          let val = borderRadius[value.value as keyof typeof borderRadius];
          if (val != null) {
            return {
              macroValues: [{key: mappedProp, value: val}]
            };
          }
          return null;
        } else if (value.type === 'ObjectExpression') {
          return getResponsiveValue(prop, value, element, colorVersion);
        }
      }
      break;
    default:
      return;
  }
}

const breakpoints = {
  base: 'default',
  S: 'sm',
  M: 'md',
  L: 'lg'
};

function getResponsiveValue(prop: string, value: namedTypes.ObjectExpression, element: string, colorVersion: number | null): StylePropValue | null | undefined {
  let res: Record<string, any> = {};
  let custom: any[] = [];
  for (let property of value.properties) {
    if (property.type === 'ObjectProperty' && property.key.type === 'Identifier' && property.key.name in breakpoints) {
      let propertyValue = getPropValue(property.value);
      if (propertyValue && propertyValue.type !== 'ObjectExpression') {
        let val = getStylePropValue(prop, propertyValue, element, colorVersion, property.key.name);
        if (val && val.macroValues) {
          res[breakpoints[property.key.name as keyof typeof breakpoints]] = val.macroValues[0].value;
        }

        if (val && val.dynamicValues) {
          custom.push(...val.dynamicValues);
        }

        continue;
      }
    }

    // Bail!
    return null;
  }

  return {
    macroValues: [{
      key: prop,
      value: res
    }],
    dynamicValues: custom
  };
}

function addComment(path: ASTPath<namedTypes.Node>, comment: string) {
  if (!path.value.comments) {
    path.value.comments = [];
  }
  path.get('comments').push(j.line(comment, true, false));
}

function handleProp(
  path: ASTPath<namedTypes.JSXAttribute>,
  element: string,
  colorVersion: number | null
) {
  let node = path.value;
  if (node.name.type !== 'JSXIdentifier') {
    return;
  }

  let prop = node.name.name;
  let nodeValue = node.value;
  if (nodeValue == null) {
    nodeValue = {type: 'BooleanLiteral', value: true};
  }

  let propValue = getPropValue(nodeValue);
  if (!propValue) {
    return;
  }

  switch (prop) {
    case 'UNSAFE_style':
      if (propValue.type === 'ObjectExpression') {
        let value = transformUnsafeStyle(propValue, element);
        if (value) {
          path.prune();
          return value;
        }
      }
      addComment(path, ' TODO: check this UNSAFE_style');
      break;
    case 'UNSAFE_className':
      if (element === 'Flex' || element === 'Grid' || element === 'View') {
        path.get('name').replace(j.identifier('className'));
      } else {
        addComment(path, ' TODO: check this UNSAFE_className');
      }
      break;
    default: {
      let value = getStylePropValue(prop, propValue, element, colorVersion);
      if (value) {
        path.prune();
        return value;
      } else if (value === null) {
        // Found a value we couldn't handle.
        addComment(path, ' TODO: update this style prop');
      }
    }
  }
}

export function transformStyleProps(j: API['jscodeshift'], path: ASTPath<namedTypes.JSXElement>, element: string) {
  let macroValues = new Map<string, object | string | number | boolean>;
  let dynamicValues = new Map<string, namedTypes.ObjectProperty['value']>;
  let conditions = new Map<string, namedTypes.ObjectProperty['value']>;

  let isDOMElement = element === 'Flex' || element === 'Grid' || element === 'View';
  if (element === 'Flex') {
    macroValues.set('display', 'flex');
  } else if (element === 'Grid') {
    macroValues.set('display', 'grid');
  }

  let attributes = path.get('openingElement').get('attributes');
  let attrs: ASTPath<namedTypes.JSXAttribute | namedTypes.JSXSpreadAttribute>[] = [];
  for (let i = 0; i < attributes.value.length; i++) {
    let path = attributes.get(i);
    attrs.push(path);
  }

  // Find the color version in use.
  let colorVersion: number | null = 5;
  if (element === 'View') {
    for (let i = attrs.length - 1; i >= 0; i--) {
      let attr = attrs[i];
      if (attr.value.type === 'JSXAttribute' && attr.value.name.name === 'colorVersion') {
        let value = getPropValue(attr.value.value);
        if (value?.type === 'NumericLiteral') {
          colorVersion = value.value;
        } else {
          colorVersion = null;
        }
        attr.prune();
        attrs.splice(i, 1);
      } else if (attr.value.type === 'JSXSpreadAttribute') {
        // Bail. colorVersion could be set by spread.
        colorVersion = null;
      }
    }
  }

  for (let path of attrs) {
    if (path.value.type === 'JSXAttribute') {
      let value = handleProp(path as ASTPath<namedTypes.JSXAttribute>, element, colorVersion);
      if (value) {
        for (let val of value.macroValues) {
          macroValues.set(val.key, val.value);
        }
        if (value.dynamicValues) {
          for (let val of value.dynamicValues) {
            dynamicValues.set(val.key, val.value);
          }
        }
        if (value.conditions) {
          for (let val of value.conditions) {
            conditions.set(val.key, val.value);
          }
        }
      }
    } else if (path.value.type === 'JSXSpreadAttribute') {
      if (!path.value.comments) {
        path.value.comments = [];
      }
      path.get('comments').push(j.line(' TODO: check this spread for style props', true, false));
    }
  }

  // Change View/Flex/Grid to div.
  if (isDOMElement) {
    path.get('openingElement').get('name').replace(j.jsxIdentifier('div'));
    if (path.value.closingElement) {
      path.get('closingElement').get('name').replace(j.jsxIdentifier('div'));
    }
  }

  let hasMacros = false;
  let usedLightDark = false;
  if (macroValues.size) {
    hasMacros = true;
    let classNameAttribute;
    if (isDOMElement) {
      let index = path.value.openingElement.attributes?.findIndex(a => a.type === 'JSXAttribute' && a.name.name === 'className');
      if (index != null && index >= 0) {
        classNameAttribute = path.get('openingElement').get('attributes').get(index);
      }
    }

    let valueToAST = (v: object | string | number | boolean): kinds.ExpressionKind => {
      if (Array.isArray(v)) {
        return j.arrayExpression(v.map(v => valueToAST(v)));
      } else if (typeof v === 'object') {
        if ('default' in v && typeof v.default === 'string' && 'dark' in v && typeof v.dark === 'string') {
          usedLightDark = true;
          return j.callExpression(j.identifier('lightDark'), [j.stringLiteral(v.default), j.stringLiteral(v.dark)]);
        }
        return j.objectExpression(Object.entries(v).map(([k, v]) => j.objectProperty(j.identifier(k), valueToAST(v))));
      } else {
        return j.literal(v);
      }
    };

    // Generate macro call.
    let macroCall = j.callExpression(
      j.callExpression(
        j.identifier('style'),
        [
          j.objectExpression(
            [...macroValues].map(([k, v]) => {
              return j.property('init', j.identifier(k), valueToAST(v));
            })
          )
        ]
      ),
      conditions.size
        ? [j.objectExpression(
          [...conditions].map(([k, v]) => j.objectProperty.from({key: j.identifier(k), value: v, shorthand: v.type === 'Identifier' && v.name === k}))
        )]
        : []
    );

    if (classNameAttribute) {
      classNameAttribute.get('value').replace(
        j.jsxExpressionContainer(
          j.binaryExpression('+', getPropValue(classNameAttribute.value.value)!, macroCall)
        )
      );
    } else {
      path.get('openingElement').get('attributes').push(
        j.jsxAttribute(
          j.jsxIdentifier(isDOMElement ? 'className' : 'css'),
          j.jsxExpressionContainer(macroCall)
        )
      );
    }
  }

  if (dynamicValues.size) {
    path.get('openingElement').get('attributes').push(
      j.jsxAttribute(
        j.jsxIdentifier('style'),
        j.jsxExpressionContainer(
          j.objectExpression(
            [...dynamicValues].map(([key, value]) =>
              j.objectProperty(key.startsWith('--') ? j.stringLiteral(key) : j.identifier(key), value)
            )
          )
        )
      )
    );
  }

  return {hasMacros, usedLightDark};
}
