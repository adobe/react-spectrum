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
  let m = messages[locale] || messages.en;
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
        <li className={style({font: 'ui-xs'})}>{m.button}</li>
        <li className={style({font: 'ui-sm'})}>{m.button}</li>
        <li className={style({font: 'ui'})}>{m.button}</li>
        <li className={style({font: 'ui-lg'})}>{m.button}</li>
        <li className={style({font: 'ui-xl'})}>{m.button}</li>
        <li className={style({font: 'ui-2xl'})}>{m.button}</li>
        <li className={style({font: 'ui-3xl'})}>{m.button}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'body-2xs'})}>{m.copy}</li>
        <li className={style({font: 'body-xs'})}>{m.copy}</li>
        <li className={style({font: 'body-sm'})}>{m.copy}</li>
        <li className={style({font: 'body'})}>{m.copy}</li>
        <li className={style({font: 'body-lg'})}>{m.copy}</li>
        <li className={style({font: 'body-xl'})}>{m.copy}</li>
        <li className={style({font: 'body-2xl'})}>{m.copy}</li>
        <li className={style({font: 'body-3xl'})}>{m.copy}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'heading-2xs'})}>{m.cut}</li>
        <li className={style({font: 'heading-xs'})}>{m.cut}</li>
        <li className={style({font: 'heading-sm'})}>{m.cut}</li>
        <li className={style({font: 'heading'})}>{m.cut}</li>
        <li className={style({font: 'heading-lg'})}>{m.cut}</li>
        <li className={style({font: 'heading-xl'})}>{m.cut}</li>
        <li className={style({font: 'heading-2xl'})}>{m.cut}</li>
        <li className={style({font: 'heading-3xl'})}>{m.cut}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'title-xs'})}>{m.paste}</li>
        <li className={style({font: 'title-sm'})}>{m.paste}</li>
        <li className={style({font: 'title'})}>{m.paste}</li>
        <li className={style({font: 'title-lg'})}>{m.paste}</li>
        <li className={style({font: 'title-xl'})}>{m.paste}</li>
        <li className={style({font: 'title-2xl'})}>{m.paste}</li>
        <li className={style({font: 'title-3xl'})}>{m.paste}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'detail-sm'})}>{m.button}</li>
        <li className={style({font: 'detail'})}>{m.button}</li>
        <li className={style({font: 'detail-lg'})}>{m.button}</li>
        <li className={style({font: 'detail-xl'})}>{m.button}</li>
      </ul>
      <ul className={style({padding: 0, listStyleType: 'none'})}>
        <li className={style({font: 'code-sm'})}>{m.cut}</li>
        <li className={style({font: 'code'})}>{m.cut}</li>
        <li className={style({font: 'code-lg'})}>{m.cut}</li>
        <li className={style({font: 'code-xl'})}>{m.cut}</li>
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
  render: () => <Example />,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      locales: ['en', 'ar', 'he', 'ja', 'ko', 'zh-Hans', 'zh-HK', 'zh-Hant']
    }
  }
};

export const Serif = {
  render: () => <SerifExample />,
  parameters: {
    chromaticProvider: {
      colorSchemes: ['light'],
      // Only en because other locales don't have a serif font.
      locales: ['en']
    }
  }
};
