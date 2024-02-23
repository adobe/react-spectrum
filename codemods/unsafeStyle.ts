import {namedTypes} from 'ast-types';
import {convertUnsafeStyleColor} from './colors';
import {StylePropValue, borderRadius, borderWidths} from './styleProps';
import {convertUnsafeDimension} from './dimensions';
import {capitalize, nameFromExpression} from './utils';

export function transformUnsafeStyle(
  value: namedTypes.ObjectExpression,
  element: string
): StylePropValue | null {
  let res: StylePropValue = {
    macroValues: [],
    dynamicValues: [],
    conditions: []
  };

  for (let property of value.properties) {
    if (property.type === 'ObjectProperty' && property.key.type === 'Identifier') {
      let prop = propertyMapping[property.key.name as keyof typeof propertyMapping] || property.key.name;
      if (property.value.type === 'ConditionalExpression') {
        let consequent = handleProperty(element, property.key.name, property.value.consequent);
        let alternate = handleProperty(element, property.key.name, property.value.alternate);
        if (consequent && alternate) {
          let test = property.value.test;
          // eslint-disable-next-line max-depth
          if (test.type === 'BinaryExpression' && test.operator === '===' && test.left.type === 'Identifier' && test.right.type === 'StringLiteral') {
            res.macroValues.push({
              key: prop,
              value: {default: alternate, [test.left.name]: {[test.right.value]: consequent}}
            });
            res.conditions?.push({
              key: test.left.name,
              value: test.left
            });
          } else {
            let condition = nameFromExpression(test) || `isCondition${res.conditions!.length}`;
            // eslint-disable-next-line max-depth
            if (!/^is[A-Z]/.test(condition)) {
              condition = `is${capitalize(condition)}`;
            }
            res.macroValues.push({
              key: prop,
              value: {default: alternate, [condition]: consequent}
            });
            res.conditions?.push({
              key: condition,
              value: test
            });
          }
          continue;
        }
      }

      let value = handleProperty(element, prop, property.value);
      if (value != null) {
        res.macroValues.push({key: prop, value});
      } else {
        res.dynamicValues?.push({key: prop, value: property.value});
      }
    } else {
      // Bail
      return null;
    }
  }

  return res;
}

const propertyMapping = {
  background: 'backgroundColor',
  borderInlineStartWidth: 'borderStartWidth',
  borderInlineEndWidth: 'borderEndWidth',
  borderInlineWidth: 'borderXWidth',
  borderBlockWidth: 'borderYWidth',
  borderLeftWidth: 'borderStartWidth',
  borderRightWidth: 'borderEndWidth',
  marginInlineStart: 'marginStart',
  marginInlineEnd: 'marginEnd',
  marginInline: 'marginX',
  marginBlock: 'marginY',
  marginLeft: 'marginStart',
  marginRight: 'marginEnd',
  paddingInlineStart: 'paddingStart',
  paddingInlineEnd: 'paddingEnd',
  paddingInline: 'paddingX',
  paddingBlock: 'paddingY',
  paddingLeft: 'paddingStart',
  paddingRight: 'paddingEnd',
  insetInlineStart: 'insetStart',
  insetInlineEnd: 'insetEnd',
  borderStartStartRadius: 'borderTopStartRadius',
  borderStartEndRadius: 'borderTopEndRadius',
  borderEndStartRadius: 'borderBottomStartRadius',
  borderEndEndRadius: 'borderBottomEndRadius'
};

function handleProperty(element: string, property: string, value: namedTypes.ObjectProperty['value']) {
  switch (property) {
    case 'color':
    case 'background':
    case 'backgroundColor':
    case 'borderColor':
    case 'outlineColor':
    case 'fill':
    case 'stroke': {
      if ((element === 'View' || element === 'Flex' || element === 'Grid') && value.type === 'StringLiteral') {
        return convertUnsafeStyleColor(property, value.value);
      }
      break;
    }
    case 'borderWidth':
    case 'borderInlineStartWidth':
    case 'borderInlineEndWidth':
    case 'borderInlineWidth':
    case 'broderBlockWidth':
    case 'borderLeftWidth':
    case 'borderRightWidth':
    case 'borderTopWidth':
    case 'borderBottomWidth':
      if (element === 'View' || element === 'Flex' || element === 'Grid') {
        if (value.type === 'NumericLiteral' && value.value >= 0 && value.value <= 4) {
          return value.value;
        } else if (value.type === 'StringLiteral') {
          if (/^[0-4]px$/.test(value.value)) {
            return parseInt(value.value, 10);
          }
          let m = value.value.match(/^var\(--spectrum-alias-border-size-(.+)\)$/);
          if (m) {
            return borderWidths[m[1] as keyof typeof borderWidths];
          }
        }
      }
      break;
    case 'borderStartStartRadius':
    case 'borderStartEndRadius':
    case 'borderEndStartRadius':
    case 'borderEndEndRadius':
    case 'borderRadius':
      if (element === 'View' || element === 'Flex' || element === 'Grid') {
        if (value.type === 'StringLiteral' && /^[0-4]px$/.test(value.value)) {
          value = {type: 'NumericLiteral', value: parseInt(value.value, 10)};
        }
        if (value.type === 'NumericLiteral') {
          switch (value.value) {
            case 0: return 'none';
            case 2: return 'sm';
            case 4: return 'default';
            case 8: return 'lg';
            case 16: return 'xl';
            default: return `[${value.value}px]`;
          }
        } else if (value.type === 'StringLiteral') {
          let m = value.value.match(/^var\(--spectrum-alias-border-radius-(.+)\)$/);
          if (m) {
            return borderRadius[m[1] as keyof typeof borderRadius];
          }
        }
      }
      break;
    case 'width':
    case 'minWidth':
    case 'maxWidth':
    case 'height':
    case 'minHeight':
    case 'maxHeight':
    case 'margin':
    case 'marginInlineStart':
    case 'marginInlineEnd':
    case 'marginInline':
    case 'marginBlock':
    case 'marginLeft':
    case 'marginRight':
    case 'marginTop':
    case 'marginBottom':
    case 'top':
    case 'bottom':
    case 'left':
    case 'right':
    case 'insetInlineStart':
    case 'insetInlineEnd':
    case 'flexBasis': {
      if (value.type === 'NumericLiteral' || value.type === 'StringLiteral') {
        return convertUnsafeDimension(value.value);
      }
      break;
    }
    case 'padding':
    case 'paddingInlineStart':
    case 'paddingInlineEnd':
    case 'paddingInline':
    case 'paddingBlock':
    case 'paddingLeft':
    case 'paddingRight':
    case 'paddingTop':
    case 'paddingBottom':
    case 'gap':
    case 'rowGap':
    case 'columnGap': {
      if (element === 'View' || element === 'Flex' || element === 'Grid') {
        if (value.type === 'NumericLiteral' || value.type === 'StringLiteral') {
          return convertUnsafeDimension(value.value);
        }
      }
      break;
    }
    case 'fontSize': {
      if (element === 'View' || element === 'Flex' || element === 'Grid') {
        if (value.type === 'StringLiteral' && /^[0-4]px$/.test(value.value)) {
          value = {type: 'NumericLiteral', value: parseInt(value.value, 10)};
        }
        if (value.type === 'NumericLiteral') {
          switch (value.value) {
            case 11: return 'xs';
            case 12: return 'sm';
            case 14: return 'base';
            case 16: return 'lg';
            case 18: return 'xl';
            case 20: return '2xl';
            case 22: return '3xl';
            default: return `[${value.value / 16}rem]`;
          }
        } else if (value.type === 'StringLiteral') {
          let m = value.value.match(/^var\(--spectrum-global-dimension-font-size-(.+)\)$/);
          if (m) {
            switch (m[1]) {
              case '25': return `[${10 / 16}rem]`;
              case '50': return 'xs';
              case '75': return 'sm';
              case '100': return 'base';
              case '150': return `[${15 / 16}rem]`;
              case '200': return 'lg';
              case '300': return 'xl';
              case '400': return '2xl';
              case '500': return '3xl';
              case '600': return `[${25 / 16}rem]`;
              case '700': return `[${28 / 16}rem]`;
              case '800': return `[${32 / 16}rem]`;
              case '900': return `[${36 / 16}rem]`;
              case '1000': return `[${40 / 16}rem]`;
              case '1100': return `[${45 / 16}rem]`;
              case '1200': return `[${50 / 16}rem]`;
              case '1300': return `[${60 / 16}rem]`;
            }
          }
        }
      }
      break;
    }
    case 'fontWeight':
      if (element === 'View' || element === 'Flex' || element === 'Grid') {
        if (value.type === 'StringLiteral') {
          let m = value.value.match(/^var\(--spectrum-global-font-weight-(.+)\)$/);
          if (m) {
            switch (m[1]) {
              case 'thin':
              case 'light':
              case 'medium':
              case 'bold':
              case 'black':
                return m[1];
              case 'ultra-light':
                return 'extralight';
              case 'regular':
                return 'normal';
              case 'semi-bold':
                return 'semibold';
              case 'extra-bold':
                return 'extrabold';
            }
          } else {
            switch (value.value) {
              case 'normal':
              case 'bold':
                return value.value;
            }
          }
        }
      }
      break;
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
    case 'gridRowStart': {
      if ((value.type === 'StringLiteral' && !/^(var|calc)\(/.test(value.value)) || value.type === 'NumericLiteral') {
        return value.value;
      }
      break;
    }
    case 'gridTemplateAreas': {
      if (element === 'Flex' || element === 'Grid' || element === 'View') {
        if (value.type === 'StringLiteral' && !value.value.startsWith('var(')) {
          let rows = value.value.match(/"(.+?)"/g);
          if (rows) {
            return rows.map(r => r.slice(1, -1));
          }
        }
      }
      break;
    }
    case 'display':
    case 'justifyContent':
    case 'alignContent':
    case 'alignItems':
    case 'justifyItems':
    case 'placeItems':
    case 'placeContent':
    case 'placeSelf':
    case 'flexDirection':
    case 'flexWrap':
    case 'flex':
    case 'gridAutoFlow':
    case 'gridAutoRows':
    case 'gridAutoColumns':
    case 'gridTemplateColumns':
    case 'gridTemplateRows':
    case 'float':
    case 'clear':
    case 'contain':
    case 'boxSizing':
    case 'tableLayout':
    case 'captionSide':
    case 'borderCollapse':
    case 'overflow':
    case 'overflowX':
    case 'overflowY':
    case 'overscrollBehavior':
    case 'overscrollBehaviorX':
    case 'overscrollBehaviorY':
    case 'scrollBehavior':
    case 'pointerEvents':
    case 'touchAction':
    case 'userSelect':
    case 'visibility':
    case 'isolation':
    case 'transformOrigin':
    case 'cursor':
    case 'resize':
    case 'scrollSnapType':
    case 'scrollSnapAlign':
    case 'scrollSnapStop':
    case 'appearance':
    case 'objectFit':
    case 'objectPosition':
    case 'willChange':
    case 'rotate':
    case 'scale':
    case 'transform':
    case 'borderStyle':
    case 'fontStyle':
    case 'listStyleType':
    case 'listStylePosition':
    case 'textTransform':
    case 'textAlign':
    case 'verticalAlign':
    case 'textDecoration':
    case 'textOverflow':
    case 'hyphens':
    case 'whiteSpace':
    case 'textWrap':
    case 'wordBreak':
    case 'boxDecorationBreak':
    case 'forcedColorAdjust':
    case 'backgroundPosition':
    case 'backgroundSize':
    case 'backgroundAttachment':
    case 'backgroundClip':
    case 'backgroundRepeat':
    case 'backgroundOrigin':
    case 'backgroundBlendMode':
    case 'mixBlendMode':
    case 'opacity':
    case 'outlineStyle':
    case 'animationDirection':
    case 'animationFillMode':
    case 'animationTimingFunction':
    case 'animationDelay':
    case 'transitionTimingFunction':
    case 'transitionDelay': {
      if (element === 'Flex' || element === 'Grid' || element === 'View') {
        if ((value.type === 'StringLiteral' && !/^(var|calc)\(/.test(value.value)) || value.type === 'NumericLiteral') {
          return value.value;
        }
      }
      break;
    }
    case 'animationDuration':
    case 'transitionDuration': {
      if (element === 'Flex' || element === 'Grid' || element === 'View') {
        if (value.type === 'StringLiteral') {
          let m = value.value.match(/^var\(--spectrum-global-animation-duration-(.+)\)$/);
          if (m) {
            switch (m[1]) {
              case '0': return 0;
              case '100': return 130;
              case '200': return 160;
              case '300': return 190;
              case '400': return 220;
              case '500': return 250;
              case '600': return 300;
              case '700': return 350;
              case '800': return 400;
              case '900': return 450;
              case '1000': return 500;
              case '2000': return 1000;
              case '4000': return 2000;
            }
          } else if (/^\d+(s|ms)$/.test(value.value)) {
            return value.value;
          }
        } else if (value.type === 'NumericLiteral') {
          return value.value;
        }
      }
    }
  }
}
