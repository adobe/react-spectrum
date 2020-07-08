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
    // This is necessary because the server bundle has a "node" environment, whereas
    // the client bundle has a "browser" environment. We want them to end up resolving
    // to the same asset.
    asset.setEnvironment({
      context: 'browser',
      engines: {
        browsers: asset.env.engines.browsers,
      },
      minify: options.mode === 'production',
    });

    return [asset];
  }
});
