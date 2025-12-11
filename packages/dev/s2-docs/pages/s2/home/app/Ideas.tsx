import {
  Card, CardView,
  Collection,
  CollectionCardPreview,
  Content, Image, SkeletonCollection,
  Text
} from '@react-spectrum/s2';
import Folder from '@react-spectrum/s2/icons/Folder';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { useLocale } from 'react-aria';
import { useAsyncList } from 'react-stately';
import { Arrow, Arrows } from './Arrows';

export function Ideas() {
  let {locale} = useLocale();
  let list = useAsyncList<Topic, number | null>({
    async load() {
      let res = await import('./topics.json');
      let items = res.filter((topic: Topic) => !!topic.preview_photos);
      return {items};
    }
  });

  return (
    <>
      <div className={style({font: 'heading'})}>{locale === 'ar-AE' ? 'أفكار' : 'Ideas'}</div>
      <CardView
        aria-label="Ideas"
        loadingState={list.loadingState}
        onLoadMore={list.loadMore}
        styles={style({flexGrow: 1, minHeight: 0, maxHeight: 500, marginX: -12})}>
        <Collection items={list.items}>
          {topic => <TopicCard topic={topic} />}
        </Collection>
        {(list.loadingState === 'loading' || list.loadingState === 'loadingMore') && (
          <SkeletonCollection>
            {() => (
              <TopicCard
                topic={{
                  id: Math.random().toString(36),
                  title: 'Topic title',
                  total_photos: 80,
                  links: {html: ''},
                  preview_photos: [
                    {id: 'a', urls: {small: ''}},
                    {id: 'b', urls: {small: ''}},
                    {id: 'c', urls: {small: ''}},
                    {id: 'd', urls: {small: ''}}
                  ]
                }} />
            )}
          </SkeletonCollection>
        )}
      </CardView>
    </>
  );
}

interface Topic {
  id: string,
  title: string,
  total_photos: number,
  links: {html: string},
  preview_photos: {id: string, urls: {small: string}}[]
}

function TopicCard({topic}: {topic: Topic}) {
  return (
    <Card href={topic.links.html} target="_blank" textValue={topic.title}>
      <CollectionCardPreview>
        {topic.preview_photos.slice(0, 4).map(photo => (
          <Image key={photo.id} alt="" src={photo.urls.small} />
        ))}
      </CollectionCardPreview>
      <Content>
        <Text slot="title">{topic.title}</Text>
        <div className={style({display: 'flex', alignItems: 'center', gap: 8})}>
          <Folder />
          <Text slot="description">{topic.total_photos.toLocaleString()} photos</Text>
        </div>
      </Content>
    </Card>
  );
}

export function IdeasArrows() {
  return (
    <Arrows>
      <Arrow textX={75} x1={120} x2={160} y={130} href="Button">Button</Arrow>
      <Arrow textX={38} x1={120} x2={160} y={618} href="ActionButton">ActionButton</Arrow>
      <Arrow textX={632} y={24} points="662,34 662,64" marker="markerEnd" href="SearchField">SearchField</Arrow>
      <Arrow textX={1040} y={24} points="1064,34 1064,64" marker="markerEnd" href="Popover">Popover</Arrow>
      <Arrow textX={1206} x1={1198} x2={1158} y={82} marker="markerEnd" href="Menu">Menu</Arrow>
      <Arrow textX={1206} x1={1198} x2={1142} y={350} marker="markerEnd" href="Card.html#collection">CollectionCard</Arrow>
    </Arrows>
  );
}
