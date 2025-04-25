/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionButton, ActionButtonGroup, Button, Image, Link, Picker, PickerItem, Text} from '../src';
import Add from '../s2wf-icons/S2_Icon_Add_20_N.svg';
import Asset from '../s2wf-icons/S2_Icon_Asset_20_N.svg';
import {Example as CardViewExample} from './CardView.stories';
import {container, gradientBorder, hstack, vstack} from './macros' with { type: 'macro' };
import {focusRing, linearGradient, style} from '../style' with { type: 'macro' };
import Folder from '../s2wf-icons/S2_Icon_Folder_20_N.svg';
import {Input} from 'react-aria-components';
import List from '../s2wf-icons/S2_Icon_ViewList_20_N.svg';

const meta = {
  parameters: {
    layout: 'fullscreen'
  },
  title: 'zDesign Examples'
};

export default meta;

export function CCHome() {
  return (
    <div 
      className={style({
        padding: {default: 0, lg: 40},
        backgroundColor: 'layer-1',
        display: 'flex',
        gap: {default: 0, lg: 16},
        flexDirection: {default: 'column', lg: 'row'},
        height: '[calc(100vh - 80px)]'
      })}>
      <div 
        className={style({
          ...container({variant: 'emphasized'}),
          backgroundColor: 'base',
          borderRadius: {default: 'none', lg: 'xl'},
          padding: 0,
          overflow: {
            default: 'visible',
            lg: 'auto'
          },
          flexGrow: 1
        })}>
        <div
          className={style({
            ...vstack(24),
            alignItems: 'center',
            paddingTop: 64,
            paddingBottom: 64,
            paddingX: 20,
            colorScheme: 'light',
            position: 'relative'
          })}>
          <img
            src={new URL('assets/bg.jpg', import.meta.url).toString()}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              height: 360,
              width: '100%',
              maskImage: 'linear-gradient(to bottom, white 60%, transparent)',
              objectFit: 'cover',
              // @ts-ignore
              WebkitUserDrag: 'none'
            }} />
          <h1 className={style({font: {default: 'heading', lg: 'heading-xl'}, zIndex: 1})}>Create something new</h1>
          <PromptBar />
        </div>
        <div
          className={style({
            ...hstack(16),
            padding: {default: 16, lg: 32},
            paddingTop: 80,
            overflowX: 'auto'
          })}>
          <BuyCard />
          <BuyCard2 />
          <BuyCard2 />
        </div>
        <h2 className={style({font: 'title', marginY: 0, marginX: {default: 16, lg: 32}})}>Shortcuts</h2>
        <div 
          className={style({
            display: {
              default: 'flex',
              lg: 'grid'
            },
            gridTemplateColumns: 'repeat(auto-fit, 240px)',
            overflowX: 'auto',
            gap: 24,
            padding: {default: 16, lg: 32}
          })}>
          <HomeCard />
          <HomeCard />
          <HomeCard />
          <HomeCard />
          <HomeCard />
          <HomeCard />
          <HomeCard />
          <HomeCard />
        </div>
      </div>
      <div
        className={style({
          ...container({variant: 'emphasized'}),
          boxShadow: {
            default: 'none',
            lg: 'elevated'
          },
          backgroundColor: 'base',
          ...vstack(8),
          width: {
            default: 'auto',
            lg: 320
          },
          borderRadius: {default: 'none', lg: 'xl'}
        })}>
        <div className={style({...hstack(12), alignItems: 'center'})}>
          <h2 className={style({font: 'title', margin: 0})}>Recent files</h2>
          <div className={style({flexGrow: 1})} />
          <ActionButtonGroup isQuiet>
            <ActionButton aria-label="Add"><Add /></ActionButton>
            <ActionButton aria-label="List"><List /></ActionButton>
            <ActionButton aria-label="Folders"><Folder /></ActionButton>
          </ActionButtonGroup>
        </div>
        {/* @ts-ignore */}
        <CardViewExample size="S" variant="quiet" selectionMode="multiple" selectionStyle="highlight" styles={style({width: 'full', height: {default: 400, xl: 'full'}})} />
      </div>
    </div>
  );
}

function PromptBar() {
  return (
    <div
      className={style({
        display: 'grid',
        gap: 12,
        gridTemplateColumns: ['auto', '1fr', 'auto'],
        gridTemplateAreas: {
          default: [
            'input input input',
            'picker . button'
          ],
          lg: [
            'picker input button'
          ]
        },
        alignItems: 'center',
        minHeight: 64,
        boxSizing: 'border-box',
        backgroundColor: 'transparent-white-500',
        borderRadius: {
          default: 'xl',
          lg: 'pill'
        },
        paddingStart: {
          default: 12,
          lg: 'pill'
        },
        paddingEnd: {
          default: 12,
          lg: 8
        },
        paddingY: 8,
        maxWidth: 840,
        width: 'full',
        boxShadow: '[0px 10px 40px 0px rgba(0, 0, 0, 0.08)]',
        borderWidth: 0,
        borderTopWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent-white-500'
      })}
      style={{
        backdropFilter: 'blur(20px)'
      }}>
      <Picker aria-label="type" defaultSelectedKey="image" isQuiet size="L" styles={style({gridArea: 'picker'})}>
        <PickerItem id="image">
          <Asset />
          <Text slot="label">Image</Text>
        </PickerItem>
      </Picker>
      <Input
        className={style({
          ...focusRing(),
          gridArea: 'input',
          borderRadius: 'default',
          padding: 12,
          borderStyle: 'none',
          backgroundColor: 'transparent',
          font: 'ui-lg',
          flexGrow: 1,
          color: {
            default: 'body',
            '::placeholder': 'body'
          }
        })}
        placeholder="Describe the image you want to generate" />
      <Button size="XL" variant="accent" styles={style({gridArea: 'button'})}>Generate</Button>
    </div>
  );
}

function HomeCard() {
  return (
    <div
      className={style({
        ...container({variant: 'border'}),
        backgroundColor: 'elevated',
        ...vstack(16),
        width: 240,
        flexShrink: 0,
        backgroundImage: linearGradient('to top right', ['red-800/10', 0], ['transparent', 100]) as any as string,
        alignItems: 'start',
        borderRadius: 'xl'
      })}>
      <Image
        src={new URL('assets/placeholder.png', import.meta.url).toString()}
        styles={style({
          height: 80,
          borderRadius: 'default'
        })} />
      <div className={style({font: 'title'})}><span className={style({color: 'orange-800'})}>Create a video based on your reference images</span> as the start and end frame</div>
      <div className={style({...hstack(4), alignItems: 'center'})}>
        <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clipPath="url(#clip0_21724_26076)">
            <path d="M16.5374 0.357178H3.61601C1.66131 0.357178 0.0767212 1.94177 0.0767212 3.89646V16.1036C0.0767212 18.0583 1.66131 19.6429 3.61601 19.6429H16.5374C18.4921 19.6429 20.0767 18.0583 20.0767 16.1036V3.89646C20.0767 1.94177 18.4921 0.357178 16.5374 0.357178Z" fill="#EB1000" />
            <path d="M11.2764 5.23114C11.3657 5.23114 11.3871 5.25675 11.4014 5.34246L11.5479 6.76727C11.5622 6.84582 11.5232 6.88151 11.4376 6.88153H7.78033V8.88836H11.0772C11.1518 8.88846 11.1874 8.91376 11.1876 8.99188V10.4352C11.1875 10.5137 11.1482 10.5387 11.084 10.5388H7.78033V13.7741C7.78033 13.8527 7.74464 13.8884 7.66608 13.8884H6.03424C5.96996 13.8884 5.9444 13.842 5.9444 13.7741V5.33465C5.9445 5.26001 5.97014 5.23114 6.04498 5.23114H11.2764ZM14.2628 7.32098C14.3481 7.32104 14.3731 7.34293 14.3731 7.4284V13.7643C14.3731 13.8499 14.3481 13.8853 14.252 13.8854H12.6592C12.57 13.8854 12.5264 13.8461 12.5264 13.7604V7.43231C12.5264 7.35731 12.5628 7.32098 12.6378 7.32098H14.2628ZM13.9659 3.5036C14.2052 3.28233 14.587 3.50027 14.5157 3.81805L14.334 4.62567C14.3092 4.73263 14.3374 4.84308 14.4122 4.92157L14.9727 5.52899C15.1941 5.76827 14.9732 6.14632 14.6553 6.07489L13.8477 5.89325C13.7444 5.86843 13.6303 5.89664 13.5518 5.97137L12.9444 6.53289C12.7052 6.75381 12.3234 6.53603 12.3946 6.21844L12.5762 5.41082C12.6012 5.30378 12.573 5.19346 12.4981 5.11493L11.9376 4.5075C11.7162 4.26832 11.9373 3.8896 12.2549 3.96063L13.0626 4.14325C13.1661 4.16818 13.2799 4.13911 13.3585 4.06414L13.9659 3.5036Z" fill="white" />
          </g>
          <defs>
            <clipPath id="clip0_21724_26076">
              <rect width="20" height="19.2857" fill="white" transform="translate(0.0767212 0.357178)" />
            </clipPath>
          </defs>
        </svg>
        <span className={style({font: 'title-xs'})}>Adobe Firefly</span>
      </div>
    </div>
  );
}

function BuyCard() {
  return (
    <div
      className={style({
        ...container({variant: 'border'}),
        backgroundColor: 'elevated',
        ...vstack(12),
        width: {
          default: 280,
          xl: 320
        },
        flexShrink: 0,
        borderRadius: 'xl',
        boxShadow: 'none',
        ...gradientBorder(linearGradient('to bottom right', ['magenta-700', 0], ['purple-700', 50], ['blue-700', 100]))
      })}>
      <div className={style({...hstack(4), alignItems: 'center'})}>
        <span className={style({font: 'title-sm'})}>Creative Cloud Standard</span>
      </div>
      <div>
        <span className={style({font: 'ui-sm', color: 'gray-600', textDecoration: 'line-through'})}>US$79.99/mo</span>
        <span className={style({font: 'title-lg'})}> US$59.99</span>
        <span className={style({font: 'body-xs'})}>/mo</span>
      </div>
      <div className={style({font: 'body-xs'})}>Create with Adobe on the web. Includes Firefly, Express, Photoshop, Lightroom, and more.</div>
      <div className={style({...hstack(8), alignItems: 'center', font: 'ui'})}>
        <Link variant="secondary">See terms</Link>
        <div className={style({flexGrow: 1})} />
        <Button variant="secondary" size="S">Free trial</Button>
        <Button variant="accent" size="S">Buy</Button>
      </div>
    </div>
  );
}

function BuyCard2() {
  return (
    <div
      className={style({
        ...container({variant: 'border'}),
        backgroundColor: 'elevated',
        ...vstack(12),
        width: {
          default: 280,
          xl: 320
        },
        flexShrink: 0,
        borderRadius: 'xl'
      })}>
      <div className={style({...hstack(4), alignItems: 'center'})}>
        <span className={style({font: 'title-sm'})}>Photoshop</span>
      </div>
      <div>
        <span className={style({font: 'ui-sm', color: 'gray-600', textDecoration: 'line-through'})}>US$29.99/mo</span>
        <span className={style({font: 'title-lg'})}> US$19.99</span>
        <span className={style({font: 'body-xs'})}>/mo</span>
      </div>
      <div className={style({font: 'body-xs'})}>Try new generative AI features with the latest Adobe Firefly Model.</div>
      <div className={style({...hstack(8), alignItems: 'center', font: 'ui'})}>
        <Link variant="secondary">See terms</Link>
        <div className={style({flexGrow: 1})} />
        <Button variant="secondary" size="S">Free trial</Button>
        <Button variant="primary" size="S">Buy</Button>
      </div>
    </div>
  );
}
