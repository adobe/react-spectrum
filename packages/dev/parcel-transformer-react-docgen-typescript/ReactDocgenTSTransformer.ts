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

import {generateDocgenCodeBlock} from 'react-docgen-typescript-plugin/dist/generateDocgenCodeBlock';
import path from 'path';
import {Transformer} from '@parcel/plugin';
import ts from 'typescript';
import {withCompilerOptions} from 'react-docgen-typescript';

let compilerOptions = {
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.CommonJS,
  target: ts.ScriptTarget.Latest
};

let {fileNames, options: tsOptions} = getTSConfigFile('./tsconfig.json');
compilerOptions = {
  ...compilerOptions,
  ...tsOptions
};

let program = ts.createProgram(fileNames, compilerOptions);
let excludedProps = new Set([
  'id',
  'slot',
  'onCopy',
  'onCut',
  'onPaste',
  'onCompositionStart',
  'onCompositionEnd',
  'onCompositionUpdate',
  'onSelect',
  'onBeforeInput',
  'onInput',
  'onKeyDown',
  'onKeyUp',
  'onHoverStart',
  'onHoverEnd',
  'onHoverChange',
  'onFocus',
  'onBlur',
  'onFocusChange',
  'onScroll'
]);
let docGenParser = withCompilerOptions(compilerOptions, {
  shouldExtractLiteralValuesFromEnum: true,
  shouldRemoveUndefinedFromOptional: true,
  propFilter: (prop) => !prop.name.startsWith('aria-') && !excludedProps.has(prop.name)
});

export default new Transformer({
  async transform({asset}) {
    let docs = docGenParser.parseWithProgramProvider(asset.filePath, () => program);
    if (!docs.length) {
      return [asset];
    }

    for (let doc of docs) {
      doc.props = Object.fromEntries(Object.entries(doc.props).sort(([, a], [, b]) => {
        if (a.required !== b.required) {
          return a.required ? -1 : 1;
        }
        if (a.parent?.fileName.includes('node_modules') !== b.parent?.fileName.includes('node_modules')) {
          return a.parent?.fileName.includes('node_modules') ? 1 : -1;
        }
        if (/^on[A-Z]/.test(a.name) !== /^on[A-Z]/.test(b.name)) {
          return /^on[A-Z]/.test(a.name) ? 1 : -1;
        }
        return a.name.localeCompare(b.name);
      }));
    }
    
    let code = await asset.getCode();
    code = generateDocgenCodeBlock({
      filename: asset.filePath,
      source: code,
      componentDocs: docs,
      setDisplayName: true,
      typePropName: 'type',
      docgenCollectionName: 'STORYBOOK_REACT_CLASSES'
    });
    
    asset.setCode(code);
    return [asset];
  }
});

// Based on https://github.com/hipstersmoothie/react-docgen-typescript-plugin
// MIT license.
function getTSConfigFile(tsconfigPath: string): ts.ParsedCommandLine {
  try {
    const basePath = path.dirname(tsconfigPath);
    const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);

    return ts.parseJsonConfigFileContent(
      configFile.config,
      ts.sys,
      basePath,
      {},
      tsconfigPath
    );
  } catch (error) {
    return {} as ts.ParsedCommandLine;
  }
}
