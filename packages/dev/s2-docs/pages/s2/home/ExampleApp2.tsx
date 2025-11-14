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
import Apps from '@react-spectrum/s2/icons/AppsAll';
import TextBold from '@react-spectrum/s2/icons/TextBold';
import TextItalic from '@react-spectrum/s2/icons/TextItalic';
import TextUnderline from '@react-spectrum/s2/icons/TextUnderline';
import TextStrikeThrough from '@react-spectrum/s2/icons/TextStrikeThrough';
import TextSubscript from '@react-spectrum/s2/icons/TextSubscript';
import TextSuperscript from '@react-spectrum/s2/icons/TextSuperscript';
import TextAlignLeft from '@react-spectrum/s2/icons/TextAlignLeft';
import TextAlignCenter from '@react-spectrum/s2/icons/TextAlignCenter';
import TextAlignRight from '@react-spectrum/s2/icons/TextAlignRight';
import TextAlignJustify from '@react-spectrum/s2/icons/TextAlignJustify';
import {size, style} from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, Content, Text, ActionButton, Avatar, ToggleButton, Breadcrumbs, Breadcrumb, TextField, ToggleButtonGroup, Slider, Checkbox, TextArea, TreeView, TreeViewItem, TreeViewItemContent, ActionButtonGroup, Button, Form, ComboBoxItem, ComboBox, NumberField, Picker, PickerItem, Accordion, Disclosure, DisclosureHeader, DisclosureTitle, DisclosurePanel, Divider} from '@react-spectrum/s2';
import {Key} from 'react-aria';
import {createContext, useContext, useState} from 'react';
import {AccountMenu} from './ExampleApp';

export const FilterContext = createContext({
  brightness: 52,
  contrast: -47,
  saturation: 28,
  onChange: (v: any) => {}
});

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
        <ActionButton isQuiet aria-label="Back" onPress={onBack}>
          <ChevronLeft />
        </ActionButton>
        <Breadcrumbs onAction={onBack}>
          <Breadcrumb>Your files</Breadcrumb>
          <Breadcrumb>July final draft</Breadcrumb>
        </Breadcrumbs>
        <ActionButtonGroup>
          <ActionButton isQuiet aria-label="Help">
            <HelpCircle />
          </ActionButton>
          <ActionButton isQuiet aria-label="Notifications">
            <Bell />
          </ActionButton>
          <ActionButton isQuiet aria-label="Apps">
            <Apps />
          </ActionButton>
          <AccountMenu />
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
          padding: 8,
          boxSizing: 'border-box'
        })}>
        <ToggleButtonGroup
          aria-label="Tools"
          selectionMode="single"
          defaultSelectedKeys={['select']}
          isQuiet
          isEmphasized
          orientation="vertical">
          <ToggleButton id="select" aria-label="Select">
            <Select />
          </ToggleButton>
          <ToggleButton id="brush" aria-label="Brush">
            <Brush />
          </ToggleButton>
          <ToggleButton id="pencil" aria-label="Pencil">
            <Edit />
          </ToggleButton>
          <ToggleButton id="shapes" aria-label="Shapes">
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
            isTransitioning: 'all',
            '@media (prefers-reduced-motion: reduce)': 'none'
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
          padding: 8,
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
          selectedKeys={selectedPanel ? [selectedPanel] : []}
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
    <TreeView aria-label="Layers" styles={style({height: 'full'})} defaultExpandedKeys={['g1', 'g2']}>
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
  let {brightness, contrast, saturation, onChange} = useContext(FilterContext);
  return (
    <div role="group" aria-label="Properties" className={style({display: 'flex', flexDirection: 'column', gap: 8, padding: 8})}>
      <Accordion density="compact" isQuiet allowsMultipleExpanded defaultExpandedKeys={['filters', 'text']}>
        <Disclosure id="filters">
          <DisclosureTitle>Filters</DisclosureTitle>
          <DisclosurePanel>
            <Form labelPosition="side" size="S" UNSAFE_style={{gap: 8}}>
              <Slider label="Brightness" minValue={-100} maxValue={100} fillOffset={0} formatOptions={{signDisplay: 'exceptZero'}} defaultValue={brightness} onChange={brightness => onChange({brightness, contrast, saturation})} />
              <Slider label="Contrast" minValue={-100} maxValue={100} fillOffset={0} formatOptions={{signDisplay: 'exceptZero'}} defaultValue={contrast} onChange={contrast => onChange({brightness, contrast, saturation})} />
              <Slider label="Saturation" minValue={-100} maxValue={100} fillOffset={0} formatOptions={{signDisplay: 'exceptZero'}} defaultValue={saturation} onChange={saturation => onChange({brightness, contrast, saturation})} />
            </Form>
          </DisclosurePanel>
        </Disclosure>
        <Disclosure id="text">
          <DisclosureTitle>Text</DisclosureTitle>
          <DisclosurePanel>
            <Form size="S" UNSAFE_style={{gap: 8}}>
              <div className={style({display: 'flex', gap: 8, alignItems: 'center', gridColumnStart: 'span 2'})}>
              <ComboBox aria-label="Font family" defaultSelectedKey={2} styles={style({ flexGrow: 2 })}>
                <ComboBoxItem>Open Sans</ComboBoxItem>
                <ComboBoxItem id={2}>Adobe Clean</ComboBoxItem>
                <ComboBoxItem>Helvetica</ComboBoxItem>
                <ComboBoxItem>Times New Roman</ComboBoxItem>
                <ComboBoxItem>Comic Sans</ComboBoxItem>
              </ComboBox>
                <NumberField aria-label="Font size" defaultValue={14} styles={style({ flexGrow: 1 })} />
              </div>
              <div className={style({display: 'flex', gap: 4, justifyContent: 'space-between', alignItems: 'center', gridColumnStart: 'span 2'})}>
                <ToggleButtonGroup
                  aria-label="Font style"
                  density="compact"
                  size="S"
                  selectionMode="multiple"
                  defaultSelectedKeys={['bold']}>
                  <ToggleButton id="bold" aria-label="Bold">
                    <TextBold />
                  </ToggleButton>
                  <ToggleButton id="italic" aria-label="Italic">
                    <TextItalic />
                  </ToggleButton>
                  <ToggleButton id="underline" aria-label="Underline">
                    <TextUnderline />
                  </ToggleButton>
                  <ToggleButton id="strike" aria-label="Strikethrough">
                    <TextStrikeThrough />
                  </ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  aria-label="Font style"
                  density="compact"
                  size="S"
                  selectionMode="single">
                  <ToggleButton id="sub" aria-label="Subscript">
                    <TextSubscript />
                  </ToggleButton>
                  <ToggleButton id="super" aria-label="Superscript">
                    <TextSuperscript />
                  </ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  aria-label="Text align"
                  density="compact"
                  size="S"
                  selectionMode="single"
                  defaultSelectedKeys={['left']}
                  disallowEmptySelection>
                  <ToggleButton id="left" aria-label="Left">
                    <TextAlignLeft />
                  </ToggleButton>
                  <ToggleButton id="center" aria-label="Center">
                    <TextAlignCenter />
                  </ToggleButton>
                  <ToggleButton id="right" aria-label="Right">
                    <TextAlignRight />
                  </ToggleButton>
                  <ToggleButton id="justify" aria-label="Justify">
                    <TextAlignJustify />
                  </ToggleButton>
                </ToggleButtonGroup>
              </div>
              <Checkbox isSelected isDisabled>Wrap</Checkbox>
            </Form>
          </DisclosurePanel>
        </Disclosure>
      </Accordion>
    </div>
  );
}

function Comments() {
  let [comments, setComments] = useState([
    {
      author: 'Nikolas Gibbons',
      avatar: 'https://www.untitledui.com/images/avatars/nikolas-gibbons',
      date: '2 hours ago',
      body: 'Thanks for the feedback!'
    },
    {
      author: 'Adriana Sullivan',
      avatar: 'https://www.untitledui.com/images/avatars/adriana-sullivan',
      date: 'July 14',
      body: 'I love the colors! Can we add a little more pop?'
    }
  ]);

  return (
    <div role="group" aria-label="Comments" className={style({display: 'flex', flexDirection: 'column', gap: 16, padding: 16, height: 'full', boxSizing: 'border-box', contain: 'size'})}>
      <h3 className={style({font: 'title-lg', color: {default: 'title', forcedColors: 'ButtonText'}, marginY: 0})}>Comments</h3>
      <form
        className={style({
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'end'
        })}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.currentTarget.requestSubmit();
          }
        }}
        action={formData => {
          setComments([
            {
              author: 'You',
              avatar: 'https://i.imgur.com/xIe7Wlb.png',
              date: 'Just now',
              body: formData.get('comment')! as string
            },
            ...comments
          ]);
        }}>
        <TextArea
          aria-label="Add a comment"
          placeholder="Add a comment"
          name="comment"
          isRequired
          styles={style({width: 'full'})} />
        <Button type="submit" size="S" variant="accent">Post</Button>
      </form>
      <div
        className={style({
          display: 'flex',
          flexDirection: 'column',
          rowGap: 16,
          marginX: -16,
          marginBottom: -16,
          padding: 16,
          overflow: 'auto',
          flexGrow: 1,
          minHeight: 0
        })}>
        {comments.map((comment, i) => (
          <Comment key={i} {...comment} />
        ))}
      </div>
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
      <span className={style({gridArea: 'name', font: 'title-sm', color: {default: 'title', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {author}
      </span>
      <span className={style({gridArea: 'date', font: 'detail-sm', color: {default: 'detail', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {date}
      </span>
      <span className={style({gridArea: 'body', font: 'body', color: {default: 'body', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {body}
      </span>
    </div>
  )
}

function Assets() {
  return (
    <div role="group" aria-label="Assets" className={style({padding: 16, height: 'full', display: 'flex', flexDirection: 'column'})}>
      <div className={style({font: 'title-lg'})}>Assets</div>
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
