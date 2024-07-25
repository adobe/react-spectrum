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

module.exports = postcss.plugin('postcss-notnested', function (opts) {
  opts = opts || {};

  // Match ampersands at the start of a given selector
  var re = /^&/;

  return function (root, result) {
    root.walkRules((rule, ruleIndex) => {
      if (rule.selectors) {
        if (opts.replace) {
          var replaced = false;
          var selectors = rule.selectors.map(selector => {
            if (re.test(selector)) {
              replaced = true;
              // Handle special case where the replacement selector === the existing selector
              if (selector.replace(re, '') === opts.replace) {
                return opts.replace;
              }

              return selector.replace(re, opts.replace);
            }
            else {
              return selector;
            }
          });

          if (replaced) {
            // De-dupe selectors
            selectors = selectors.filter((selector, index) => {
              return selectors.indexOf(selector) === index;
            });

            rule.selectors = selectors;
          }
        }
        else {
          var selectors = rule.selectors.filter(selector => {
            // Kill the selector with the stray ampersand -- it's not nested!
            return !re.test(selector)
          });

          if (selectors.length == 0) {
            // If no selectors remain, remove the rule completely
            rule.remove();
          }
          else if (selectors.length != rule.selectors.length) {
            // Only replace the selectors if we changed something (avoids extra work for every selector)
            rule.selectors = selectors;
          }
        }
      }
    });
  }
});
