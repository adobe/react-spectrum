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

import {Button, Heading} from 'react-aria-components';
import {Disclosure, DisclosurePanel} from '../src/Disclosure';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components',
  component: Disclosure
};

export const DisclosureExample = (args: any) => (
  <Disclosure {...args}>
    {({isExpanded}) => (
      <>
        <Heading level={3}>
          <Button slot="trigger">{isExpanded ? '⬇️' : '➡️'} This is a disclosure header</Button>
        </Heading>
        <DisclosurePanel>
          <p>This is the content of the disclosure panel.</p>
        </DisclosurePanel>
      </>
    )}
  </Disclosure>
);

export const DisclosureControlledExample = (args: any) => {
  let [isExpanded, setExpanded] = React.useState(false);
  return (
    <Disclosure {...args} isExpanded={isExpanded} onExpandedChange={setExpanded}>
      {({isExpanded}) => (
        <>
          <Heading level={3}>
            <Button slot="trigger">{isExpanded ? '⬇️' : '➡️'} This is a disclosure header</Button>
          </Heading>
          <DisclosurePanel>
            <p>This is the content of the disclosure panel.</p>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};
