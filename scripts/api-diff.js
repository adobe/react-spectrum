/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const rainbowAPI = require('../dist/branch-api/@react-spectrum/s2/dist/api.json');
const v3API = {
  exports: {},
  links: {}
};

function merge(api) {
  Object.assign(v3API.exports, api.exports);
  Object.assign(v3API.links, api.links);
}

merge(require('../dist/branch-api/@react-spectrum/badge/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/button/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/avatar/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/breadcrumbs/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/buttongroup/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/checkbox/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/color/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/combobox/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/contextualhelp/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/dialog/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/divider/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/dropzone/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/form/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/illustratedmessage/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/inlinealert/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/link/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/menu/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/meter/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/numberfield/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/picker/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/progress/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/provider/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/radio/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/searchfield/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/slider/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/statuslight/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/switch/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/tabs/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/tag/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/textfield/dist/api.json'));
merge(require('../dist/branch-api/@react-spectrum/tooltip/dist/api.json'));

const styleProps = new Set(['margin', 'marginStart', 'marginEnd', 'marginTop', 'marginBottom', 'marginX', 'marginY', 'width', 'height', 'minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'flex', 'flexGrow', 'flexShrink', 'flexBasis', 'justifySelf', 'alignSelf', 'order', 'gridArea', 'gridColumn', 'gridRow', 'gridColumnStart', 'gridColumnEnd', 'gridRowStart', 'gridRowEnd', 'position', 'zIndex', 'top', 'bottom', 'start', 'end', 'left', 'right', 'isHidden']);
const skipStyleProps = process.argv.includes('--skip-style-props');
const skipSame = process.argv.includes('--skip-same');
let depth = 0;

let res = '';
for (let name in v3API.exports) {
  let v3 = v3API.exports[name];
  if (v3.type !== 'component') {
    continue;
  }

  let rainbow = rainbowAPI.exports[name];
  if (!rainbow || rainbow.type !== 'component') {
    console.log('skip', name);
    continue;
  }

  res += `## ${name}\n\n`;
  res += '| Prop | Spectrum 2 | RSP v3 | Comments |\n';
  res += '|------|------------|--------|----------|\n';

  let v3Props = v3.props;
  if (v3Props.type === 'identifier' && v3API.exports[v3Props.name]) {
    v3Props = v3API.exports[v3Props.name];
  }
  if (v3Props.type !== 'interface') {
    console.log('skipping', name, v3Props);
    continue;
  }
  let rainbowProps = rainbow.props;
  if (rainbowProps.type !== 'interface') {
    console.log(rainbowProps);
    continue;
  }
  for (let prop in rainbowProps.properties) {
    if (skipStyleProps && prop === 'styles') {
      continue;
    }
    let v3Value = v3Props.properties[prop]?.value;
    let v3Rendered = v3Value ? processType(v3Value).replace(/\n/g, '<br>') : '';
    let rainbowValue = rainbowProps.properties[prop]?.value;
    let rainbowRendered = rainbowValue ? processType(rainbowValue).replace(/\n/g, '<br>') : '';

    if (v3Rendered && rainbowRendered) {
      if (v3Rendered !== rainbowRendered) {
        v3Rendered = '🔴 `' + v3Rendered + '`';
        rainbowRendered = '🟢 `' + rainbowRendered + '`';
      } else {
        // eslint-disable-next-line max-depth
        if (skipSame) {
          continue;
        }
        v3Rendered = '`' + v3Rendered + '`';
        rainbowRendered = '`' + rainbowRendered + '`';
      }
    } else if (v3Rendered && !rainbowRendered) {
      v3Rendered = '🔴 `' + v3Rendered + '`';
    } else if (rainbowRendered && !v3Rendered) {
      rainbowRendered = '🟢 `' + rainbowRendered + '`';
    } else {
      if (skipSame) {
        continue;
      }
      v3Rendered = '`' + v3Rendered + '`';
      rainbowRendered = '`' + rainbowRendered + '`';
    }

    res += `| ${prop} | ${rainbowRendered || '–'} | ${v3Rendered || '–'} | |\n`;
  }

  for (let prop in v3Props.properties) {
    if (!rainbowProps.properties[prop]) {
      if (skipStyleProps && styleProps.has(prop)) {
        continue;
      }
      res += `| ${prop} | – | ${'🔴 `' + processType(v3Props.properties[prop]?.value).replace(/\n/g, '<br>') + '`'} | |\n`;
    }
  }
}

require('fs').writeFileSync('packages/@react-spectrum/s2/api-diff.md', res);

function processType(value) {
  if (!value) {
    console.trace('UNTYPED', value);
    return 'UNTYPED';
  }
  if (Object.keys(value).length === 0) {
    return '{}';
  }
  if (value.type === 'any') {
    return 'any';
  }
  if (value.type === 'null') {
    return 'null';
  }
  if (value.type === 'undefined') {
    return 'undefined';
  }
  if (value.type === 'void') {
    return 'void';
  }
  if (value.type === 'unknown') {
    return 'unknown';
  }
  if (value.type === 'never') {
    return 'never';
  }
  if (value.type === 'this') {
    return 'this';
  }
  if (value.type === 'symbol') {
    return 'symbol';
  }
  if (value.type === 'identifier') {
    return value.name;
  }
  if (value.type === 'string') {
    if (value.value) {
      return `'${value.value}'`;
    }
    return 'string';
  }
  if (value.type === 'number') {
    return 'number';
  }
  if (value.type === 'boolean') {
    return 'boolean';
  }
  if (value.type === 'union') {
    return value.elements.map(processType).sort().join(' \\| ');
  }
  if (value.type === 'intersection') {
    return `(${value.types.map(processType).sort().join(' & ')})`;
  }
  if (value.type === 'application') {
    let name = value.base.name;
    if (!name) {
      name = processType(value.base);
    }
    return `${name}<${value.typeParameters.map(processType).join(', ')}>`;
  }
  if (value.type === 'typeOperator') {
    return `${value.operator} ${processType(value.value)}`;
  }
  if (value.type === 'function') {
    return `(${value.parameters.map(processType).join(', ')}) => ${value.return ? processType(value.return) : 'void'}`;
  }
  if (value.type === 'parameter') {
    return processType(value.value);
  }
  if (value.type === 'link' && value.id) {
    let name = value.id.substr(value.id.lastIndexOf(':') + 1);
    // if (dependantOnLinks.has(currentlyProcessing)) {
    //   let foo = dependantOnLinks.get(currentlyProcessing);
    //   if (!foo.includes(name)) {
    //     foo.push(name);
    //   }
    // } else {
    //   dependantOnLinks.set(currentlyProcessing, [name]);
    // }
    return name;
  }
  // interface still needed if we have it at top level?
  if (value.type === 'object') {
    if (value.properties) {
      return `${value.exact ? '{\\' : '{'}
  ${Object.values(value.properties).map(property => {
    depth += 2;
    let result = ' '.repeat(depth);
    result = `${result}${property.indexType ? '[' : ''}${property.name}${property.indexType ? `: ${processType(property.indexType)}]` : ''}${property.optional ? '?' : ''}: ${processType(property.value)}`;
    depth -= 2;
    return result;
  }).join('\n')}
${value.exact ? '\\}' : '}'}`;
    }
    return '{}';
  }
  if (value.type === 'alias') {
    return processType(value.value);
  }
  if (value.type === 'array') {
    return `Array<${processType(value.elementType)}>`;
  }
  if (value.type === 'tuple') {
    return `[${value.elements.map(processType).join(', ')}]`;
  }
  if (value.type === 'typeParameter') {
    let typeParam = value.name;
    if (value.constraint) {
      typeParam = typeParam + ` extends ${processType(value.constraint)}`;
    }
    if (value.default) {
      typeParam = typeParam + ` = ${processType(value.default)}`;
    }
    return typeParam;
  }
  if (value.type === 'component') {
    let props = value.props;
    if (props.type === 'application') {
      props = props.base;
    }
    if (props.type === 'link') {
      // create links provider
      // props = links[props.id];
    }
    return processType(props);
  }
  if (value.type === 'conditional') {
    return `${processType(value.checkType)} extends ${processType(value.extendsType)} ? ${processType(value.trueType)}${value.falseType.type === 'conditional' ? ' :\n' : ' : '}${processType(value.falseType)}`;
  }
  if (value.type === 'indexedAccess') {
    return `${processType(value.objectType)}[${processType(value.indexType)}]`;
  }
  if (value.type === 'keyof') {
    return `keyof ${processType(value.keyof)}`;
  }
  console.log('unknown type', value);
}
