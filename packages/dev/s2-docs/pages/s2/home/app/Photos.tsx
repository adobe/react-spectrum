'use client';
import ViewGridFluid from '@react-spectrum/s2/icons/ViewGridFluid';
import ViewGrid from '@react-spectrum/s2/icons/ViewGrid';
import { style } from "@react-spectrum/s2/style" with { type: 'macro' };
import { Card, CardPreview, CardView, Collection, SkeletonCollection, Image, SegmentedControl, SegmentedControlItem } from '@react-spectrum/s2';
import { useLocale } from 'react-aria';
import { useAsyncList } from 'react-stately';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const pages = [
  () => import('./photos-1.json'),
  () => import('./photos-2.json'),
  () => import('./photos-3.json'),
  () => import('./photos-4.json')
];

export function Photos(props: any) {
  let [layout, setLayout] = useState<'waterfall' | 'grid'>('waterfall');
  let {direction} = useLocale();
  let list = useAsyncList<any, number | null>({
    async load({cursor, items}) {
      let page = cursor || 1;
      let next = pages[page - 1];
      if (!next) {
        return {items: []};
      }

      let nextItems: any[] = await next();
      // Filter duplicates which might be returned by the API.
      let existingKeys = new Set(items.map(i => i.id));
      nextItems = nextItems.filter((i: any) => !existingKeys.has(i.id) && (i.description || i.alt_description));
      return {items: nextItems, cursor: nextItems.length ? page + 1 : null};
    }
  });

  return (
    <>
      <div className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8})}>
        <div className={style({font: 'heading'})}>{direction === 'rtl' ? 'الصور' : 'Photos'}</div>
        <SegmentedControl selectedKey={layout} onSelectionChange={setLayout as any}>
          <SegmentedControlItem id="waterfall" aria-label="Waterfall"><ViewGridFluid /></SegmentedControlItem>
          <SegmentedControlItem id="grid" aria-label="Grid"><ViewGrid /></SegmentedControlItem>
        </SegmentedControl>
      </div>
      <CardView
        aria-label="Nature photos"
        size="S"
        layout={layout}
        // selectionMode="multiple"
        // selectionStyle={list.selectedKeys === 'all' || list.selectedKeys.size > 0 ? 'checkbox' : 'highlight'}
        selectedKeys={list.selectedKeys}
        onSelectionChange={list.setSelectedKeys}
        variant="quiet"
        loadingState={list.loadingState}
        onLoadMore={list.loadMore}
        styles={style({flexGrow: 1, minHeight: 0, maxHeight: 500, marginX: -12})}>
        <Collection items={list.items} dependencies={[layout]}>
          {item => <PhotoCard item={item} layout={layout} onAction={props.onAction} />}
        </Collection>
        {(list.loadingState === 'loading' || list.loadingState === 'loadingMore') && (
          <SkeletonCollection>
            {() => (
              <PhotoCard
                item={{
                  id: Math.random(),
                  user: {name: 'Placeholder name', profile_image: {small: ''}},
                  urls: {regular: ''},
                  description: 'This is a fake description. Kinda long so it wraps to a new line.',
                  alt_description: '',
                  width: 400,
                  height: 200 + Math.max(0, Math.round(Math.random() * 400))
                }}
                layout={layout} />
            )}
          </SkeletonCollection>
        )}
      </CardView>
    </>
  );
}

export function PhotoCard({item, layout, onAction, styles}: any) {
  let imgRef = useRef<HTMLImageElement | null>(null);
  return (
    <Card
      id={item.id}
      styles={styles}
      textValue={item.description || item.alt_description}
      onAction={onAction && (() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          onAction([item, imgRef.current]);
          return;
        }

        imgRef.current!.style.viewTransitionName = 'photo';
        document.startViewTransition(() => {
          imgRef.current!.style.viewTransitionName = '';
          flushSync(() => onAction([item, imgRef.current]));
        })
      })}>
      <CardPreview>
        <Image
          ref={imgRef}
          data-photo-id={item.id}
          src={item.urls.regular}
          width={item.width}
          height={item.height}
          UNSAFE_style={{
            aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : undefined
          }} />
      </CardPreview>
    </Card>
  );
}
