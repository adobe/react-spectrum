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

import {AccordionItem, AccordionPanel} from '../src';
import {Button, Header, Heading} from 'react-aria-components';
import React from 'react';
import './styles.css';

export default {
  title: 'React Aria Components',
  component: AccordionItem
};

export const AccordionExample = (args: any) => (
  <AccordionItem {...args}>
    {({isOpen}) => (
      <>
        <Header>
          <Heading level={3}>
            <Button slot="trigger">This is an accordion header {isOpen ? '⬇️' : '➡️'}</Button>
          </Heading>
        </Header>
        <AccordionPanel>
          <p>This is the content of the accordion panel.</p>
        </AccordionPanel>
      </>
    )}
  </AccordionItem>
);

export const AccordionControlledExample = (args: any) => {
  let [isOpen, setOpen] = React.useState(false);
  return (
    <AccordionItem {...args} isOpen={isOpen} onOpenChange={setOpen}>
      {({isOpen}) => (
        <>
          <Header>
            <Heading level={3}>
              <Button slot="trigger">This is an accordion header {isOpen ? '⬇️' : '➡️'}</Button>
            </Heading>
          </Header>
          <AccordionPanel>
            <p>This is the content of the accordion panel.</p>
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
};
