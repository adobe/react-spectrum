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

import { action } from "@storybook/addon-actions";
import { SearchWithin } from "../";
import { Picker } from "@react-spectrum/picker";
import { SearchField } from "@react-spectrum/searchfield";
import { Item } from "@react-stately/collections/src/Item";

import React from "react";
import { storiesOf } from "@storybook/react";

let flatOptions = [
  { id: 1, name: "Aardvark" },
  { id: 2, name: "Kangaroo" },
  { id: 3, name: "Snake" },
  { id: 4, name: "Danni" },
  { id: 5, name: "Devon" },
  { id: 6, name: "Ross" },
  { id: 7, name: "Puppy" },
  { id: 8, name: "Doggo" },
  { id: 9, name: "Floof" },
];

let children = (
  <>
    <SearchField />
    <Picker items={flatOptions}>{(item) => <Item>{item.name}</Item>}</Picker>
  </>
);

storiesOf("SearchWithin", module).add("name me", () => (
  <SearchWithin children={children}></SearchWithin>
));
