/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

module.exports = {
  displayName: '@react-spectrum/native',
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  testMatch: ['<rootDir>/src/**/*.test.[tj]s?(x)'],
  resolver: '<rootDir>/../../../lib/jestResolver.js',
  setupFiles: ['<rootDir>/jest.env.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^uniwind$': '<rootDir>/jest.uniwind-stub.js',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.js',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^react-native-svg$': '<rootDir>/__mocks__/react-native-svg.js'
  },
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true
          },
          transform: {
            react: {
              runtime: 'automatic'
            }
          }
        }
      }
    ],
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp)$': '<rootDir>/jest.assetTransformer.js'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:react-native|@react-native|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-svg|@react-native-community)/)'
  ],
  testEnvironment: 'node',
  testEnvironmentOptions: {
    customExportConditions: ['source']
  },
  testTimeout: 20000,
  prettierPath: null
};
