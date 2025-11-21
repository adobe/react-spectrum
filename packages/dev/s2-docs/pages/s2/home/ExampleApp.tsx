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
import Settings from '@react-spectrum/s2/icons/Settings';
import Tag from '@react-spectrum/s2/icons/Tag';
import Org from '@react-spectrum/s2/icons/Buildings';
import ViewGridFluid from '@react-spectrum/s2/icons/ViewGridFluid';
import ViewGrid from '@react-spectrum/s2/icons/ViewGrid';
import Search from '@react-spectrum/s2/icons/Search';
import {AdobeLogo} from '../../../src/icons/AdobeLogo';
import {style} from "@react-spectrum/s2/style" with {type: 'macro'};
import {Card, CardPreview, CardView, Collection, SkeletonCollection, Image, Content, Text, ActionButton, SearchField, Avatar, Button, ToggleButton, ActionBar, ToggleButtonGroup, ActionButtonGroup, MenuTrigger, Popover, Switch, Divider, Menu, MenuSection, SubmenuTrigger, MenuItem, SegmentedControl, SegmentedControlItem, DropZone, IllustratedMessage, Heading, ButtonGroup, Provider, Link} from '@react-spectrum/s2';
import {useLocale} from 'react-aria';
import {useAsyncList} from 'react-stately';
import { createContext, CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { ExampleApp2, FilterContext } from './ExampleApp2';
import { flushSync } from 'react-dom';
import DropToUpload from '@react-spectrum/s2/illustrations/gradient/generic2/DropToUpload';
import AIGenerateImage from '@react-spectrum/s2/illustrations/gradient/generic2/AIGenerateImage';
import Document from '@react-spectrum/s2/illustrations/gradient/generic2/Document';
import ImageStack from '@react-spectrum/s2/illustrations/gradient/generic2/ImageStack';
// @ts-ignore
import banner from 'url:./banner.png?as=webp';
import {useMediaQuery} from '@react-spectrum/utils';
import { PopoverContext } from 'react-aria-components';
import { HCMContext } from './HCM';

const XS = `@container (min-width: ${480 / 16}rem)`;
const SM = `@container (min-width: ${(640 / 16)}rem)`;
const MD = `@container (min-width: ${(768 / 16)}rem)`;

export function ExampleApp({showArrows}: {showArrows?: boolean} = {}) {
  let [[detail, img] = [], setDetail] = useState<[any, HTMLImageElement] | []>([]);

  return (
    <div className={style({containerType: 'inline-size', height: 'full', position: 'relative'})}>
      <AppFrame hidden={!!detail}>
        <Example onAction={setDetail} />
        {/* <HomePage /> */}
      </AppFrame>
      {!detail && showArrows && <Arrows />}
      {detail && img &&
        <Detail detail={detail} img={img} setDetail={setDetail} />
      }
      {detail && showArrows && <Arrows2 />}
    </div>
  );
}

function Detail({detail, img, setDetail}: any) {
  let [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0
  });

  return (
    <FilterContext value={{...filters, onChange: setFilters}}>
      <ExampleApp2 onBack={() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          setDetail([]);
          return;
        }

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
            alt={detail.description || detail.alt_description}
            UNSAFE_style={{
              viewTransitionName: 'photo',
              '--scale': `min(100cqw / ${detail.width}, 100cqh / ${detail.height})`,
              width: `calc(${detail.width} * var(--scale))`,
              height: `calc(${detail.height} * var(--scale))`,
              filter: `${filters.brightness ? `brightness(${filters.brightness + 100}%)` : ''} ${filters.contrast ? `contrast(${filters.contrast + 100}%)` : ''} ${filters.saturation ? `saturate(${filters.saturation + 100}%)` : ''}`
            } as any} />
        </div>
      </ExampleApp2>
    </FilterContext>
  );
}

const ColorSchemeContext = createContext<{colorScheme: 'light' | 'dark' | null, setColorScheme: (s: 'light' | 'dark' | null) => void}>({
  colorScheme: null,
  setColorScheme() {}
});


export function ColorSchemeProvider({children}: any) {
  let [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    let m = matchMedia('(prefers-color-scheme: dark)');
    let onChange = () => setColorScheme(null);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  return (
    <ColorSchemeContext value={{colorScheme, setColorScheme}}>
      <Provider colorScheme={colorScheme || undefined} styles={style({display: 'contents'})}>
        {children}
      </Provider>
    </ColorSchemeContext>
  );
}

export function AppFrame({children, inert, hidden}: any) {
  let {direction} = useLocale();

  return (
    <ColorSchemeProvider>
      <div
        inert={inert || hidden}
        style={hidden ? {visibility: 'hidden', position: 'absolute'} : undefined}
        className={style({
          display: 'grid',
          gridTemplateAreas: {
            default: [
              'toolbar',
              'content'
            ],
            [SM]: [
              'toolbar toolbar',
              'sidebar content'
            ]
          },
          gridTemplateRows: ['auto', '1fr'],
          gridTemplateColumns: {
            default: ['minmax(0, 1fr)'],
            [SM]: ['auto', 'minmax(0, 1fr)']
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
          '--shadow': {
            type: 'boxShadow',
            value: 'elevated'
          },
          boxShadow: 'var(--app-frame-shadow, var(--shadow))',
          backgroundColor: 'layer-1',
          isolation: 'isolate'
        })}>
        <div
          className={style({
            gridArea: 'toolbar',
            display: 'flex',
            padding: 16,
            boxSizing: 'border-box',
            gap: 16,
            alignItems: 'center',
            width: 'full'
          })}>
          <ActionButton isQuiet aria-label="Menu">
            <MenuHamburger />
          </ActionButton>
          <AdobeLogo size={24} className={style({flexShrink: 0})} />
          <span
            className={style({
              font: 'title',
              display: {
                default: 'none',
                [SM]: 'inline'
              }
            })}>
              {direction === 'rtl' ? 'تطبيقي' : 'My App'}
          </span>
          <div
            className={style({
              flexGrow: 1,
              display: {
                default: 'none',
                [MD]: 'block'
              }
            })}>
            <SearchField
              aria-label={direction === 'rtl' ? 'البحث عن الصور' : 'Search photos'}
              placeholder={direction === 'rtl' ? 'البحث عن الصور' : 'Search photos'}
              styles={style({
                maxWidth: 472,
                minWidth: 272,
                marginX: 'auto'
              })} />
          </div>
          <div
            className={style({
              flexGrow: 1,
              display: {
                default: 'block',
                [MD]: 'none'
              }
            })} />
          <ActionButtonGroup>
            <div
              className={style({
                display: {
                  default: 'contents',
                  [MD]: 'none'
                }
              })}>
              <ActionButton isQuiet aria-label="Search">
                <Search />
              </ActionButton>
            </div>
            <div
              className={style({
                display: {
                  default: 'none',
                  [XS]: 'contents'
                }
              })}>
              <ActionButton isQuiet aria-label="Help">
                <HelpCircle />
              </ActionButton>
              <ActionButton isQuiet aria-label="Notifications">
                <Bell />
              </ActionButton>
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
            paddingX: 16
          })}>
          <Button
            variant="accent"
            aria-label="Create"
            styles={style({marginBottom: 8})}>
            <Add />
          </Button>
          <ToggleButtonGroup
            aria-label="Navigation"
            isQuiet
            orientation="vertical"
            defaultSelectedKeys={['home']}
            disallowEmptySelection>
            <ToggleButton id="home" aria-label="Home">
              <Home />
            </ToggleButton>
            <ToggleButton id="files" aria-label="Files">
              <Folder />
            </ToggleButton>
            <ToggleButton id="ideas" aria-label="Ideas">
              <Lightbulb />
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <div
          className={style({
            gridArea: 'content',
            backgroundColor: 'base',
            boxShadow: 'elevated',
            borderRadius: {
              default: 'none',
              [SM]: 'xl'
            },
            borderBottomRadius: 'none',
            marginEnd: {
              default: 0,
              [SM]: 16
            },
            padding: 20,
            paddingBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            boxSizing: 'border-box'
          })}>
          {children || <>
            <div className={style({font: 'heading', marginBottom: 8})}>{direction === 'rtl' ? 'مؤخرًا' : 'Recents'}</div>
            <div
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
            </div>
          </>}
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
  let [layout, setLayout] = useState<'waterfall' | 'grid'>('waterfall');
  let {direction} = useLocale();
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
    <>
      <div className={style({display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8})}>
        <div className={style({font: 'heading'})}>{direction === 'rtl' ? 'الصور' : 'Photos'}</div>
        <SegmentedControl selectedKey={layout} onSelectionChange={setLayout as any}>
          <SegmentedControlItem id="waterfall" aria-label="Waterfall"><ViewGridFluid /></SegmentedControlItem>
          <SegmentedControlItem id="grid" aria-label="Grid"><ViewGrid /></SegmentedControlItem>
        </SegmentedControl>
      </div>
      <CardView
        aria-label="Nature photos"
        size="S"
        layout={layout}
        // selectionMode="multiple"
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
        <Collection items={list.items} dependencies={[layout]}>
          {item => <PhotoCard item={item} layout={layout} onAction={props.onAction} />}
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
                }}
                layout={layout} />
            )}
          </SkeletonCollection>
        )}
      </CardView>
    </>
  );
}

function PhotoCard({item, layout, onAction}: any) {
  let imgRef = useRef<HTMLImageElement | null>(null);
  return (
    <Card
      id={item.id}
      textValue={item.description || item.alt_description}
      onAction={() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          onAction([item, imgRef.current]);
          return;
        }

        imgRef.current!.style.viewTransitionName = 'photo';
        document.startViewTransition(() => {
          imgRef.current!.style.viewTransitionName = '';
          flushSync(() => onAction([item, imgRef.current]));
        })
      }}>
      <CardPreview>
        <Image
          ref={imgRef}
          data-photo-id={item.id}
          src={item.urls.regular}
          width={item.width}
          height={item.height}
          UNSAFE_style={{
            aspectRatio: layout === 'waterfall' ? `${item.width} / ${item.height}` : undefined
          }} />
      </CardPreview>
    </Card>
  );
}

export function AccountMenu() {
  let {locale} = useLocale();
  let {colorScheme, setColorScheme} = useContext(ColorSchemeContext);
  let prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  let isDark = colorScheme == null ? prefersDark : colorScheme === 'dark';
  return (
    <MenuTrigger>
      <ActionButton isQuiet aria-label="Account">
        <Avatar src="https://i.imgur.com/xIe7Wlb.png" />
      </ActionButton>
      <PopoverContextProvider>
        <Popover hideArrow placement="bottom end">
          <div className={style({paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 12})}>
            <div className={style({display: 'flex', gap: 12, alignItems: 'center', marginX: 12})}>
              <Avatar src="https://i.imgur.com/xIe7Wlb.png" size={56} />
              <div>
                <div className={style({font: 'title', color: {default: 'title', forcedColors: 'ButtonText'}})}>Devon Govett</div>
                <div className={style({font: 'ui', color: {default: 'body', forcedColors: 'ButtonText'}})}>user@example.com</div>
                <Switch isSelected={isDark} onChange={isSelected => setColorScheme(isSelected ? 'dark' : 'light')} styles={style({marginTop: 4})}>
                  {locale === 'ar-AE' ? 'المظهر الداكن' : 'Dark theme'}
                </Switch>
              </div>
            </div>
            <Divider styles={style({marginX: 12})} />
            <Menu aria-label="Account">
              <MenuSection>
                <SubmenuTrigger>
                  <MenuItem>
                    <Org />
                    <Text slot="label">{locale === 'ar-AE' ? 'منظمة' : 'Organization'}</Text>
                    <Text slot="value">Adobe</Text>
                  </MenuItem>
                  <PopoverContextProvider>
                    <Menu selectionMode="single" selectedKeys={['adobe']}>
                      <MenuItem id="adobe">Adobe</MenuItem>
                      <MenuItem id="nike">Nike</MenuItem>
                      <MenuItem id="apple">Apple</MenuItem>
                    </Menu>
                  </PopoverContextProvider>
                </SubmenuTrigger>
                <MenuItem>
                  <Settings />
                  <Text slot="label">{locale === 'ar-AE' ? 'إعدادات' : 'Settings'}</Text>
                </MenuItem>
              </MenuSection>
              <MenuSection>
                <MenuItem>{locale === 'ar-AE' ? 'الإشعارات القانونية' : 'Legal notices'}</MenuItem>
                <MenuItem>{locale === 'ar-AE' ? 'تسجيل الخروج' : 'Sign out'}</MenuItem>
              </MenuSection>
            </Menu>
          </div>
        </Popover>
      </PopoverContextProvider>
    </MenuTrigger>
  );
}

function PopoverContextProvider({children}: any) {
  let value = useContext(PopoverContext) as any;
  let hcm = useContext(HCMContext) as any;
  return (
    <PopoverContext value={{...value, ...hcm, style: {...value?.style, ...hcm?.style}}}>
      {children}
    </PopoverContext>
  );
}

function HomePage() {
  return (
    <div className={style({ display: 'flex', flexDirection: 'column', size: 'full', overflow: 'auto' })}>
      <div className={style({ paddingX: 32, marginBottom: 32, boxSizing: 'border-box', display: { default: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center' })} style={{ aspectRatio: '1280/322', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundImage: `url(${banner})` }}>
        <h2 className={style({ font: { default: 'heading', lg: 'heading-lg' }, color: 'black' })}>Find faster with semantic search</h2>
        <p className={style({ font: { default: 'body', lg: 'body-lg' }, color: 'black', marginTop: 0, marginBottom: 32 })}>Quickly find visuals, words, sounds, and more in your media.</p>
        <Button size="L" staticColor="black">Watch tutorial</Button>
      </div>
      <h1 className={style({ font: 'title-lg' })}>Start something new</h1>
      <div className={style({display: 'flex', gap: 16})}>
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
              <Button fillStyle="outline">Select files</Button>
            </ButtonGroup>
          </IllustratedMessage>
        </DropZone>
        <Card href="#">
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
        <Card href="#">
          <CardPreview>
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
              <Document />
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">Start from scratch</Text>
            <Text slot="description">Create a blank document</Text>
          </Content>
        </Card>
        <Card href="#">
          <CardPreview>
            <div
              className={style({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              })}>
              <ImageStack />
            </div>
          </CardPreview>
          <Content>
            <Text slot="title">Browse images</Text>
            <Text slot="description">Edit an existing image</Text>
          </Content>
        </Card>
      </div>
    </div>
  );
}

function Arrows() {
  return (
    <svg viewBox="0 0 1324 1200" style={{position: 'absolute', inset: -150, top: -50, pointerEvents: 'none'}}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 6 6"
          refX={3}
          refY={3}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
          fill="white">
          <circle r={3} cx={3} cy={3} />
        </marker>
      </defs>
      <Arrow textX={75} x1={120} x2={160} y={130} href="Button.html">Button</Arrow>
      <Arrow textX={0} x1={120} x2={160} y={178} href="ToggleButtonGroup.html">ToggleButtonGroup</Arrow>
      <Arrow textX={632} y={24} points="662,34 662,64" marker="markerEnd" href="SearchField.html">SearchField</Arrow>
      <Arrow textX={1206} x1={1198} x2={1158} y={82} marker="markerEnd" href="Menu.html">Menu</Arrow>
      <Arrow textX={1206} x1={1198} x2={1142} y={150} marker="markerEnd" href="SegmentedControl.html">SegmentedControl</Arrow>
      <Arrow textX={1206} x1={1198} x2={1142} y={350} marker="markerEnd" href="CardView.html">CardView</Arrow>
    </svg>
  );
}

function Arrows2() {
  return (
    <svg viewBox="0 0 1324 1200" style={{position: 'absolute', inset: -150, top: -50, pointerEvents: 'none'}}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 6 6"
          refX={3}
          refY={3}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
          fill="white">
          <circle r={3} cx={3} cy={3} />
        </marker>
      </defs>
      <Arrow textX={35} x1={120} x2={160} y={82} href="ActionButton.html">ActionButton</Arrow>
      <Arrow textX={0} x1={120} x2={160} y={178} href="ToggleButtonGroup.html">ToggleButtonGroup</Arrow>
      <Arrow textX={212} y={24} points="250,34 250,64" href="Breadcrumbs.html">Breadcrumbs</Arrow>
      <Arrow textX={1206} x1={1198} x2={1158} y={82} href="Menu.html">Menu</Arrow>
      <Arrow textX={1206} x1={1198} x2={1100} y={168} href="Slider.html">Slider</Arrow>
      <Arrow textX={1206} points="900,290 900,280 1198,280" marker="markerStart" y={280} href="ComboBox.html">ComboBox</Arrow>
      <Arrow textX={1206} x1={1198} x2={1100} y={304} href="NumberField.html">NumberField</Arrow>
      <Arrow textX={1206} x1={1198} x2={890} y={365} href="Checkbox.html">Checkbox</Arrow>
    </svg>
  );
}

interface ArrowProps {
  href: string,
  children: ReactNode,
  textX: number,
  x1?: number,
  x2?: number,
  points?: string,
  y: number,
  marker?: 'markerStart' | 'markerEnd' | 'none'
}

export function Arrow({href, children, textX, x1, x2, points, y, marker = 'markerEnd'}: ArrowProps): ReactNode {
  let markerProps = marker === 'none' ? {} : {...{[marker]: 'url(#arrow)'}};
  return (
    <>
      {points
        ? <polyline points={points} {...markerProps} stroke="white" fill="none" />
        : <line x1={x1} y1={y} x2={x2} y2={y} {...markerProps} stroke="white" />
      }
      <Link href={href} target="_blank" isQuiet isStandalone staticColor="white" UNSAFE_style={{pointerEvents: 'auto'}}>
        <text x={textX} y={y + 3} fill="currentColor" textDecoration="inherit">{children}</text>
      </Link>
    </>
  );
}
