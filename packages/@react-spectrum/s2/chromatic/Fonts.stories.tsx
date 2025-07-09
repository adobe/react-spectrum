/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import type {Meta} from '@storybook/react';
import {style} from '../style' with {type: 'macro'};
import {useLocale} from 'react-aria';

const meta: Meta<any> = {
  title: 'S2 Chromatic/Fonts'
};

export default meta;

const messages = {
  'en': {
    'button': 'Edit',
    'copy': 'Copy',
    'cut': 'Cut',
    'paste': 'Paste'
  },
  'ar': {
    'button': 'يحرر',
    'copy': 'ينسخ',
    'cut': 'يقطع',
    'paste': 'معجون'
  },
  'he': {
    'button': 'לַעֲרוֹך',
    'copy': 'עותק',
    'cut': 'גזירה',
    'paste': 'לְהַדבִּיק'
  },
  'ja': {
    'button': '編集',
    'copy': 'コピー',
    'cut': '切る',
    'paste': 'ペースト'
  },
  'ko': {
    'button': '편집하다',
    'copy': '복사',
    'cut': '자르다',
    'paste': '반죽'
  },
  'zh-Hans': {
    'button': '编辑',
    'copy': '复制',
    'cut': '切',
    'paste': '粘贴'
  },
  'zh-HK': {
    'button': '編輯',
    'copy': '複製',
    'cut': '切',
    'paste': '粘貼'
  },
  'zh-Hant': {
    'button': '編輯',
    'copy': '複製',
    'cut': '切',
    'paste': '粘貼'
  }
};

function Example() {
  let {locale} = useLocale();
  return (
    <div
      className={style({
        display: 'grid',
        width: 'full',
        gridTemplateColumns: {
          default: '1fr',
          sm: 'repeat(3, auto)',
          md: 'repeat(6, auto)'
        },
        justifyContent: 'space-between'
      })}>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'ui-xs'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui-sm'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui-lg'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui-xl'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui-2xl'})}>{messages[locale].button}</li>
        <li className={style({font: 'ui-3xl'})}>{messages[locale].button}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'body-2xs'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-xs'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-sm'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-lg'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-xl'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-2xl'})}>{messages[locale].copy}</li>
        <li className={style({font: 'body-3xl'})}>{messages[locale].copy}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'heading-2xs'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-xs'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-sm'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-lg'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-xl'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-2xl'})}>{messages[locale].cut}</li>
        <li className={style({font: 'heading-3xl'})}>{messages[locale].cut}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'title-xs'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title-sm'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title-lg'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title-xl'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title-2xl'})}>{messages[locale].paste}</li>
        <li className={style({font: 'title-3xl'})}>{messages[locale].paste}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'detail-sm'})}>{messages[locale].button}</li>
        <li className={style({font: 'detail'})}>{messages[locale].button}</li>
        <li className={style({font: 'detail-lg'})}>{messages[locale].button}</li>
        <li className={style({font: 'detail-xl'})}>{messages[locale].button}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'code-sm'})}>{messages[locale].cut}</li>
        <li className={style({font: 'code'})}>{messages[locale].cut}</li>
        <li className={style({font: 'code-lg'})}>{messages[locale].cut}</li>
        <li className={style({font: 'code-xl'})}>{messages[locale].cut}</li>
      </ul>
    </div>
  );
}

function SerifExample() {
  return (
    <div
      className={style({
        display: 'grid',
        width: 'full',
        gridTemplateColumns: {
          default: '1fr',
          sm: 'repeat(3, auto)',
          md: 'repeat(6, auto)'
        },
        justifyContent: 'space-between'
      })}>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'heading-xs', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading-sm', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading-lg', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading-xl', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading-2xl', fontFamily: 'serif'})}>Heading</li>
        <li className={style({font: 'heading-3xl', fontFamily: 'serif'})}>Heading</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'body-2xs', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-xs', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-sm', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-lg', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-xl', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-2xl', fontFamily: 'serif'})}>Body</li>
        <li className={style({font: 'body-3xl', fontFamily: 'serif'})}>Body</li>
      </ul>
    </div>
  );
}

export const Default = {
  render: Example,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en', 'ar', 'he', 'ja', 'ko', 'zh-Hans', 'zh-HK', 'zh-Hant']
    }
  }
};

export const Serif = {
  render: SerifExample,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      // Only en because other locales don't have a serif font.
      locales: ['en']
    }
  }
};
