import {Card, CardPreview, Content, Image, ImageCoordinator, Text} from '@react-spectrum/s2';
import crud from 'url:../pages/react-aria/examples/crud.png?as=avif&quality=50';
import crudDark from 'url:../pages/react-aria/examples/crud-dark.png?as=avif&quality=50';
import emojiPicker from 'url:../pages/react-aria/examples/emoji-picker.png?as=avif&quality=50';
import emojiPickerDark from 'url:../pages/react-aria/examples/emoji-picker-dark.png?as=avif&quality=50';
// eslint-disable-next-line
import iosList from 'url:/packages/react-aria-components/docs/examples/ios-list.png?as=avif&quality=50';
import iosListDark from 'url:../pages/react-aria/examples/ios-list-dark.png?as=avif&quality=50';
import kanban from 'url:../pages/react-aria/examples/kanban.png?as=avif&quality=50';
import kanbanDark from 'url:../pages/react-aria/examples/kanban-dark.png?as=avif&quality=50';
import path from 'path';
import photos from 'url:../pages/react-aria/examples/photos.png?as=avif&quality=50';
import photosDark from 'url:../pages/react-aria/examples/photos-dark.png?as=avif&quality=50';
// eslint-disable-next-line
import rippleButton from 'url:/packages/react-aria-components/docs/examples/ripple-button.png?as=avif&quality=50';
import sheet from 'url:../pages/react-aria/examples/sheet.png?as=avif&quality=50';
import sheetDark from 'url:../pages/react-aria/examples/sheet-dark.png?as=avif&quality=50';
import {size, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import swipeableTabs from 'url:../pages/react-aria/examples//swipeable-tabs.png?as=avif&quality=50';
import swipeableTabsDark from 'url:../pages/react-aria/examples//swipeable-tabs-dark.png?as=avif&quality=50';

export const images: Record<string, [string, string]> = {
  'ios-list': [iosList, iosListDark],
  'emoji-picker': [emojiPicker, emojiPickerDark],
  'kanban': [kanban, kanbanDark],
  'photos': [photos, photosDark],
  'crud': [crud, crudDark],
  'ripple-button': [rippleButton, rippleButton],
  'sheet': [sheet, sheetDark],
  'swipeable-tabs': [swipeableTabs, swipeableTabsDark]
};

export function ExampleList({tag, pages}) {
  let examples = pages
    .filter(page => page.name.startsWith('react-aria/examples/') && !page.name.endsWith('index') && (!tag || page.exports?.keywords.includes(tag)))
    .sort((a, b) => getTitle(a).localeCompare(getTitle(b)));

  return (
    <ul
      itemScope
      itemType="https://schema.org/ItemList"
      className={style({
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, ${size(240)})`,
        gap: 24,
        marginTop: 32,
        padding: 0,
        listStyleType: 'none',
        justifyContent: {
          default: 'center',
          lg: 'start'
        }
      })}>
      <meta itemProp="name" content="Examples" />
      <ImageCoordinator>
        {examples.map(example => (
          <li
            key={example.url}
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem">
            <div
              className={style({display: 'contents'})}
              itemProp="item"
              itemScope
              itemType="https://schema.org/TechArticle">
              <meta itemProp="url" content={example.url} />
              <Card href={example.url}>
                <CardPreview>
                  <ExampleImage name={example.name} itemProp="image" />
                </CardPreview>
                <Content>
                  <Text slot="title" itemProp="headline">{getTitle(example)}</Text>
                  {example.exports?.description ? <Text slot="description" itemProp="description">{example.exports?.description}</Text> : null}
                </Content>
              </Card>
            </div>
          </li>
        ))}
      </ImageCoordinator>
    </ul>
  );
}

const getTitle = (example) => example.tableOfContents?.[0]?.title;

const image = style({
  width: 'full',
  aspectRatio: '3/2',
  objectFit: 'cover',
  userSelect: 'none',
  pointerEvents: 'none'
});

export function ExampleImage({name, itemProp}: {name: string, itemProp?: string}) {
  let img = images[path.basename(name)];
  if (!Array.isArray(img)) {
    return <Image src={img} alt="" styles={image} />;
  }

  let [light, dark] = img;
  return (
    <Image
      src={[
        {srcSet: light, colorScheme: 'light'},
        {srcSet: dark, colorScheme: 'dark'}
      ]}
      alt=""
      itemProp={itemProp}
      styles={image} />
  );
}
