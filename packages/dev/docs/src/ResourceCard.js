/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import classNames from 'classnames';
import React from 'react';
import styles from './resourceCard.css';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function ResourceCard(props) {

  let {
    type,
    url
  } = props;

  // set content for source type
  let cardContent = {};
  cardContent = {
    svg: <svg className={styles['spectrumImage']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66"><path fill="#e1251b" d="M37.5 19l12.1 28.8V19H37.5zM17 19v28.8L29.1 19H17zm11 23h5.5l2.4 5.9h5l-7.8-18.3L28 42z" /></svg>,
    title: 'View guidelines',
    type
  };

  if (type.toLowerCase() === 'github') {
    cardContent = {
      svg: <svg className={styles['gitImage']} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 66 66"><path d="M51.95 33.48C51.95 23.27 43.67 15 33.47 15S15 23.28 15 33.48c0 7.89 5.01 14.9 12.46 17.47.53-.27.88-.79.95-1.38 0-1.02-.02-3.63-.02-3.63-.64.1-1.29.14-1.95.14a4.183 4.183 0 01-4.23-2.85 4.96 4.96 0 00-2.08-2.46c-.48-.31-.59-.67-.03-.77 2.55-.48 3.21 2.88 4.91 3.41 1.18.37 2.45.27 3.56-.28.16-.95.68-1.81 1.47-2.38-4.34-.41-6.91-1.91-8.24-4.32l-.14-.27-.33-.76-.1-.27c-.43-1.35-.63-2.77-.6-4.18a7.13 7.13 0 012.04-5.3 7.35 7.35 0 01.31-5.34s1.88-.39 5.42 2.14c1.92-.82 7.05-.89 9.48-.18 1.49-.98 4.21-2.37 5.31-1.98.3.48.94 1.87.39 4.92a8.573 8.573 0 012.32 6.12c0 1.28-.16 2.56-.47 3.8l-.16.54s-.09.26-.19.5l-.12.27c-1.29 2.81-3.92 3.86-8.19 4.3 1.38.87 1.78 1.95 1.78 4.89 0 2.94-.04 3.33-.03 4.01.08.57.42 1.07.92 1.35a18.52 18.52 0 0012.51-17.51z" /></svg>,
      title: 'View repository',
      type
    };
  } else if (type.toLowerCase() === 'npm') {
    cardContent = {
      svg: <svg className={styles['npmImage']} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x={0} y={0} viewBox="0 0 66 66" xmlSpace="preserve"><g id="layer1" transform="translate(8.305 24.74)"><path id="path4951" fill="#cb3837" d="M13.73 19.26V16.5H0V0h49.39v16.5h-24.7v2.76H13.73z" /><path id="path4949" fill="#fff" d="M22.02 16.5v-2.77h5.43V2.77H16.51V16.5h5.51z" /><path id="path4947" fill="#cb3837" d="M22.02 5.53h2.67v5.43h-2.67V5.53z" /><path id="path4945" fill="#fff" d="M8.2 13.73v-8.2h2.76v8.2h2.76V2.77H2.79v10.95H8.2z" /><path id="path2998" fill="#fff" d="M35.66 13.73v-8.2h2.76v8.2h2.76v-8.2h2.76v8.2h2.76V2.77H30.22v10.95h5.44z" /></g></svg>,
      title: 'View package',
      type
    };
  } else if (type.toLowerCase() === 'w3c') {
    cardContent = {
      svg: <svg viewBox='0 0 72 48' className={styles['w3cImage']}>
        <path d='M18.117,8.006l5.759,19.58l5.759-19.58h4.17h11.444v1.946L39.37,20.08    c2.065,0.663,3.627,1.868,4.686,3.615c1.059,1.748,1.589,3.799,1.589,6.155c0,2.914-0.775,5.363-2.324,7.348    s-3.555,2.978-6.017,2.978c-1.854,0-3.469-0.589-4.845-1.767c-1.377-1.178-2.396-2.773-3.058-4.786l3.256-1.35    c0.477,1.218,1.106,2.178,1.887,2.879c0.781,0.702,1.701,1.052,2.76,1.052c1.112,0,2.052-0.622,2.82-1.866    c0.768-1.245,1.152-2.74,1.152-4.489c0-1.933-0.411-3.429-1.231-4.488c-0.954-1.244-2.45-1.867-4.489-1.867h-1.588v-1.906    l5.56-9.612h-6.712l-0.382,0.65l-8.163,27.548h-0.397l-5.958-19.937l-5.957,19.937h-0.397L2.032,8.006h4.17l5.759,19.58    l3.892-13.185l-1.906-6.395H18.117z' fill='#005A9C'/>
        <path clip-rule='evenodd' d='M66.92,8.006c-0.819,0-1.554,0.295-2.111,0.861c-0.591,0.6-0.92,1.376-0.92,2.178   c0,0.802,0.313,1.545,0.887,2.128c0.583,0.591,1.334,0.912,2.145,0.912c0.793,0,1.562-0.321,2.161-0.903   c0.574-0.557,0.887-1.3,0.887-2.136c0-0.811-0.321-1.57-0.878-2.136C68.507,8.318,67.747,8.006,66.92,8.006z M69.563,11.071   c0,0.701-0.271,1.351-0.768,1.832c-0.524,0.507-1.174,0.777-1.892,0.777c-0.675,0-1.342-0.278-1.84-0.785s-0.777-1.157-0.777-1.849   s0.287-1.368,0.802-1.891c0.481-0.49,1.131-0.751,1.84-0.751c0.726,0,1.376,0.271,1.883,0.785   C69.301,9.678,69.563,10.336,69.563,11.071z M67.004,9.264h-1.3v3.445h0.65V11.24h0.642l0.701,1.469h0.726l-0.769-1.57   c0.498-0.102,0.785-0.439,0.785-0.929C68.439,9.585,67.967,9.264,67.004,9.264z M66.886,9.686c0.608,0,0.886,0.169,0.886,0.591   c0,0.405-0.278,0.549-0.87,0.549h-0.549v-1.14H66.886z' fill-rule='evenodd'/>
        <path d='M61.807,7.825l0.676,4.107l-2.391,4.575c0,0-0.918-1.941-2.443-3.015c-1.285-0.905-2.122-1.102-3.431-0.832    c-1.681,0.347-3.587,2.357-4.419,4.835c-0.995,2.965-1.005,4.4-1.04,5.718c-0.056,2.113,0.277,3.362,0.277,3.362    s-1.452-2.686-1.438-6.62c0.009-2.808,0.451-5.354,1.75-7.867c1.143-2.209,2.842-3.535,4.35-3.691    c1.559-0.161,2.791,0.59,3.743,1.403c1,0.854,2.01,2.721,2.01,2.721L61.807,7.825z'/>
        <path d='M62.102,31.063c0,0-1.057,1.889-1.715,2.617c-0.659,0.728-1.837,2.01-3.292,2.651s-2.218,0.762-3.656,0.624    c-1.437-0.138-2.772-0.97-3.24-1.317c-0.468-0.347-1.664-1.369-2.34-2.322c-0.676-0.953-1.733-2.859-1.733-2.859    s0.589,1.91,0.958,2.721c0.212,0.467,0.864,1.894,1.789,3.136c0.863,1.159,2.539,3.154,5.086,3.604    c2.547,0.451,4.297-0.693,4.73-0.97c0.433-0.277,1.346-1.042,1.924-1.66c0.603-0.645,1.174-1.468,1.49-1.962    c0.231-0.36,0.607-1.092,0.607-1.092L62.102,31.063z'/>
      </svg>,
      title: 'View ARIA spec',
      type
    };
  }

  return (
    <a href={url} target="_blank" title={cardContent.title} className={styles['resourceCard']}>
      <div>
        {cardContent.svg}
      </div>
      <div className={classNames(typographyStyles['spectrum-Body4'], styles['cardContent'])}>
        <div className={styles['cardTitle']}>
          {cardContent.title}
        </div>
        <div className={styles['cardType']}>
          {cardContent.type}
        </div>
      </div>
    </a>
  );
}
