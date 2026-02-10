'use client';
import Select from '@react-spectrum/s2/icons/Select';
import ChevronLeft from '@react-spectrum/s2/icons/ChevronLeft';
import Brush from '@react-spectrum/s2/icons/Brush';
import Edit from '@react-spectrum/s2/icons/Edit';
import Shapes from '@react-spectrum/s2/icons/Shapes';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
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
import {Card, CardPreview, Content, Text, ActionButton, ToggleButton, Breadcrumbs, Breadcrumb, ToggleButtonGroup, Slider, Checkbox, TextArea, TreeView, TreeViewItem, TreeViewItemContent, ActionButtonGroup, Button, Form, ComboBoxItem, ComboBox, NumberField, Accordion, Disclosure, DisclosureTitle, DisclosurePanel} from '@react-spectrum/s2';
import {Key} from 'react-aria';
import {createContext, useContext, useRef, useState} from 'react';
import {ColorSchemeProvider} from './ExampleApp';
import { useResizeObserver } from '@react-aria/utils';
import { flushSync } from 'react-dom';
import { Comment } from './Typography';
import { HCMContext } from './HCM';
import { AccountMenu } from './app/AccountMenu';
import { Notifications } from './app/Notifications';

export const FilterContext = createContext({
  brightness: 52,
  contrast: -47,
  saturation: 28,
  onChange: (v: any) => {}
});

const SM_BREAK = 640 / 16;
const SM = `@container (width >= ${SM_BREAK}rem)`;

export function ExampleApp2({onBack, children, showPanel, panel, onPanelChange}: any) {
  let [selectedPanel, setSelectedPanel] = useState<Key | null>('properties');
  let [transitioning, setTransitioning] = useState<Key | null>(null);
  let displayPanel = panel || selectedPanel || transitioning;
  let [isLarge, setLarge] = useState(true);

  let setPanel = (panel: Key | null) => {
    onPanelChange?.(panel);
    setSelectedPanel(panel);
  };

  let ref = useRef<HTMLDivElement | null>(null);
  useResizeObserver({
    ref,
    onResize() {
      let width = ref.current!.getBoundingClientRect().width;
      let rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize);
      let breakpoint = width / rem;
      flushSync(() => {
        let matches = breakpoint >= SM_BREAK;
        setLarge(matches);
        if (!showPanel && selectedPanel && isLarge && !matches) {
          setPanel(null);
        }
      });
    },
  });

  return (
    <ColorSchemeProvider>
      <div
        ref={ref}
        className={style({
          display: 'grid',
          gridTemplateAreas: {
            default: [
              'toolbar toolbar',
              'content content',
              'assets assets',
              'panels panels'
            ],
            [SM]: [
              'toolbar toolbar toolbar toolbar',
              'sidebar content assets panels'
            ]
          },
          gridTemplateRows: {
            default: ['max-content', '1fr', 'auto', 'auto'],
            [SM]: ['max-content', '1fr']
          },
          gridTemplateColumns: {
            default: ['minmax(0, 1fr)', 'minmax(0, 1fr)'],
            [SM]: ['auto', '1fr', 'auto', 'auto']
          },
          height: 'full',
          '--radius': {
            type: 'borderTopStartRadius',
            value: 'lg'
          },
          borderRadius: '--radius',
          borderTopRadius: 'var(--app-frame-radius-top, var(--radius))',
          overflow: 'clip',
          boxSizing: 'border-box',
          boxShadow: 'elevated',
          position: 'relative',
          isolation: 'isolate'
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
            borderStyle: 'solid',
            maxWidth: 'full',
            overflowX: 'auto'
          })}>
          <ActionButton isQuiet aria-label="Back" onPress={onBack}>
            <ChevronLeft />
          </ActionButton>
          <div className={style({flexGrow: 1, overflow: 'auto'})}>
            <Breadcrumbs onAction={onBack}>
              <Breadcrumb>Your files</Breadcrumb>
              <Breadcrumb>July final draft</Breadcrumb>
            </Breadcrumbs>
          </div>
          <ActionButtonGroup>
            <div
              className={style({
                display: {
                  default: 'none',
                  [SM]: 'contents'
                }
              })}>
              <ActionButton isQuiet aria-label="Help">
                <HelpCircle />
              </ActionButton>
              <Notifications />
              <ActionButton isQuiet aria-label="Apps">
                <Apps />
              </ActionButton>
            </div>
            <AccountMenu />
          </ActionButtonGroup>
        </div>
        <div
          className={style({
            gridArea: 'sidebar',
            display: {
              default: 'none',
              [SM]: 'flex'
            },
            flexDirection: 'column',
            gap: 8,
            backgroundColor: {
              default: 'layer-1',
              forcedColors: 'Background'
            },
            padding: 16,
            boxSizing: 'border-box',
            borderWidth: 0,
            borderTopWidth: {
              default: 2,
              [SM]: 0
            },
            borderEndWidth: {
              default: 0,
              [SM]: 2
            },
            borderColor: {
              default: 'gray-200',
              forcedColors: 'ButtonBorder'
            },
            borderStyle: 'solid',
            overflow: 'auto'
          })}>
          <ToggleButtonGroup
            aria-label="Tools"
            selectionMode="single"
            defaultSelectedKeys={['select']}
            isQuiet
            isEmphasized
            orientation={isLarge ? 'vertical' : 'horizontal'}>
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
              default: 'full',
              [SM]: {
                default: 300,
                isCollapsed: 0
              }
            },
            height: {
              default: {
                default: 200,
                isCollapsed: 0
              },
              [SM]: 'auto'
            },
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
            },
            position: {
              default: 'absolute',
              [SM]: 'static'
            },
            bottom: 0,
            insetEnd: 0,
            contain: 'size'
          })({isCollapsed: !selectedPanel, isTransitioning: !!transitioning})}
          onTransitionEnd={() => {
            setTransitioning(null);
          }}>
          {displayPanel && 
            <div
              className={style({
                width: {
                  default: 'full',
                  [SM]: 300
                },
                height: 'full',
                overflow: 'auto',
                boxSizing: 'border-box',
                borderWidth: 0,
                borderStartWidth: {
                  default: 0,
                  [SM]: 2
                },
                borderTopWidth: {
                  default: 2,
                  [SM]: 0
                },
                borderColor: {
                  default: 'gray-200',
                  forcedColors: 'ButtonBorder'
                },
                borderStyle: 'solid'
              })}>
              {displayPanel === 'layers' && <Layers />}
              {displayPanel === 'properties' && <Properties />}
              {displayPanel === 'comments' && <Comments />}
              {displayPanel === 'assets' && <Assets />}
            </div>
          }
        </div>
        <div
          className={style({
            gridArea: 'panels',
            zIndex: 1,
            backgroundColor: {
              default: 'layer-1',
              forcedColors: 'Background'
            },
            padding: 16,
            boxSizing: 'border-box',
            borderWidth: 0,
            borderStartWidth: {
              default: 0,
              [SM]: 2
            },
            borderTopWidth: {
              default: 2,
              [SM]: 0
            },
            borderColor: {
              default: 'gray-200',
              forcedColors: 'ButtonBorder'
            },
            borderStyle: 'solid',
            overflow: 'auto'
          })}>
          <ToggleButtonGroup
            aria-label="Panels"
            orientation={isLarge ? 'vertical' : 'horizontal'}
            styles={style({marginX: 'auto', width: 'fit'})}
            isQuiet
            selectedKeys={selectedPanel ? [selectedPanel] : []}
            onSelectionChange={keys => {
              let key = [...keys][0];
              setPanel(key as string);
              if (key == null || displayPanel == null) {
                setTransitioning(key || displayPanel);
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
    </ColorSchemeProvider>
  );
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
  let isHCM = 'style' in useContext(HCMContext);
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
              <div
                className={style({
                  display: 'flex',
                  gap: 4,
                  justifyContent: {
                    default: 'start',
                    [SM]: 'space-between'
                  },
                  alignItems: 'center',
                  gridColumnStart: 'span 2'
                })}>
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
              <Checkbox defaultSelected isDisabled={isHCM}>Wrap</Checkbox>
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
      body: 'Transitions are smooth! Could we speed them up just a bit?'
    },
    {
      author: 'Frank Whitaker',
      avatar: 'https://www.untitledui.com/images/avatars/frank-whitaker?',
      date: 'July 13',
      body: 'Love the direction. Could we simplify the header a bit more?'
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
          rowGap: 20,
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

function Assets() {
  return (
    <div role="group" aria-label="Assets" className={style({padding: 16, boxSizing: 'border-box', height: 'full', display: 'flex', flexDirection: 'column'})}>
      <div className={style({font: 'title-lg'})}>Assets</div>
      <div
        className={style({
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${size(96)}, 1fr))`,
          gridAutoRows: 'max-content',
          justifyContent: 'space-between',
          gap: 12,
          margin: -16,
          marginTop: 0,
          padding: 16,
          flexGrow: 1,
          minHeight: 0,
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
