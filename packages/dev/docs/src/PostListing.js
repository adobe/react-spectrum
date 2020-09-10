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

import clsx from 'clsx';
import docStyles from '@react-spectrum/docs/src/docs.css';
import {getAnchorProps} from './utils';
import linkStyle from '@adobe/spectrum-css-temp/components/link/vars.css';
import {PageContext, renderHTMLfromMarkdown, Time} from '@react-spectrum/docs';
import React from 'react';
import typographyStyles from '@adobe/spectrum-css-temp/components/typography/vars.css';

export function PostListing({type}) {
  let {pages} = React.useContext(PageContext);
  let blogPages = pages
    .filter(page => page.name.startsWith(type) && !page.name.endsWith('index.html'))
    .sort((a, b) => a.date < b.date ? 1 : -1);

  return (
    <>
      {blogPages.map(page => <BlogPost {...page} />)}
    </>
  );
}

function BlogPost({name, title, url, description, date, author}) {
  let authorParts = (author || '').match(/^\[(.*?)\]\((.*?)\)$/) || [''];

  return (
    <article className={clsx(typographyStyles['spectrum-Typography'], docStyles.blogArticle)}>
      <header className={docStyles.blogHeader}>
        <h2 className={typographyStyles['spectrum-Heading3']}><a href={url} className={linkStyle['spectrum-Link']}>{title}</a></h2>
        {author && <address className={typographyStyles['spectrum-Body4']}>By <a rel="author" href={authorParts[2]} className={clsx(linkStyle['spectrum-Link'], linkStyle['spectrum-Link--secondary'], docStyles.link)} {...getAnchorProps(authorParts[2])}>{authorParts[1]}</a></address>}
        <Time date={date} />
      </header>
      <p className={typographyStyles['spectrum-Body3']}>
        {renderHTMLfromMarkdown(description)}
      </p>
    </article>
  );
}
