'use client';

import {ComponentCard} from './ComponentCard';
import {InternalCardViewContext} from '../../../@react-spectrum/s2/src/Card';
import {Key, ListBox, ListBoxItem} from 'react-aria-components';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

export interface ComponentCardItem {
  id: string,
  name: string,
  href: string,
  description?: string
}

interface ComponentCardGridProps {
  items: ComponentCardItem[],
  ariaLabel?: string,
  size?: 'S' | 'M' | 'L',
  onAction?: (key: Key) => void,
  renderEmptyState?: () => React.ReactNode
}

export function ComponentCardView({items, ariaLabel = 'Items', size = 'S', onAction, renderEmptyState}: ComponentCardGridProps) {
  return (
    <InternalCardViewContext.Provider value={{ElementType: ListBoxItem, layout: 'grid'}}>
      <ListBox
        aria-label={ariaLabel}
        layout="grid"
        onAction={onAction}
        className={style({
          display: {
            default: 'grid',
            isEmpty: 'flex'
          },
          gridTemplateColumns: {
            default: 'repeat(auto-fill, minmax(150px, 1fr))',
            md: 'repeat(auto-fill, minmax(200px, 1fr))'
          },
          gridAutoRows: 'max-content',
          gap: 16,
          padding: {
            default: 12,
            md: 16
          },
          marginX: {
            default: -12,
            md: 0
          },
          alignItems: {
            isEmpty: 'center'
          },
          justifyContent: {
            default: 'space-between',
            isEmpty: 'center'
          },
          overflow: 'auto',
          flexGrow: 1
        })}
        renderEmptyState={renderEmptyState}
        items={items}>
        {(item) => <ComponentCard id={item.id} name={item.name.trim()} href={item.href} description={item.description} size={size} />}
      </ListBox>
    </InternalCardViewContext.Provider>
  );
}
