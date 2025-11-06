'use client';
import MenuHamburger from '@react-spectrum/s2/icons/MenuHamburger';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Bell from '@react-spectrum/s2/icons/Bell';
import Apps from '@react-spectrum/s2/icons/AppsAll';
import Add from '@react-spectrum/s2/icons/Add';
import Home from '@react-spectrum/s2/icons/Home';
import Folder from '@react-spectrum/s2/icons/Folder';
import Lightbulb from '@react-spectrum/s2/icons/Lightbulb';
import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, Content, Text, ActionButton, SearchField, Avatar, Button, ToggleButton} from '@react-spectrum/s2';
import { useLocale } from 'react-aria';

export function ExampleApp() {
  let {direction} = useLocale();

  return (
    <div
      inert
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'toolbar toolbar',
          'sidebar content'
        ],
        gridTemplateRows: ['auto', '1fr'],
        gridTemplateColumns: ['auto', '1fr'],
        gap: 16,
        height: 'full'
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
          <SearchField placeholder={direction === 'rtl' ? 'يبحث' : 'Search'} styles={style({maxWidth: 400, marginX: 'auto'})} />
        </div>
        <HelpCircle />
        <Bell />
        <Apps />
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
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
        <ToggleButton isSelected>
          <Home />
        </ToggleButton>
        <ActionButton isQuiet>
          <Folder />
        </ActionButton>
        <ActionButton isQuiet>
          <Lightbulb />
        </ActionButton>
      </div>
      <div
        className={style({
          gridArea: 'content',
          backgroundColor: 'base',
          boxShadow: 'elevated',
          borderRadius: 'xl',
          borderBottomRadius: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(128px, 1fr))',
          gridTemplateRows: 'min-content',
          justifyContent: 'space-between',
          gap: 16,
          padding: 20
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

function SkeletonCard() {
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
        <Text slot="title"><span className={text}>Placeholder title</span></Text>
        <Text slot="description" UNSAFE_style={{WebkitTextFillColor: 'transparent'}}><span className={text}>This is placeholder content approximating the length of the real content to avoid layout shifting when the real content appears.</span></Text>
      </Content>
    </Card>
  );
}
