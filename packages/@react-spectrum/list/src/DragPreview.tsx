/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import {classNames, SlotProvider} from '@react-spectrum/utils';
import {Content} from '@react-spectrum/view';
import {Grid} from '@react-spectrum/layout';
import {GridNode} from '@react-types/grid';
import listStyles from './styles.css';
import {Provider} from '@react-spectrum/provider';
import {ProviderContext} from '@react-types/provider';
import React from 'react';

interface DragPreviewProps {
  item: GridNode<any>,
  itemCount: number,
  itemHeight: number,
  provider: ProviderContext,
  locale: string
}

export function DragPreview(props: DragPreviewProps) {
  let {
    item,
    itemCount,
    itemHeight,
    provider,
    locale
  } = props;

  let isDraggingMultiple = itemCount > 1;

  return (
    <Provider
      {...provider}
      locale={locale}
      UNSAFE_style={{background: 'none'}}>
      <div style={{height: itemHeight}} className={classNames(listStyles, 'react-spectrum-ListViewItem', 'react-spectrum-ListViewItem-dragPreview', {'react-spectrum-ListViewItem-dragPreview--multiple': isDraggingMultiple})}>
        <Grid UNSAFE_className={listStyles['react-spectrum-ListViewItem-grid']}>
          <SlotProvider
            slots={{
              content: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              text: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content']},
              description: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-description']},
              icon: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-icon'], size: 'M'},
              image: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-image']},
              link: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-content'], isQuiet: true},
              actionButton: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'], isQuiet: true},
              actionGroup: {
                UNSAFE_className: listStyles['react-spectrum-ListViewItem-actions'],
                isQuiet: true,
                density: 'compact'
              },
              actionMenu: {UNSAFE_className: listStyles['react-spectrum-ListViewItem-actionmenu'], isQuiet: true}
            }}>
            {typeof item.rendered === 'string' ? <Content>{item.rendered}</Content> : item.rendered}
            {isDraggingMultiple &&
              <div className={classNames(listStyles, 'react-spectrum-ListViewItem-badge')}>{itemCount}</div>
            }
          </SlotProvider>
        </Grid>
      </div>
    </Provider>
  );
}
