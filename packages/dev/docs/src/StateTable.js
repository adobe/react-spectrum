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

import clsx from 'clsx';
import React from 'react';
import {renderHTMLfromMarkdown} from './types';
import styles from './docs.css';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function StateTable({properties, showOptional}) {
  let props = Object.values(properties);
  if (!showOptional) {
    props = props.filter(prop => !prop.optional);
  }
  let showSelector = props.some(prop => prop.selector);

  return (
    <table className={`${tableStyles['spectrum-Table']} ${styles.propTable}`}>
      <thead>
        <tr>
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Name</td>
          {showSelector && <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>CSS Selector</td>}
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Description</td>
        </tr>
      </thead>
      <tbody className={tableStyles['spectrum-Table-body']}>
        {props.map((prop, index) => (
          <tr key={index} className={clsx(tableStyles['spectrum-Table-row'], styles.tableRow)}>
            <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="Name">
              <code className={`${typographyStyles['spectrum-Code4']}`}>
                <span className="token hljs-variable">{prop.name}</span>
              </code>
            </td>
            {showSelector && <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="CSS Selector">
              <code className={`${typographyStyles['spectrum-Code4']}`}>
                <span className={prop.selector ? 'token hljs-string' : null}>{prop.selector || '—'}</span>
              </code>
            </td>}
            <td className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)}>{renderHTMLfromMarkdown(prop.description, {forceInline: false})}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
