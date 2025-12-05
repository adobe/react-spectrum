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

import {Content, Heading, InlineAlert, Link} from '@adobe/react-spectrum';
import React from 'react';

export function MigrationBanner({currentPage}) {
  if (!currentPage || !currentPage.filePath) {
    return null;
  }

  let section;
  if (currentPage.filePath.includes('@react-stately')) {
    section = 'react-stately';
  } else if (currentPage.filePath.includes('@react-aria')) {
    section = 'react-aria';
  } else {
    section = 'v3';
  }
  let isIndexPage = /^(?:[^/]+\/)?index\.html$/.test(currentPage.name);

  // only banner on react-stately index page, not other index pages
  if (isIndexPage && section !== 'react-stately') {
    return null;
  }

  let content;
  if (section === 'react-aria' || section === 'react-stately') {
    content = (
      <>
        <Heading>Migration in progress</Heading>
        <Content>
          This page is still being migrated to our new website. In the meantime, you can explore the new React Aria Components docs{' '}
          <Link>
            <a href="https://react-aria.adobe.com/index.html">here</a>
          </Link>
          .
        </Content>
      </>
    );
  } else if (section === 'v3') {
    let componentName;
    let s2Link;

    const noS2Mapping = new Set([
      'ListView',
      'LabeledValue',
      'dnd',
      'SearchAutocomplete',
      'Keyboard',
      'ColorPicker',
      'Well',
      'View',
      'Header',
      'Footer',
      'Content',
      'Text',
      'Heading',
      'StepList',
      'Grid',
      'Flex',
      'LogicButton',
      'DialogContainer',
      'ListBox',
      'layout',
      'versioning',
      'theming',
      'ssr'
    ]);

    const specialMappings = {
      'MenuTrigger': 'Menu',
      'AlertDialog': 'Dialog#alert-dialog',
      'workflow-icons': 'icons',
      'custom-icons': 'icons',
      'DialogTrigger': 'Dialog',
      'ActionGroup': 'ActionButtonGroup'
    };

    let nameMatch = currentPage.name.match(/^v3\/([^/]+)\.html$/);
    if (nameMatch) {
      let name = nameMatch[1];
      if (!noS2Mapping.has(name)) {
        if (specialMappings[name]) {
          componentName = name;
          let s2Path = specialMappings[name];
          s2Link = `https://react-spectrum.adobe.com/${s2Path}`;
        } else {
          componentName = name;
          s2Link = `https://react-spectrum.adobe.com/${componentName}`;
        }
      }
    }

    content = (
      <>
        <Heading>Spectrum 2 is now available</Heading>
        <Content>
          {componentName && (
            <>
              Check out the S2{' '}
              <Link>
                <a href={s2Link}>{componentName}</a>
              </Link>
              {' '}docs and the{' '}
            </>
          )}
          {!componentName && 'Check out the '}
          <Link>
            <a href="https://react-spectrum.adobe.com/migrating.html">migration docs</a>
          </Link>
          .
        </Content>
      </>
    );
  }

  return (
    <InlineAlert variant="info" marginBottom="size-400">
      {content}
    </InlineAlert>
  );
}
