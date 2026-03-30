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

const {Transformer} = require('@parcel/plugin');

module.exports = new Transformer({
  async transform({asset, options}) {
    // Normalize CSS so it always has the same environment and isn't duplicated.
    // This is so the legacy JS bundle and the modern JS bundle share the same CSS.
    asset.setEnvironment({
      context: 'browser',
      engines: {
        browsers: 'baseline widely available'
      },
      shouldOptimize: asset.env.shouldOptimize,
      outputFormat: asset.env.outputFormat,
      isLibrary: asset.env.isLibrary,
      shouldScopeHoist: asset.env.shouldScopeHoist,
      includeNodeModules: asset.env.includeNodeModules,
      loc: asset.env.loc,
      sourceMap: asset.env.sourceMap,
      sourceType: asset.env.sourceType
    });

    return [asset];
  }
});
