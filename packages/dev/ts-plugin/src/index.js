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

const tokens = require('@adobe/spectrum-tokens/dist/json/variables.json');
const Color = require('colorjs.io').default;

function getColor(rgb) {
  return {
    rgb,
    hex: new Color(rgb).toString({format: 'hex'})
  }
}

function colorToken(token) {
  return {
    light: getColor(token.sets.light.value),
    dark: getColor(token.sets.dark.value)
  };
}

function colorScale(scale) {
  let res = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token.replace('-color', '')] = colorToken(tokens[token]);
    }
  }
  return res;
}

const s2Colors = {
  ...colorScale('gray'),
  ...colorScale('blue'),
  ...colorScale('red'),
  ...colorScale('orange'),
  ...colorScale('yellow'),
  ...colorScale('chartreuse'),
  ...colorScale('celery'),
  ...colorScale('green'),
  ...colorScale('seafoam'),
  ...colorScale('cyan'),
  ...colorScale('indigo'),
  ...colorScale('purple'),
  ...colorScale('fuchsia'),
  ...colorScale('magenta'),
  ...colorScale('pink'),
  ...colorScale('turquoise'),
  ...colorScale('brown'),
  ...colorScale('silver'),
  ...colorScale('cinnamon'),
};

const createSquare = (fill) => {
  const svg = `<svg width="10" height="10" xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10" x="0" y="0" fill="${fill}" /></svg>`;
  return `![Image](data:image/svg+xml;base64,${btoa(svg)})`;
};

module.exports = function (modules) {
  /** @type {import('typescript')} */
  let ts = modules.typescript;

  /** @param info {import('typescript').server.PluginCreateInfo} */
  function create(info) {
    const proxy = Object.create(null);
    for (let k of Object.keys(info.languageService)) {
      const x = info.languageService[k];
      proxy[k] = (...args) => x.apply(info.languageService, args);
    }

    proxy.getCompletionEntryDetails = (...args) => {
      let result = info.languageService.getCompletionEntryDetails(...args);
      if (!result.codeActions) {
        return result;
      }

      // Override auto import of style macro to add `with {type: 'macro'}` automatically.
      for (let action of result.codeActions) {
        for (let change of action.changes) {
          for (let textChange of change.textChanges) {
            if (change.fileName.includes('@react-spectrum/s2')) {
              // For files inside S2 itself, import specifier will be '../style', not '@react-spectrum/s2/style'.
              textChange.newText = textChange.newText.replace(/(import\s*\{.*?\}\s*from\s*['"]\.\.\/style['"]);/g, '$1 with {type: \'macro\'};');
            } else {
              textChange.newText = textChange.newText.replace(/(import\s*\{.*?\}\s*from\s*['"]@react-spectrum\/s2\/style['"]);/g, '$1 with {type: \'macro\'};');
            }
          }
        }
      }
      
      return result;
    };

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      let completions = info.languageService.getCompletionsAtPosition(fileName, position, options);
      let program = info.languageService.getProgram();
      let sourceFile = program.getSourceFile(fileName);

      let node = ts.getTokenAtPosition(sourceFile, position);
      if (ts.isStringLiteral(node)) {
        let kind = null;
        if (node.text.startsWith('#')) {
          kind = 'hex';
        } else if (node.text.startsWith('r')) {
          kind = 'rgb';
        }
        if (kind) {
          for (let name in s2Colors) {
            let token = s2Colors[name];
            completions.entries.unshift({
              kind: ts.ScriptElementKind.string,
              kindModifiers: '',
              name: token.light[kind],
              insertText: name,
              filterText: token.light[kind],
              labelDetails: {
                description: name + ' (light)'
              },
              replacementSpan: {
                start: node.pos + 2,
                length: node.text.length
              },
              sortText: token.light[kind]
            });
            completions.entries.unshift({
              kind: ts.ScriptElementKind.string,
              kindModifiers: '',
              name: token.dark[kind],
              insertText: name,
              filterText: token.dark[kind],
              labelDetails: {
                description: name + ' (dark)'
              },
              replacementSpan: {
                start: node.pos + 2,
                length: node.text.length
              },
              sortText: token.dark[kind]
            });
          }
        } else if (node.text === '') {
          completions.isIncomplete = true;
        }

        completions.entries = completions.entries.map(e => {
          if (s2Colors.hasOwnProperty(e.name)) {
            return {
              ...e,
              labelDetails: {
                description: s2Colors[e.name].light.hex
              }
            }
          }
          return e;
        });
      }
      // console.log('DEVON', completions);
      // debugger;
      return completions;
    };

    proxy.getCompletionEntryDetails = (fileName, position, entryName, formatOptions, source, preferences, data) => {
      if (s2Colors.hasOwnProperty(entryName)) {
        return {
          name: entryName,
          kind: ts.ScriptElementKind.string,
          kindModifiers: '',
          displayParts: [{kind: 'text', text: entryName}],
          documentation: [getDocs(entryName)]
        };
      }

      for (let name in s2Colors) {
        if (entryName === s2Colors[name].light.hex || entryName === s2Colors[name].light.rgb || entryName === s2Colors[name].dark.hex || entryName === s2Colors[name].dark.rgb) {
          return {
            name: entryName,
            kind: ts.ScriptElementKind.string,
            kindModifiers: '',
            displayParts: [{kind: 'text', text: name}],
            documentation: [getDocs(name)]
          };
        }
      }

      return info.languageService.getCompletionEntryDetails(fileName, position, entryName, formatOptions, source, preferences, data);
    };

    proxy.getQuickInfoAtPosition = (fileName, position) => {
      let quickInfo = info.languageService.getQuickInfoAtPosition(fileName, position);
      let program = info.languageService.getProgram();
      let sourceFile = program.getSourceFile(fileName);

      let node = ts.getTokenAtPosition(sourceFile, position);
      if (ts.isStringLiteral(node) && s2Colors.hasOwnProperty(node.text)) {
        return {
          kind: ts.ScriptElementKind.string,
          kindModifiers: '',
          textSpan: {
            start: node.pos + 1,
            length: node.getText().length
          },
          displayParts: [],
          documentation: [getDocs(node.text, true)]
        };
      }

      return quickInfo;
    };

    function getDocs(color, includeName = false) {
      return {
        kind: 'markdown',
        text: (includeName ? color + '\n\n' : '') + 'light: ' + createSquare(s2Colors[color].light.hex) + ' ' + s2Colors[color].light.hex + '\n\ndark: ' + createSquare(s2Colors[color].dark.hex) + ' ' + s2Colors[color].dark.hex
      }
    };

    return proxy;
  }

  return {create};
};
