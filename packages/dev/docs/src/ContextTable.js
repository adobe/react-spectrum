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
import styles from './docs.css';
import tableStyles from '@adobe/spectrum-css-temp/components/table/vars.css';
import {Type, TypeContext} from './types';
import {TypeLink} from './TypeLink';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function ContextTable({components, docs}) {
  return (
    <table className={`${tableStyles['spectrum-Table']} ${styles.propTable}`}>
      <thead>
        <tr>
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Component</td>
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Context</td>
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Props</td>
          <td role="columnheader" className={tableStyles['spectrum-Table-headCell']}>Ref</td>
        </tr>
      </thead>
      <tbody className={tableStyles['spectrum-Table-body']}>
        {components.map((comp, index) => (
          <tr key={index} className={clsx(tableStyles['spectrum-Table-row'], styles.tableRow)}>
            <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="Component">
              <code className={`${typographyStyles['spectrum-Code4']}`}>
                <span className="token hljs-variable">{comp}</span>
              </code>
            </td>
            <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="Context">
              <code className={`${typographyStyles['spectrum-Code4']}`}>
                <span className="token hljs-variable">{`${comp}Context`}</span>
              </code>
            </td>
            <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="Props">
              <TypeLink links={docs.links} type={docs.exports[comp].props} />
            </td>
            <td role="rowheader" className={clsx(tableStyles['spectrum-Table-cell'], styles.tableCell)} data-column="Ref">
              {docs.exports[comp].ref ? <TypeContext.Provider value={docs.links}>
                <code className={`${typographyStyles['spectrum-Code4']}`}>
                  <Type type={docs.exports[comp].ref.typeParameters[0]} />
                </code>
              </TypeContext.Provider> : '–'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
