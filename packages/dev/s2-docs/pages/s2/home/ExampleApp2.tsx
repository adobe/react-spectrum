'use client';
import Select from '@react-spectrum/s2/icons/Select';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import Brush from '@react-spectrum/s2/icons/Brush';
import Edit from '@react-spectrum/s2/icons/Edit';
import Shapes from '@react-spectrum/s2/icons/Shapes';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Bell from '@react-spectrum/s2/icons/Bell';
import LayersIcon from '@react-spectrum/s2/icons/Layers';
import PropertiesIcon from '@react-spectrum/s2/icons/Properties';
import CommentIcon from '@react-spectrum/s2/icons/Comment';
import Asset from '@react-spectrum/s2/icons/Asset';
import AlignLeft from '@react-spectrum/s2/icons/AlignLeft';
import AlignCenter from '@react-spectrum/s2/icons/AlignCenter';
import AlignRight from '@react-spectrum/s2/icons/AlignRight';
import AlignTop from '@react-spectrum/s2/icons/AlignTop';
import AlignMiddle from '@react-spectrum/s2/icons/AlignMiddle';
import AlignBottom from '@react-spectrum/s2/icons/AlignBottom';
import Apps from '@react-spectrum/s2/icons/AppsAll';

import { size, style } from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, Content, Text, ActionButton, Avatar, ToggleButton, Breadcrumbs, Breadcrumb, TextField, ToggleButtonGroup, Slider, Checkbox, TextArea, TreeView, TreeViewItem, TreeViewItemContent, ActionButtonGroup} from '@react-spectrum/s2';
import { Key } from 'react-aria';
import { useState } from 'react';

export function ExampleApp2({onBack, children}: any) {
  let [selectedPanel, setPanel] = useState<Key | null>('properties');
  let [transitioning, setTransitioning] = useState<Key | null>(null);
  let panel = selectedPanel || transitioning;

  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'toolbar toolbar toolbar toolbar',
          'sidebar content assets panels'
        ],
        gridTemplateRows: ['auto', '1fr'],
        gridTemplateColumns: ['auto', '1fr', 'auto', 'auto'],
        height: 'full',
        borderRadius: 'lg',
        overflow: 'clip',
        boxSizing: 'border-box',
        boxShadow: 'elevated',
      })}>
      <div
        className={style({
          gridArea: 'toolbar',
          backgroundColor: {
            default: 'layer-1',
            forcedColors: 'Background'
          },
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          width: 'full',
          height: 'full',
          padding: 16,
          boxSizing: 'border-box',
          borderWidth: 0,
          borderBottomWidth: 2,
          borderColor: {
            default: 'gray-200',
            forcedColors: 'ButtonBorder'
          },
          borderStyle: 'solid'
        })}>
        <ActionButton isQuiet onPress={onBack}><ChevronLeft /></ActionButton>
        <Breadcrumbs onAction={onBack}>
          <Breadcrumb>Your files</Breadcrumb>
          <Breadcrumb>July final draft</Breadcrumb>
        </Breadcrumbs>
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
          gap: 8,
          backgroundColor: {
            default: 'layer-1',
            forcedColors: 'Background'
          },
          padding: 16,
          boxSizing: 'border-box'
        })}>
        <ToggleButtonGroup
          aria-label="Tools"
          selectionMode="single"
          defaultSelectedKeys={['select']}
          isQuiet
          orientation="vertical">
          <ToggleButton id="select">
            <Select />
          </ToggleButton>
          <ToggleButton id="brush">
            <Brush />
          </ToggleButton>
          <ToggleButton id="edit">
            <Edit />
          </ToggleButton>
          <ToggleButton id="shapes">
            <Shapes />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div
        className={style({
          gridArea: 'content',
          backgroundColor: {
            default: 'pasteboard',
            forcedColors: 'Background'
          },
          contain: 'size'
        })}>
        {children}
      </div>
      <div
        className={style({
          gridArea: 'assets',
          width: {
            default: 300,
            isCollapsed: 0
          },
          overflow: 'clip',
          transition: {
            isTransitioning: 'all'
          },
          transitionDuration: {
            isTransitioning: 300
          },
          backgroundColor: {
            default: 'layer-1',
            forcedColors: 'Background'
          },
          '--s2-container-bg': {
            type: 'backgroundColor',
            value: {
              default: 'layer-1',
              forcedColors: 'Background'
            }
          }
        })({isCollapsed: !selectedPanel, isTransitioning: !!transitioning})}
        onTransitionEnd={() => {
          setTransitioning(null);
        }}>
        {panel && 
          <div
            className={style({
              width: 300,
              height: 'full',
              boxSizing: 'border-box',
              borderWidth: 0,
              borderStartWidth: 2,
              borderColor: {
                default: 'gray-200',
                forcedColors: 'ButtonBorder'
              },
              borderStyle: 'solid'
            })}>
            {panel === 'layers' && <Layers />}
            {panel === 'properties' && <Properties />}
            {panel === 'comments' && <Comments />}
            {panel === 'assets' && <Assets />}
          </div>
        }
      </div>
      <div
        className={style({
          gridArea: 'panels',
          backgroundColor: {
            default: 'layer-1',
            forcedColors: 'Background'
          },
          padding: 16,
          boxSizing: 'border-box',
          borderWidth: 0,
          borderStartWidth: 2,
          borderColor: {
            default: 'gray-200',
            forcedColors: 'ButtonBorder'
          },
          borderStyle: 'solid'
        })}>
        <ToggleButtonGroup
          aria-label="Panels"
          orientation="vertical"
          isQuiet
          selectedKeys={panel ? [panel] : []}
          onSelectionChange={keys => {
            let key = [...keys][0];
            setPanel(key as string);
            if (key == null || panel == null) {
              setTransitioning(key || panel);
            }
          }}>
          <ToggleButton id="layers" aria-label="Layers">
            <LayersIcon />
          </ToggleButton>
          <ToggleButton id="properties" aria-label="Properties">
            <PropertiesIcon />
          </ToggleButton>
          <ToggleButton id="comments" aria-label="Comments">
            <CommentIcon />
          </ToggleButton>
          <ToggleButton id="assets" aria-label="Assets">
            <Asset />
          </ToggleButton>
        </ToggleButtonGroup>
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

function Layers() {
  return (
    <TreeView styles={style({height: 'full'})} defaultExpandedKeys={['g1', 'g2']}>
      <Layer name="Group 1" id="g1">
        <Layer name="Layer 1" />
        <Layer name="Layer 2" />
        <Layer name="Layer 3" />
      </Layer>
      <Layer name="Group 2" id="g2">
        <Layer name="Layer 1" />
        <Layer name="Layer 2" />
        <Layer name="Layer 3" />
      </Layer>
    </TreeView>
  )
}

function Layer({id, name, children}: any) {
  return (
    <TreeViewItem id={id} textValue={name}>
      <TreeViewItemContent>{name}</TreeViewItemContent>
      {children}
    </TreeViewItem>
  );
}

function Properties() {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 8, padding: 16})}>
      <div className={style({font: 'title', color: 'ButtonText'})}>Position</div>
      <div className={style({display: 'flex', gap: 8})}>
        <TextField label="X" size="S" labelPosition="side" value="180px" />
        <TextField label="Y" size="S" labelPosition="side" value="25px" />
      </div>
      <div className={style({display: 'flex', gap: 8})}>
        <TextField label="W" size="S" labelPosition="side" value="300px" />
        <TextField label="H" size="S" labelPosition="side" value="32px" />
      </div>
      <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
        <div className={style({font: 'ui-sm', color: 'ButtonText'})}>Alignment</div>
        <ToggleButtonGroup density="compact" size="S" defaultSelectedKeys={['left']} styles={style({gridColumnStart: 'field'})}>
          <ToggleButton id="left">
            <AlignLeft />
          </ToggleButton>
          <ToggleButton id="center">
            <AlignCenter />
          </ToggleButton>
          <ToggleButton id="right">
            <AlignRight />
          </ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup density="compact" size="S" defaultSelectedKeys={['middle']} styles={style({gridColumnStart: 'field'})}>
          <ToggleButton id="top">
            <AlignTop />
          </ToggleButton>
          <ToggleButton id="middle">
            <AlignMiddle />
          </ToggleButton>
          <ToggleButton id="bottom">
            <AlignBottom />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
      <div className={style({font: 'title', color: 'ButtonText', marginTop: 16})}>Appearance</div>
      <Slider label="Opacity" labelPosition="side" size="S" defaultValue={50} />
      <div className={style({display: 'flex', gap: 8, alignItems: 'center'})}>
        <TextField label="Fill" size="S" labelPosition="side" value="#FF0000" styles={style({flexGrow: 1})} />
        <TextField label="Stroke" size="S" labelPosition="side" value="#3449B4" styles={style({flexGrow: 1})} />
      </div>
      <Checkbox isDisabled size="S" isSelected>Antialiased</Checkbox>
    </div>
  );
}

function Comments() {
  return (
    <div className={style({display: 'flex', flexDirection: 'column', gap: 16, padding: 16})}>
      <h3 className={style({font: 'title-lg', marginY: 0})}>Comments</h3>
      <TextArea aria-label="Add a comment" placeholder="Add a comment" />
      <Comment
        author="Nikolas Gibbons"
        avatar="https://www.untitledui.com/images/avatars/nikolas-gibbons"
        date="2 hours ago"
        body="Thanks for the feedback!" />
      <Comment
        author="Adriana Sullivan"
        avatar="https://www.untitledui.com/images/avatars/adriana-sullivan"
        date="July 14"
        body="I love the colors! Can we add a little more pop?" />
    </div>
  );
}

function Comment({author, avatar, date, body}: any) {
  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'avatar name',
          'avatar date',
          '. .',
          'body body'
        ],
        gridTemplateColumns: ['auto', '1fr'],
        gridTemplateRows: ['auto', 'auto', 8, 'auto'],
        columnGap: 8,
        alignItems: 'center'
      })}>
      <Avatar styles={style({gridArea: 'avatar'})} src={avatar} size={32} />
      <span className={style({gridArea: 'name', font: 'title-sm', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {author}
      </span>
      <span className={style({gridArea: 'date', font: 'detail-sm', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {date}
      </span>
      <span className={style({gridArea: 'body', font: 'body', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {body}
      </span>
    </div>
  )
}

function Assets() {
  return (
    <div className={style({padding: 16, height: 'full', display: 'flex', flexDirection: 'column'})}>
      <div className={style({font: 'title'})}>Assets</div>
      <div
        className={style({
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${size(96)}, 1fr))`,
          gridTemplateRows: 'min-content',
          justifyContent: 'space-between',
          gap: 12,
          marginTop: 16,
          flexGrow: 1,
          minHeight: 0,
          contain: 'size',
          overflow: 'auto'
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
  );
}
