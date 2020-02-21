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

const postcss = require('postcss');

// The :hover pseudo class doesn't work properly on touch devices. It applies on the first touch
// and persists until the user taps again. This postcss plugin wraps selectors with :hover with an
// @media (hover: hover) block to ensure that hover styles are only applied on devices that support
// hover natively.
module.exports = postcss.plugin('postcss-hover-media', (options = {}) => {
  return root => {
    root.walkRules(rule => {
      // Split selectors containing :hover and those that don't
      let hoverSelectors = [];
      let selectors = rule.selectors.filter(sel => {
        if (sel.includes(':hover')) {
          hoverSelectors.push(sel);
          return false;
        }
        return true;
      });

      if (hoverSelectors.length === 0) {
        return;
      }

      // Create an @media rule to wrap the hover selectors in
      let atRule = postcss.atRule({name: 'media', params: '(hover: hover)'});
    
      // If there are any non-hover selectors, clone the rule and prepend the
      // hover @media before. Otherwise, replace the rule with the @media block.
      if (selectors.length > 0) {
        let hoverRule = rule.clone();
        rule.selectors = selectors;
        hoverRule.selectors = hoverSelectors;
        rule.parent.insertBefore(rule, atRule);
        atRule.append(hoverRule);
      } else {
        rule.replaceWith(atRule);
        atRule.append(rule);
      }
    });
  };
});
