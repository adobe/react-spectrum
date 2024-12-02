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

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const {SwcMinifyWebpackPlugin} = require("swc-minify-webpack-plugin");
const {browserslistToTargets} = require('lightningcss');
const browserslist = require('browserslist');
const macros = require("unplugin-parcel-macros");

// Adjust this to target the browsers your product supports.
// https://browserslist.dev/
const BROWSERSLIST = 'last 2 Chrome versions, last 2 Safari versions, last 2 Firefox versions';

module.exports = (env, argv) => ({
  entry: path.join(__dirname, "src", "index.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  mode: argv.mode || "development",
  module: {
    rules: [
      {
        // Use SWC to compile JSX. You could also use babel-loader instead.
        test: /\.?js$/,
        exclude: /node_modules/,
        use: {
          loader: "swc-loader",
          options: {
            env: {
              targets: BROWSERSLIST
            },
            jsc: {
              parser: {
                jsx: true
              }
            }
          },
        },
      },
      {
        // Use mini-css-extract-plugin instead of style-loader to that CSS is extracted
        // into a standalone .css bundle instead of inlined into JS via <style> tags.
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src", "index.html"),
    }),
    // Enable style macros.
    macros.webpack(),
    // Extract CSS bundles.
    new MiniCssExtractPlugin({
      // Use content hash in filename for long term cacheability.
      filename: "[name].[contenthash].css",
      // Ignore warnings about CSS order. Style macros generate atomic CSS,
      // which is resiliant to ordering differences.
      ignoreOrder: true,
    })
  ],
  optimization: {
    // Always enable minimizer plugins (even in development), to reduce duplicate CSS rules.
    minimize: true,
    minimizer: [
      // Minify JavaScript during the production build only.
      // (Used SWC here, but you can also use Terser if you prefer.)
      argv.mode === 'production'
        ? new SwcMinifyWebpackPlugin()
        : null,
      // Use lightningcss to compile CSS. This removes duplicate rules and outputs compatible CSS for your browserslist.
      // In production it also minifies.
      new CssMinimizerPlugin({
        minify: CssMinimizerPlugin.lightningCssMinify,
        minimizerOptions: {
          minify: argv.mode === 'production',
          targets: browserslistToTargets(browserslist(BROWSERSLIST))
        }
      })
    ],
    splitChunks: {
      cacheGroups: {
        // Bundle all S2 and style-macro generated CSS into a single bundle instead of code splitting.
        // Because atomic CSS has so much overlap between components, loading all CSS up front results in
        // smaller bundles instead of producing duplication between pages.
        s2: {
          name: 's2-styles',
          test(module) {
            return module.type === 'css/mini-extract' && (module.identifier().includes('@react-spectrum/s2') || /\.macro-(.*?)\.css/.test(module.identifier()));
          },
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
});
