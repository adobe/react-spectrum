/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
var postcss = require('postcss');
var valueParser = require('postcss-value-parser');
var {mapping, static: staticVars} = require('./vars');

// match custom property inclusions
const customPropertiesRegExp = /(^|[^\w-])var\([\W\w]+\)/;

module.exports = postcss.plugin('postcss-custom-properties-mapping', function () {
  return function (root, result) {
    root.walkRules((rule, ruleIndex) => {
      rule.walkDecls((decl) => {
        if (customPropertiesRegExp.test(decl.value)) {
          let value = valueParser(decl.value);

          value.walk((node, index, nodes) => {
            if (node.type === 'function' && node.value === 'var') {
              let v = node.nodes[0].value;

              // If the value is static, replace the variable with the value.
              // Otherwise, change the variable name to the mapped name.
              if (staticVars[v]) {
                nodes.splice(index, 1, ...valueParser(`var(${v}, ${staticVars[v]})`).nodes);
              } else if (mapping[v]) {
                nodes.splice(index, 1, ...valueParser(`var(${v}, var(${mapping[v]}))`).nodes);
              }
            }
          });

          decl.value = value.toString();
        }
      });
    });
  }
});
