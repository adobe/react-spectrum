'use client';
import Select from '@react-spectrum/s2/icons/Select';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import Brush from '@react-spectrum/s2/icons/Brush';
import Edit from '@react-spectrum/s2/icons/Edit';
import Shapes from '@react-spectrum/s2/icons/Shapes';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Bell from '@react-spectrum/s2/icons/Bell';
import Layers from '@react-spectrum/s2/icons/Layers';
import Settings from '@react-spectrum/s2/icons/Settings';
import Comment from '@react-spectrum/s2/icons/Comment';
import Asset from '@react-spectrum/s2/icons/Asset';

import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import { size, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, Content, Text, ActionButton, SearchField, Avatar, Button, ToggleButton, Breadcrumbs, Breadcrumb} from '@react-spectrum/s2';
import { useLocale } from 'react-aria';

export function ExampleApp2() {
  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'toolbar toolbar toolbar toolbar',
          'sidebar content assets panels'
        ],
        gridTemplateRows: ['auto', '1fr'],
        gridTemplateColumns: ['auto', '2fr', '1fr', 'auto'],
        height: 'full'
      })}>
      <div
        className={style({
          gridArea: 'toolbar',
          backgroundColor: 'layer-1',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: 'full',
          padding: 16,
          boxSizing: 'border-box',
          borderWidth: 0,
          borderBottomWidth: 2,
          borderColor: 'gray-200',
          borderStyle: 'solid'
        })}>
        <ActionButton isQuiet><ChevronLeft /></ActionButton>
        <Breadcrumbs>
          <Breadcrumb>Your files</Breadcrumb>
          <Breadcrumb>July final draft</Breadcrumb>
        </Breadcrumbs>
        <Bell />
        <HelpCircle />
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      </div>
      <div
        className={style({
          gridArea: 'sidebar',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'layer-1',
          padding: 16,
          boxSizing: 'border-box'
        })}>
        <ToggleButton isSelected>
          <Select />
        </ToggleButton>
        <ActionButton isQuiet>
          <Brush />
        </ActionButton>
        <ActionButton isQuiet>
          <Edit />
        </ActionButton>
        <ActionButton isQuiet>
          <Shapes />
        </ActionButton>
      </div>
      <div
        className={style({
          gridArea: 'content',
          backgroundColor: 'pasteboard'
        })} />
      <div
        className={style({
          gridArea: 'assets',
          backgroundColor: 'layer-1',
          padding: 16,
          boxSizing: 'border-box'
        })}>
        <div className={style({font: 'title'})}>Assets</div>
        <div
          className={style({
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${size(96)}, 1fr))`,
            gridTemplateRows: 'min-content',
            justifyContent: 'space-between',
            gap: 12,
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
        </div>
      </div>
      <div
        className={style({
          gridArea: 'panels',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          backgroundColor: 'layer-1',
          padding: 16,
          boxSizing: 'border-box',
          borderWidth: 0,
          borderStartWidth: 2,
          borderColor: 'gray-200',
          borderStyle: 'solid'
        })}>
        <ActionButton isQuiet>
          <Layers />
        </ActionButton>
        <ActionButton isQuiet>
          <Settings />
        </ActionButton>
        <ActionButton isQuiet>
          <Comment />
        </ActionButton>
        <ToggleButton isSelected>
          <Asset />
        </ToggleButton>
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
    <Card size="XS" styles={style({width: 'full'})}>
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
        <Text slot="description" UNSAFE_style={{WebkitTextFillColor: 'transparent'}}><span className={text}>Testing</span></Text>
      </Content>
    </Card>
  );
}
