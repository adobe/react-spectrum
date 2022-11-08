/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AlertDialog} from './AlertDialog';
import {Item, Section} from 'react-stately';
import {MenuButton} from './Menu';
import {OverlayContainer, OverlayProvider} from 'react-aria';
import * as React from 'react';

export default function RestoreFocusExample() {
  let [isOpen, setOpen] = React.useState(false);

  return (
    <OverlayProvider>
      <MenuButton label="Actions" onAction={() => setOpen(true)}>
        <Section>
          <Item key="edit">Edit…</Item>
          <Item key="duplicate">Duplicate</Item>
        </Section>
        <Section>
          <Item key="move">Move…</Item>
          <Item key="rename">Rename…</Item>
        </Section>
        <Section>
          <Item key="archive">Archive</Item>
          <Item key="delete">Delete…</Item>
        </Section>
      </MenuButton>
      <OverlayContainer>
        <AlertDialog
          isOpen={isOpen}
          title="Delete folder"
          confirmLabel="Delete"
          variant="destructive"
          onClose={() => setOpen(false)}>
          Are you sure you want to delete "Documents"? All contents will be
          perminately destroyed.
        </AlertDialog>
      </OverlayContainer>
    </OverlayProvider>
  );
}
