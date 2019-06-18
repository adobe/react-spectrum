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

import React from 'react';
import {storiesOf} from '@storybook/react';
import {Table, TBody, TD, TH, THead, TR} from '../src/Table';

storiesOf('Table', module)
  .add(
    'Default',
    () => render()
  )
  .add(
    'quiet: true',
    () => render({quiet: true})
  )
  .add(
    'with dividers',
    () => render({divider: true})
  );

function render(props = {}) {
  return (
    <Table {...props}>
      <THead>
        <TH>Pet Name</TH>
        <TH>Type</TH>
        <TH>Good/Bad</TH>
      </THead>
      <TBody>
        <TR>
          <TD>Mongo</TD>
          <TD divider={props.divider}>Chihuahua</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Tiny</TD>
          <TD divider={props.divider}>Great Dane</TD>
          <TD>Bad</TD>
        </TR>
        <TR>
          <TD>Jaws</TD>
          <TD divider={props.divider}>Pit Bull</TD>
          <TD>Good</TD>
        </TR>
      </TBody>
    </Table>
  );
}
