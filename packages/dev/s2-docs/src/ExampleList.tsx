import {Card, CardPreview, Content, Text} from '@react-spectrum/s2';
import crud from 'url:../pages/react-aria/examples/crud.png';
import crudDark from 'url:../pages/react-aria/examples/crud-dark.png';
import emojiPicker from 'url:../pages/react-aria/examples/emoji-picker.png';
import emojiPickerDark from 'url:../pages/react-aria/examples/emoji-picker-dark.png';
import iosList from 'url:react-aria-components/docs/examples/ios-list.png';
import iosListDark from 'url:../pages/react-aria/examples/ios-list-dark.png';
import kanban from 'url:../pages/react-aria/examples/kanban.png';
import kanbanDark from 'url:../pages/react-aria/examples/kanban-dark.png';
import path from 'path';
import photos from 'url:../pages/react-aria/examples/photos.png';
import photosDark from 'url:../pages/react-aria/examples/photos-dark.png';
import rippleButton from 'url:react-aria-components/docs/examples/ripple-button.png';
import sheet from 'url:../pages/react-aria/examples/sheet.png';
import sheetDark from 'url:../pages/react-aria/examples/sheet-dark.png';
import {size, style} from '@react-spectrum/s2/style' with {type: 'macro'};
import swipeableTabs from 'url:../pages/react-aria/examples//swipeable-tabs.png';
import swipeableTabsDark from 'url:../pages/react-aria/examples//swipeable-tabs-dark.png';

const images = {
  'ios-list.html': [iosList, iosListDark],
  'emoji-picker.html': [emojiPicker, emojiPickerDark],
  'kanban.html': [kanban, kanbanDark],
  'photos.html': [photos, photosDark],
  'crud.html': [crud, crudDark],
  'ripple-button.html': rippleButton,
  'sheet.html': [sheet, sheetDark],
  'swipeable-tabs.html': [swipeableTabs, swipeableTabsDark]
};

export function ExampleList({tag, pages}) {
  let examples = pages
    .filter(page => page.name.startsWith('react-aria/examples/') && !page.name.endsWith('index.html') && (!tag || page.exports?.keywords.includes(tag)))
    .sort((a, b) => getTitle(a).localeCompare(getTitle(b)));

  return (
    <ul
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
      {examples.map(example => (
        <li key={example.url}>
          <Card href={example.url}>
            <CardPreview>
              <ExampleImage name={example.name} />
            </CardPreview>
            <Content>
              <Text slot="title">{getTitle(example)}</Text>
              {example.exports?.description ? <Text slot="description">{example.exports?.description}</Text> : null}
            </Content>
          </Card>
        </li>
      ))}
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

export function ExampleImage({name}) {
  let img = images[path.basename(name)];
  if (!Array.isArray(img)) {
    return <img src={img} alt="" className={image} />;
  }

  let [light, dark] = img;
  return (
    <picture>
      <source srcSet={light} media="(prefers-color-scheme: light)" />
      <source srcSet={dark} media="(prefers-color-scheme: dark)" />
      <img src={light} alt="" className={image} />
    </picture>
  );
}
