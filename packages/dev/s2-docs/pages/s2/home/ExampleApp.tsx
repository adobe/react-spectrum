'use client';
import HelpCircle from '@react-spectrum/s2/icons/HelpCircle';
import Apps from '@react-spectrum/s2/icons/AppsAll';
import Search from '@react-spectrum/s2/icons/Search';
// @ts-ignore
import { AdobeLogo } from '../../../src/icons/AdobeLogo';
import { style } from "@react-spectrum/s2/style" with { type: 'macro' };
import { Card, CardPreview, Image, Content, Text, ActionButton, SearchField, ActionButtonGroup, Provider } from '@react-spectrum/s2';
import { useLocale } from 'react-aria';
import { createContext, useContext, useEffect, useState } from 'react';
import { ExampleApp2, FilterContext } from './ExampleApp2';
import { flushSync } from 'react-dom';
// @ts-ignore
import { Photos } from './app/Photos';
import { Sidebar } from './app/Sidebar';
import { AccountMenu } from './app/AccountMenu';
import { HomeArrows, HomePage } from './app/Home';
import { Arrow, Arrows } from './app/Arrows';
import { Notifications } from './app/Notifications';
import { Ideas, IdeasArrows } from './app/Ideas';

const XS = `@container (min-width: ${480 / 16}rem)`;
const SM = `@container (min-width: ${(640 / 16)}rem)`;
const MD = `@container (min-width: ${(768 / 16)}rem)`;

export function ExampleApp({showArrows}: {showArrows?: boolean} = {}) {
  let [page, setPage] = useState<'photos' | 'home' | 'ideas'>('photos');
  let [[detail, img] = [], setDetail] = useState<[any, HTMLImageElement] | []>([]);

  return (
    <ColorSchemeProvider>
      <div data-container className={style({containerType: 'inline-size', height: 'full', position: 'relative'})}>
        <AppFrame page={page} onPageChange={setPage} hidden={!!detail}>
          {page === 'photos' && <Photos onAction={setDetail} />}
          {page === 'home' && <HomePage />}
          {page === 'ideas' && <Ideas />}
        </AppFrame>
        {!detail && page === 'home' && showArrows && <HomeArrows />}
        {!detail && page === 'photos' && showArrows &&
          <Arrows>
            <Arrow textX={75} x1={120} x2={160} y={130} href="Button">Button</Arrow>
            <Arrow textX={38} x1={120} x2={160} y={618} href="ActionButton">ActionButton</Arrow>
            <Arrow textX={632} y={24} points="662,34 662,64" marker="markerEnd" href="SearchField">SearchField</Arrow>
            <Arrow textX={1040} y={24} points="1064,34 1064,64" marker="markerEnd" href="Popover">Popover</Arrow>
            <Arrow textX={1206} x1={1198} x2={1158} y={82} marker="markerEnd" href="Menu">Menu</Arrow>
            <Arrow textX={1206} x1={1198} x2={1142} y={150} marker="markerEnd" href="SegmentedControl">SegmentedControl</Arrow>
            <Arrow textX={1206} x1={1198} x2={1142} y={350} marker="markerEnd" href="CardView">CardView</Arrow>
          </Arrows>
        }
        {!detail && page === 'ideas' && showArrows && <IdeasArrows />}
        {detail && img &&
          <Detail detail={detail} img={img} setDetail={setDetail} showArrows={showArrows} />
        }
      </div>
    </ColorSchemeProvider>
  );
}

function Detail({detail, img, setDetail, showArrows}: any) {
  let [panel, setPanel] = useState('properties');
  let [filters, setFilters] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0
  });

  return (
    <FilterContext value={{...filters, onChange: setFilters}}>
      <ExampleApp2
        panel={panel}
        onPanelChange={setPanel}
        onBack={() => {
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
      {showArrows && 
        <Arrows>
          <Arrow textX={35} x1={120} x2={160} y={82} href="ActionButton">ActionButton</Arrow>
          <Arrow textX={0} x1={120} x2={160} y={178} href="ToggleButtonGroup">ToggleButtonGroup</Arrow>
          <Arrow textX={212} y={24} points="250,34 250,64" href="Breadcrumbs">Breadcrumbs</Arrow>
          <Arrow textX={1040} y={24} points="1064,34 1064,64" marker="markerEnd" href="Popover">Popover</Arrow>
          <Arrow textX={1206} x1={1198} x2={1158} y={82} href="Menu">Menu</Arrow>
          {panel === 'layers' && <>
            <Arrow textX={1206} x1={1198} x2={1050} y={168} href="TreeView">TreeView</Arrow>
          </>}
          {panel === 'properties' && <>
            <Arrow textX={1206} x1={1198} x2={1100} y={168} href="Slider">Slider</Arrow>
            <Arrow textX={1206} points="900,290 900,280 1198,280" marker="markerStart" y={280} href="ComboBox">ComboBox</Arrow>
            <Arrow textX={1206} x1={1198} x2={1100} y={304} href="NumberField">NumberField</Arrow>
            <Arrow textX={1206} x1={1198} x2={890} y={365} href="Checkbox">Checkbox</Arrow>
          </>}
          {panel === 'comments' && <>
            <Arrow textX={1206} x1={1198} x2={1092} y={208} href="TextArea">TextArea</Arrow>
            <Arrow textX={1206} x1={1198} x2={1092} y={248} href="Button">Button</Arrow>
            <Arrow textX={1206} points="842,370 842,360 1198,360" marker="markerStart" y={360} href="Avatar">Avatar</Arrow>
          </>}
          {panel === 'assets' && <>
            <Arrow textX={1206} x1={1198} x2={1050} y={320} href="Card">Card</Arrow>
          </>}
        </Arrows>
      }
    </FilterContext>
  );
}

const DEFAULT_COLOR_SCHEME = {
  colorScheme: null,
  setColorScheme() {}
};

export const ColorSchemeContext = createContext<{colorScheme: 'light' | 'dark' | null, setColorScheme: (s: 'light' | 'dark' | null) => void}>(DEFAULT_COLOR_SCHEME);

export function ColorSchemeProvider({children}: any) {
  let [colorScheme, setColorScheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    let m = matchMedia('(prefers-color-scheme: dark)');
    let onChange = () => setColorScheme(null);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  let ctx = useContext(ColorSchemeContext);
  if (ctx !== DEFAULT_COLOR_SCHEME) {
    return children;
  }

  return (
    <ColorSchemeContext value={{colorScheme, setColorScheme}}>
      <Provider colorScheme={colorScheme || undefined} styles={style({display: 'contents'})}>
        {children}
      </Provider>
    </ColorSchemeContext>
  );
}

export function AppFrame({children, inert, hidden, page, onPageChange}: any) {
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
            paddingStart: 20,
            boxSizing: 'border-box',
            gap: 20,
            alignItems: 'center',
            width: 'full'
          })}>
          {/* <ActionButton isQuiet aria-label="Menu">
            <MenuHamburger />
          </ActionButton> */}
          <AdobeLogo size={24} />
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
              <Notifications />
              <ActionButton isQuiet aria-label="Apps">
                <Apps />
              </ActionButton>
            </div>
            <AccountMenu />
          </ActionButtonGroup>
        </div>
        <Sidebar page={page} onPageChange={onPageChange} />
        <div
          data-content
          inert={!children}
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
            boxSizing: 'border-box',
            overflow: 'auto'
          })}>
          {children || <DefaultContent />}
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

function DefaultContent() {
  let {direction} = useLocale();
  return (
    <>
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
    </>
  );
}

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
