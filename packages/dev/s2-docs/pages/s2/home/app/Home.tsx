'use client';
import { style } from "@react-spectrum/s2/style" with { type: 'macro' };
import { Card, CardPreview, Content, Text, Button, DropZone, IllustratedMessage, Heading, ButtonGroup } from '@react-spectrum/s2';
import DropToUpload from '@react-spectrum/s2/illustrations/gradient/generic2/DropToUpload';
import AIGenerateImage from '@react-spectrum/s2/illustrations/gradient/generic2/AIGenerateImage';
import MagicWand from '@react-spectrum/s2/illustrations/gradient/generic2/MagicWand';
import Properties from '@react-spectrum/s2/illustrations/gradient/generic2/Properties';
// @ts-ignore
import Banner from './banner.svg';
import {PhotoCard} from './Photos';
import { Arrow, Arrows } from "./Arrows";
import { useEffect, useState } from "react";

export function HomePage() {
  return (
    <div className={style({ display: 'flex', flexDirection: 'column', size: 'full', paddingBottom: 32 })}>
      <div className={style({ paddingX: 32, paddingY: 40, flexShrink: 0, marginBottom: 32, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRadius: 'lg', overflow: 'clip' })} style={{ position: 'relative', isolation: 'isolate' }}>
        <Banner style={{position: 'absolute', zIndex: -1, top: 0, left: 0, width: '100%', height: '100%'}} preserveAspectRatio="none" />
        <h2 className={style({ marginTop: 0, font: 'heading', color: 'gray-1000' })}>Find faster with semantic search</h2>
        <p className={style({ font: 'body', color: 'gray-1000', marginTop: 0, marginBottom: 32 })}>Quickly find visuals, words, sounds, and more in your media.</p>
        <Button staticColor="auto">Watch tutorial</Button>
      </div>
      <h3 className={style({ font: 'title-lg' })}>Get started</h3>
      <div className={style({display: 'flex', gap: 16, padding: 16, margin: -16, flexShrink: 0, height: 'min', overflowX: 'auto'})}>
        <DropZone styles={style({flexGrow: 2, flexShrink: 0})}>
          <IllustratedMessage orientation="horizontal" size="S">
            <DropToUpload />
            <Heading>
              Drag and drop your file
            </Heading>
            <Content>
              Or, select a file from your computer
            </Content>
            <ButtonGroup>
              <Button fillStyle="outline">Add photos</Button>
            </ButtonGroup>
          </IllustratedMessage>
        </DropZone>
        <Card href="#" styles={style({minWidth: 'max'})}>
          <CardPreview>
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
              <AIGenerateImage />
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">Generate an image</Text>
            <Text slot="description">Create an image from text</Text>
          </Content>
        </Card>
        <Card href="#" styles={style({minWidth: 'max'})}>
          <CardPreview>
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
              <MagicWand />
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">Apply a preset</Text>
            <Text slot="description">Enhance an existing image</Text>
          </Content>
        </Card>
        <Card href="#" styles={style({minWidth: 'max'})}>
          <CardPreview>
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
              <Properties />
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">Adjust colors</Text>
            <Text slot="description">Manually edit an image</Text>
          </Content>
        </Card>
      </div>
      <h3 className={style({ font: 'title-lg', marginTop: 40 })}>Recents</h3>
      <div className={style({display: 'flex', gap: 16, padding: 16, margin: -16, flexShrink: 0, height: 'min', overflowX: 'auto'})}>
        <PhotoCard
          styles={style({minWidth: 200})}
          item={{
            urls: {regular: 'https://images.unsplash.com/photo-1763641683842-3b4f09950d67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2Mzc1NDk4OXw&ixlib=rb-4.1.0&q=80&w=1080'},
          }} />
        <PhotoCard
          styles={style({minWidth: 200})}
          item={{
            urls: {regular: 'https://images.unsplash.com/photo-1762532985216-6561bb733c56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2Mzc1NDk4OXw&ixlib=rb-4.1.0&q=80&w=1080'},
          }} />
        <PhotoCard
          styles={style({minWidth: 200})}
          item={{
            urls: {regular: 'https://images.unsplash.com/photo-1762385653060-52aa4ec2937d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2Mzc2MTUxOHw&ixlib=rb-4.1.0&q=80&w=1080'},
          }} />
        <PhotoCard
          styles={style({minWidth: 200})}
          item={{
            urls: {regular: 'https://images.unsplash.com/photo-1762030085994-79285eee5bc9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wzNDA4NDh8MHwxfHRvcGljfHw2c01WalRMU2tlUXx8fHx8Mnx8MTc2Mzc2MTUzMHw&ixlib=rb-4.1.0&q=80&w=1080'},
          }} />
        
      </div>
    </div>
  );
}

export function HomeArrows() {
  let [isScrolled, setScrolled] = useState(false);
  useEffect(() => {
    let content = document.querySelector('[data-content]') as HTMLElement;
    if (content) {
      content.onscroll = () => {
        setScrolled(content.scrollTop > 0);
      };
    }
  }, []);

  return (
    <Arrows>
      <Arrow textX={75} x1={120} x2={160} y={130} href="Button">Button</Arrow>
      <Arrow textX={38} x1={120} x2={160} y={618} href="ActionButton">ActionButton</Arrow>
      {!isScrolled && <Arrow textX={56} x1={120} x2={250} y={520} href="DropZone">DropZone</Arrow>}
      <Arrow textX={632} y={24} points="662,34 662,64" marker="markerEnd" href="SearchField">SearchField</Arrow>
      <Arrow textX={1040} y={24} points="1064,34 1064,64" marker="markerEnd" href="Popover">Popover</Arrow>
      <Arrow textX={1206} x1={1198} x2={1158} y={82} marker="markerEnd" href="Menu">Menu</Arrow>
      {!isScrolled && <Arrow textX={1206} x1={1198} x2={1120} y={520} href="Card">Card</Arrow>}
    </Arrows>
  );
}
