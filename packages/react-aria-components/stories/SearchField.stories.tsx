/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, Input, Label, SearchField} from 'react-aria-components';
import {classNames} from '@react-spectrum/utils';
import React from 'react';
import styles from '../example/index.css';

export default {
  title: 'React Aria Components'
};

export const SearchFieldExample = () => {
  return (
    <SearchField className={classNames(styles, 'searchFieldExample')} data-testid="search-field-example">
      <Label>Search</Label>
      <Input />
      <Button>✕</Button>
    </SearchField>
  );
};
