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

import {mergeProps} from './mergeProps';

interface Props {
  [key: string]: any
}

/**
 * Merges multiple props objects together. Event handlers are chained,
 * classNames are combined, and ids are deduplicated. For all other props,
 * the current props object overrides the previous.
 * @typedef {{[key:string]: any}} Props
 * @param {Props[]} args - An array of props object.
 * 
 * @example
 *  mergeMultipleProps(propsA, propsB, propsC, propsD)
 */
export function mergeMultipleProps<T extends Props>(...props:T[]): T {
  let res: Props = {};

  res = props.reduce((prev, current) => mergeProps(prev, current));

  return res as T;
}
