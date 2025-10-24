/* eslint-disable rulesdir/imports */
/* eslint-disable monorepo/no-internal-import */
'use client';

import {CardView, Collection} from '@react-spectrum/s2';
import {ComponentCard} from './ComponentCard';
import {Key} from 'react-aria-components';
import React from 'react';

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
  styles?: any,
  renderEmptyState?: () => React.ReactNode
}

export function ComponentCardView({items, ariaLabel = 'Items', size = 'S', onAction, styles, renderEmptyState}: ComponentCardGridProps) {
  return (
    <CardView aria-label={ariaLabel} onAction={onAction} styles={styles} renderEmptyState={renderEmptyState}>
      <Collection items={items}>
        {(item) => <ComponentCard id={item.id} name={item.name.trim()} href={item.href} description={item.description} size={size} />}
      </Collection>
    </CardView>
  );
}
