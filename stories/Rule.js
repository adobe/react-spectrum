/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import Heading from '../src/Heading';
import React from 'react';
import Rule from '../src/Rule';
import {storiesOf} from '@storybook/react';

storiesOf('Rule', module)
  .add('Large (Default)',
    () => (
      <section>
        <Heading variant="subtitle1">Large</Heading>
        <Rule />
        <p>Page or Section Titles.</p>
      </section>
    )
  )
  .add('Medium',
    () => (
      <section>
        <Heading variant="subtitle2">Medium</Heading>
        <Rule variant="medium" />
        <p>Divide subsections, or divide different groups of elements (between panels, rails, etc.)</p>
      </section>
    )
  )
  .add('Small',
    () => (
      <section>
        <Heading variant="subtitle3">Small</Heading>
        <Rule variant="small" />
        <p>Divide like-elements (tables, tool groups, elements within a panel, etc.)</p>
      </section>
    )
  );
