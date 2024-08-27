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

/// <reference types="css-module-types" />

export {TableView} from './TableViewWrapper';
import {Column} from '@react-stately/table';
import {JSX} from 'react';
import {SpectrumColumnProps} from '@react-types/table';

// Override TS for Column to support spectrum specific props.
const SpectrumColumn = Column as <T>(props: SpectrumColumnProps<T>) => JSX.Element;
export {SpectrumColumn as Column};

export {
  TableHeader,
  TableBody,
  Section,
  Row,
  Cell
} from '@react-stately/table';

export type {SpectrumColumnProps, TableHeaderProps, TableBodyProps, RowProps, CellProps} from '@react-types/table';
export type {SpectrumTableProps} from './TableViewWrapper';
