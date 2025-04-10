/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */


let rspProject = 'React Spectrum v3';
let otherProject = 'other';

module.exports = function (plop) {
  
  const currentYear = new Date(Date.now()).getUTCFullYear();
  plop.setHelper('currentYear', () => currentYear);

  plop.setHelper('replace', function (match, replacement, options) {
    let string = options.fn(this);
    return string.replace(match, replacement);
  });

  plop.setHelper('includes', function (array, string) {
    return array.includes(string);
  });

  // controller generator
  plop.setGenerator('component', {
    description: 'add new component',
    prompts: [{
      type: 'list',
      name: 'projectType',
      message: 'what type of project are you setting up',
      choices: [rspProject, otherProject]
    }, {
      type: 'checkbox',
      name: 'scopes',
      message: 'scope name(s)',
      choices: ['@react-aria', '@react-spectrum', '@react-stately', '@react-types'],
      validate: (answer) => answer.length > 0,
      when: ({projectType}) => projectType === rspProject
    }, {
      type: 'input',
      name: 'scopeName',
      message: 'scope name for new package',
      validate: (answer) => answer.length > 0,
      when: ({projectType}) => projectType === otherProject
    }, {
      type: 'input',
      name: 'packageName',
      message: 'package name, all lowercase (e.g. textfield)',
      validate: (answer) => answer.length > 0
    }, {
      type: 'input',
      name: 'componentName',
      message: 'component name, please use appropriate uppercase (e.g. TextField)',
      validate: (answer) => answer.length > 0,
      when: ({projectType}) => projectType === rspProject
    }, {
      type: 'input',
      name: 'componentCSS',
      message: 'component css module name, blank if N/A. If unsure, check @adobe/spectrum-css-temp/components for a module containing the desired css (e.g. textfield)',
      validate: (answer) => answer.length >= 0,
      default: null,
      when: ({projectType, scopes}) => projectType === rspProject && scopes.includes('@react-spectrum')
    }],
    actions: function (data) {
      let {projectType, scopes, scopeName, packageName, componentName, componentCSS} = data;
      let actions = [];

      if (projectType === rspProject) {
        if (scopes.includes('@react-aria')) {
          actions.push({
            type: 'addMany',
            templateFiles: '../plop-templates/@react-aria-nutrient/**',
            base: '../plop-templates/@react-aria-nutrient/',
            destination: `../packages/@react-aria/${packageName}`,
            data: {componentName, scopes}
          });
        }

        if (scopes.includes('@react-spectrum')) {
          actions.push({
            type: 'addMany',
            templateFiles: '../plop-templates/@react-spectrum/**',
            base: '../plop-templates/@react-spectrum/',
            destination: `../packages/@react-spectrum/${packageName}`,
            data: {packageName, componentName, componentCSS, scopes}
          });
        }

        if (scopes.includes('@react-stately')) {
          actions.push({
            type: 'addMany',
            templateFiles: '../plop-templates/@react-stately/**',
            base: '../plop-templates/@react-stately/',
            destination: `../packages/@react-stately/${packageName}`,
            data: {packageName, componentName, scopes}
          });
        }

        if (scopes.includes('@react-types')) {
          actions.push({
            type: 'addMany',
            templateFiles: '../plop-templates/@react-types/**',
            base: '../plop-templates/@react-types/',
            destination: `../packages/@react-types/${packageName}`,
            data: {packageName, componentName, scopes}
          });
        }
      } else {
        actions.push({
          type: 'addMany',
          templateFiles: '../plop-templates/@scope/**',
          base: '../plop-templates/@scope/',
          destination: `../packages/@${scopeName}/${packageName}`,
          data: {scopeName, packageName, componentName}
        });
      }

      return actions;
    }
  });
};
