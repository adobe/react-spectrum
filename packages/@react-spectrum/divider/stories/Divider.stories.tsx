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
import {ActionButton} from '@react-spectrum/button/src';
import {Divider} from '../';
import Properties from '@spectrum-icons/workflow/Properties';
import React from 'react';
import Select from '@spectrum-icons/workflow/Select';
import {storiesOf} from '@storybook/react';

storiesOf('Divider', module)
  .add('Large (Default)',
    () => (
      <section>
        <h1>Large</h1>
        <Divider />
        <p>Page or Section Titles.</p>
      </section>
    )
  )
  .add('Medium',
    () => (
      <section>
        <h1>Medium</h1>
        <Divider size="M" />
        <p>Divide subsections, or divide different groups of elements (between panels, rails, etc.)</p>
      </section>
    )
  )
  .add('Small',
    () => (
      <section>
        <h1>Small</h1>
        <Divider size="S" />
        <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
      </section>
    )
  )
  .add('Vertical, Large (Default)',
    () => renderVertical()
  )
  .add('Vertical, Medium',
    () => renderVertical({size: 'M'})
  )
  .add('Vertical, Small',
    () => renderVertical({size: 'S'})
  );

function renderVertical(props = {}) {
  return (
    <section style={{display: 'flex'}}>
      <ActionButton icon={<Properties />} aria-label="Properties" isQuiet />
      <Divider orientation="vertical" {...props} />
      <ActionButton icon={<Select />} aria-label="Select" isQuiet />
    </section>
  );
}
