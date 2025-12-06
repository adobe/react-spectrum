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
import {Flex} from '@react-spectrum/layout';
import {getBaseUrl} from './utils';
import React from 'react';
// @ts-ignore
import url from 'url:../pages/assets/wallpaper_collaborative_S2_desktop.webp';

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

  // only have banner on react-stately index page, not other index pages. Also skip releases
  if ((isIndexPage && section !== 'react-stately') || currentPage.name.startsWith('v3/releases/') || currentPage.name === 'v3/Support.html') {
    return null;
  }

  let content;
  if (section === 'react-aria' || section === 'react-stately') {
    // get page name from path
    let pageName = currentPage.name.split('/').pop().replace('.html', '');
    let targetLink;

    if (section === 'react-aria') {
      // logic from docsnamer, these are aria pages that arent subpages on new site
      let topLevelHooks = /^use(Clipboard|Collator|.*Formatter|Drag.*|Drop.*|Field|Filter|Focus.*|Hover|Id|IsSSR|Keyboard|Label|Landmark|Locale|.*Press|Move|ObjectRef)$/;

      if (topLevelHooks.test(pageName)) {
        targetLink = '.';
      } else {
        // logic from docsnamer, mapping of certain aria hooks that don't map 1:1 to their s2 parent
        let mappings = {
          TooltipTrigger: 'Tooltip',
          ModalOverlay: 'Modal',
          TabList: 'Tabs',
          Dialog: 'Modal'
        };

        let componentName = pageName.replace(/^use(.+)$/, '$1');
        componentName = mappings[componentName] || componentName;
        targetLink = `../${componentName}`;
      }
    } else if (section === 'react-stately') {
      // logic from docsnamer, these are stately pages that arent subpages on new site
      let topLevelStateHooks = /^(use(MultipleSelection|List|SingleSelectList|Drag.*|Drop.*|Overlay.*|Toggle)State)|(useListData|useAsyncList|useTreeData)$/;

      if (topLevelStateHooks.test(pageName)) {
        targetLink = '.';
      } else {
        // usetablistState goes up to Tabs
        let componentName = pageName.replace(/^use(.+?)(Trigger)?State$/, '$1');
        if (pageName === 'useTabListState') {
          componentName = 'Tabs';
        }
        targetLink = `../${componentName}`;
      }
    }

    content = (
      <>
        <Heading>Migration in progress</Heading>
        <Content>
          This page is still being migrated to our new website. In the meantime, you can explore the new React Aria Components docs{' '}
          <Link>
            <a href={targetLink}>here</a>
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
      // v3 filetrigger should link to react-aria instead of s2
      if (name === 'FileTrigger') {
        componentName = name;
        s2Link = `${getBaseUrl('react-aria')}/${name}`;
      } else if (!noS2Mapping.has(name)) {
        if (specialMappings[name]) {
          componentName = name;
          let s2Path = specialMappings[name];
          s2Link = `../${s2Path}`;
        } else {
          componentName = name;
          s2Link = `../${componentName}`;
        }
      }
    }

    content = (
      <span
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'white',
          lineHeight: 1.3
        }}>
        Spectrum 2 is now available! {componentName && (
          <>
            Check out the S2{' '}
            <Link variant="overBackground">
              <a href={s2Link}>{componentName}</a>
            </Link>
            {' '}docs and the{' '}
          </>
        )}
        {!componentName && 'Check out the '}
        <Link variant="overBackground">
          <a href="../migrating">migration docs</a>
        </Link>
        .
      </span>
    );
  }

  if (section === 'v3') {
    return (
      <header
        style={{
          backgroundImage: `url(${url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          padding: '48px',
          marginBottom: '32px',
          borderRadius: '12px'
        }}>
        <Flex direction="row" alignItems="center" gap="size-100" wrap>
          {content}
        </Flex>
      </header>
    );
  }

  return (
    <InlineAlert variant="info" marginBottom="size-400">
      {content}
    </InlineAlert>
  );
}
