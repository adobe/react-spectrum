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

import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {Checkbox} from '@react-spectrum/checkbox';
import {Flex} from '@react-spectrum/layout';
import {Form} from '@react-spectrum/form';
import React from 'react';

let columns = [
  {key: 'planName', title: 'Plan Name'},
  {key: 'audienceType', title: 'Audience Type'},
  {key: 'netBudget', title: 'Net Budget'},
  {key: 'targetOTP', title: 'Target OTP'},
  {key: 'reach', title: 'Reach'}
];

let data = [
  {id: 1, planName: 'Plan 1: $300k, digital', audienceType: 'Strategic', netBudget: '$300,000', targetOTP: '7.4%', reach: '11.52%'},
  {id: 2, planName: 'Plan 2: $500k, digital', audienceType: 'Strategic', netBudget: '$500,000', targetOTP: '22.5%', reach: '11.5%'},
  {id: 3, planName: 'Plan 3: $800k, digital', audienceType: 'Strategic', netBudget: '$800,000', targetOTP: '22.5%', reach: '11.5%'},
  {id: 4, planName: 'Plan 4: $300k, MRI', audienceType: 'Demo+strategic', netBudget: '$300,000', targetOTP: '22.5%', reach: '11.5%'},
  {id: 5, planName: 'Plan 5: $500k, MRI', audienceType: 'Demo+strategic', netBudget: '$500,000', targetOTP: '22.5%', reach: '11.5%'},
  {id: 6, planName: 'Plan 6: $800k, MRI', audienceType: 'Demo+strategic', netBudget: '$800,000', targetOTP: '22.5%', reach: '11.5%'}
];

export function HidingColumns() {
  let [visibleColumns, setVisibleColumns] = React.useState(new Set(columns.map(c => c.key)));
  let toggleColumn = (key) => {
    let columns = new Set(visibleColumns);
    if (columns.has(key)) {
      columns.delete(key);
    } else {
      columns.add(key);
    }

    setVisibleColumns(columns);
  };

  return (
    <Flex>
      <Form>
        {columns.slice(1).map(c => 
          <Checkbox key={c.key} isSelected={visibleColumns.has(c.key)} onChange={() => toggleColumn(c.key)}>{c.title}</Checkbox>
        )}
      </Form>
      <Table aria-label="Table with hideable columns" width={900} height={500} isQuiet>
        <TableHeader columns={columns.filter(c => visibleColumns.has(c.key))}>
          {column => <Column>{column.title}</Column>}
        </TableHeader>
        <TableBody items={data}>
          {item => (
            <Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>
          )}
        </TableBody>
      </Table>
    </Flex>
  );
}
