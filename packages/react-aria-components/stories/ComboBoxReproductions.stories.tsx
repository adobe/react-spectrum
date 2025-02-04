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

import {Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover} from 'react-aria-components';
import React, {useRef} from 'react';
import './combobox-reproductions.css';

export default {
  title: 'React Aria Components'
};

export const ComboBoxReproductionExample = () => {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <ComboBox>
      <Label>Favorite Animal</Label>
      <div ref={ref} style={{display: 'flex', backgroundColor: 'white'}}>
        <span role="img" aria-label="Checkmark" >✅</span>
        <Input style={{backgroundColor: 'white'}} />
        <Button style={{backgroundColor: 'white', borderColor: 'lightgrey'}}>▼</Button>
      </div>
      <Popover triggerRef={ref} style={{backgroundColor: 'darkgrey'}} isOpen>
        <ListBox>
          <ListBoxItem>Aardvark</ListBoxItem>
          <ListBoxItem>Cat</ListBoxItem>
          <ListBoxItem>Dooooooooooooooooooooooooooooooooog</ListBoxItem>
          <ListBoxItem>Kangaroo</ListBoxItem>
          <ListBoxItem>Panda</ListBoxItem>
          <ListBoxItem>Snake</ListBoxItem>
        </ListBox>
      </Popover>
    </ComboBox>
  );
};
