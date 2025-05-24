/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ExampleCard} from '@react-spectrum/docs/src/ExampleCard';
import {PageContext} from '@react-spectrum/docs';
import React from 'react';
import styles from '@react-spectrum/docs/src/docs.css';

export function ExampleList({tag, style}) {
  let {pages} = React.useContext(PageContext);
  let examples = pages
    .filter(page => page.name.startsWith('react-aria/examples/') && !page.name.endsWith('index.html') && (!tag || page.keywords.includes(tag)))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <section className={styles.cardGroup} data-size="small" style={style}>
      {examples.map(page => (
        <ExampleCard
          key={page.name}
          url={page.url}
          preview={page.image}
          title={page.title}
          description={page.description}
          cover />
      ))}
    </section>
  );
}
