/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Meta} from '@storybook/react';

// Original Table story wasn't performant with so many tables, so split off RTL into its own story
const meta: Meta = {
  title: 'TableViewRTL/Expandable rows',
  parameters: {
    chromaticProvider: {colorSchemes: ['light'], locales: ['ar-AE'], scales: ['medium'], disableAnimations: true},
    // large delay with the layout since there are so many tables
    chromatic: {delay: 4000}
  }
};

export default meta;

export {
  Default,
  DefaultPt2,
  DefaultPt3,
  ColumnAlign,
  ColumnAlignPt2,
  ColumnAlignPt3,
  ColumnDividers,
  ColumnDividersPt2,
  ColumnDividersPt3,
  ColumnWidth,
  ColumnWidthPt2,
  ColumnWidthPt3,
  HiddenColumns,
  HiddenColumnsPt2,
  HiddenColumnsPt3,
  NestedColumns,
  NestedColumnsPt2,
  NestedColumnsPt3,
  Empty
} from './TreeGridTable.stories';
