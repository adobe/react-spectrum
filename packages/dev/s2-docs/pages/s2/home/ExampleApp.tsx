'use client';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Bell from '@react-spectrum/s2/icons/Bell';
import Apps from '@react-spectrum/s2/icons/AppsAll';
import Add from '@react-spectrum/s2/icons/Add';
import Home from '@react-spectrum/s2/icons/Home';
import Folder from '@react-spectrum/s2/icons/Folder';
import Lightbulb from '@react-spectrum/s2/icons/Lightbulb';
import Edit from '@react-spectrum/s2/icons/Edit';
import FolderAdd from '@react-spectrum/s2/icons/FolderAdd';
import Share from '@react-spectrum/s2/icons/Share';
import Download from '@react-spectrum/s2/icons/Download';
import Tag from '@react-spectrum/s2/icons/Tag';
import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, CardView, Collection, SkeletonCollection, Image, Content, Text, ActionButton, SearchField, Avatar, Button, ToggleButton, ActionBar, ToggleButtonGroup, ActionButtonGroup} from '@react-spectrum/s2';
import {useLocale} from 'react-aria';
import {useAsyncList} from 'react-stately';
import { useRef, useState } from 'react';
import { ExampleApp2 } from './ExampleApp2';
import { flushSync } from 'react-dom';

export function ExampleApp() {
  let [[detail, img] = [], setDetail] = useState<[any, HTMLImageElement] | []>([]);

  return (
    <>
      <AppFrame hidden={!!detail}>
        <Example onAction={setDetail} />
      </AppFrame>
      {detail && img && 
        <ExampleApp2 onBack={() => {
          document.startViewTransition(async () => {
            flushSync(() => setDetail([]));
            img.style.viewTransitionName = 'photo';
          }).ready.then(() => {
            img.style.viewTransitionName = '';
          });
        }}>
          <div
            className={style({
              size: 'full',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'clip'
            })}
            style={{
              containerType: 'size'
            } as any}>
            <Image
              src={detail.urls.regular}
              width={detail.width}
              height={detail.height}
              UNSAFE_style={{
                viewTransitionName: 'photo',
                '--scale': `min(100cqw / ${detail.width}, 100cqh / ${detail.height})`,
                width: `calc(${detail.width} * var(--scale))`,
                height: `calc(${detail.height} * var(--scale))`
              } as any} />
          </div>
        </ExampleApp2>
      }
    </>
  )
}

export function AppFrame({children, inert, hidden}: any) {
  let {direction} = useLocale();

  return (
    <div
      inert={inert || hidden}
      style={hidden ? {visibility: 'hidden', position: 'absolute'} : undefined}
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'toolbar toolbar',
          'sidebar content'
        ],
        gridTemplateRows: ['auto', '1fr'],
        gridTemplateColumns: ['auto', '1fr'],
        gap: 16,
        height: 'full',
        padding: 16,
        paddingBottom: 0,
        borderRadius: 'lg', overflow: 'clip', boxSizing: 'border-box', boxShadow: 'elevated',
        backgroundColor: 'layer-1'
      })}>
      <div
        className={style({
          gridArea: 'toolbar',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: 'full'
        })}>
        <ActionButton isQuiet><MenuHamburger /></ActionButton>
        <AdobeLogo size={24} />
        <span className={style({font: 'title'})}>{direction === 'rtl' ? 'طيف التفاعل' : 'React Spectrum'}</span>
        <div className={style({flexGrow: 1})}>
          <SearchField placeholder={direction === 'rtl' ? 'البحث عن الصور' : 'Search photos'} styles={style({maxWidth: 300, marginX: 'auto'})} />
        </div>
        <ActionButtonGroup>
          <ActionButton isQuiet>
            <HelpCircle />
          </ActionButton>
          <ActionButton isQuiet>
            <Bell />
          </ActionButton>
          <ActionButton isQuiet>
            <Apps />
          </ActionButton>
          <ActionButton isQuiet>
            <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
          </ActionButton>
        </ActionButtonGroup>
      </div>
      <div
        className={style({
          gridArea: 'sidebar',
          display: 'flex',
          flexDirection: 'column',
          gap: 8
        })}>
        <Button variant="accent" styles={style({marginBottom: 8})}>
          <Add />
        </Button>
        <ToggleButtonGroup
          aria-label="Navigation"
          isQuiet
          orientation="vertical"
          defaultSelectedKeys={['home']}>
          <ToggleButton id="home">
            <Home />
          </ToggleButton>
          <ToggleButton id="files">
            <Folder />
          </ToggleButton>
          <ToggleButton id="ideas">
            <Lightbulb />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        className={style({
          gridArea: 'content',
          backgroundColor: 'base',
          boxShadow: 'elevated',
          borderRadius: 'xl',
          borderBottomRadius: 'none',
          padding: 20,
          paddingBottom: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxSizing: 'border-box'
        })}>
        <div className={style({font: 'heading', marginBottom: 8})}>{direction === 'rtl' ? 'مؤخرًا' : 'Recents'}</div>
        {children || <div
          className={style({
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
            gridTemplateRows: 'min-content',
            justifyContent: 'space-between',
            gap: 16,
            marginTop: 16
          })}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>}
      </div>
    </div>
  )
}

const text = style({
  color: 'transparent',
  boxDecorationBreak: 'clone',
  borderRadius: 'sm',
  backgroundColor: 'gray-100'
});

export function SkeletonCard() {
  return (
    <Card size="S" styles={style({width: 'full'})}>
      <CardPreview>
        <div
          className={style({
            width: 'full',
            aspectRatio: '2/1',
            backgroundColor: 'gray-100'
          })} />
      </CardPreview>
      <Content>
        <Text slot="title"><span className={text} inert>Placeholder title</span></Text>
        <Text slot="description" UNSAFE_style={{WebkitTextFillColor: 'transparent'}}><span className={text} inert>This is placeholder content approximating the length of the real content to avoid layout shifting when the real content appears.</span></Text>
      </Content>
    </Card>
  );
}

function Example(props: any) {
  let list = useAsyncList<any, number | null>({
    async load({signal, cursor, items}) {
      let page = cursor || 1;
      let res = await fetch(
        `https://api.unsplash.com/topics/nature/photos?page=${page}&per_page=30&client_id=AJuU-FPh11hn7RuumUllp4ppT8kgiLS7LtOHp_sp4nc`,
        {signal}
      );
      let nextItems = await res.json();
      // Filter duplicates which might be returned by the API.
      let existingKeys = new Set(items.map(i => i.id));
      nextItems = nextItems.filter((i: any) => !existingKeys.has(i.id) && (i.description || i.alt_description));
      return {items: nextItems, cursor: nextItems.length ? page + 1 : null};
    }
  });

  return (
    <CardView
      aria-label="Nature photos"
      size="S"
      layout="grid"
      selectionMode="multiple"
      // selectionStyle={list.selectedKeys === 'all' || list.selectedKeys.size > 0 ? 'checkbox' : 'highlight'}
      selectedKeys={list.selectedKeys}
      onSelectionChange={list.setSelectedKeys}
      variant="quiet"
      loadingState={list.loadingState}
      onLoadMore={list.loadMore}
      styles={style({flexGrow: 1, minHeight: 0, maxHeight: 500, marginX: -12})}
      renderActionBar={() => {
        return (
          <ActionBar isEmphasized>
            <ActionButton>
              <Edit />
              <Text>Edit</Text>
            </ActionButton>
            <ActionButton>
              <FolderAdd />
              <Text>Add to</Text>
            </ActionButton>
            <ActionButton>
              <Share />
              <Text>Share</Text>
            </ActionButton>
            <ActionButton>
              <Download />
              <Text>Download</Text>
            </ActionButton>
            <ActionButton>
              <Tag />
              <Text>Keywords</Text>
            </ActionButton>
          </ActionBar>
        );
      }}>
      <Collection items={list.items}>
        {item => <PhotoCard item={item} onAction={props.onAction} />}
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
              }} />
          )}
        </SkeletonCollection>
      )}
    </CardView>
  );
}

function PhotoCard({item, onAction}: any) {
  let imgRef = useRef<HTMLImageElement | null>(null);
  return (
    <Card
      id={item.id}
      textValue={item.description || item.alt_description}
      onAction={() => {
        imgRef.current!.style.viewTransitionName = 'photo';
        document.startViewTransition(() => {
          imgRef.current!.style.viewTransitionName = '';
          flushSync(() => onAction([item, imgRef.current]));
        })
      }}>
      {({size}) => (<>
        <CardPreview>
          <Image
            ref={imgRef}
            data-photo-id={item.id}
            src={item.urls.regular}
            width={item.width}
            height={item.height}
            styles={style({
              width: 'full',
              pointerEvents: 'none',
              objectFit: 'cover'
            })} />
        </CardPreview>
        {/* <Content>
          <Text slot="title">{item.description || item.alt_description}</Text> */}
          {/* <div className={style({display: 'flex', alignItems: 'center', gap: 8, gridArea: 'description'})}>
            <Avatar src={item.user.profile_image.small} size={size} />
            <Text slot="description">{item.user.name}</Text>
          </div> */}
        {/* </Content> */}
      </>)}
    </Card>
  );
}
