import path from 'path';
import React from 'react';

const TLD = process.env.DOCS_ENV === 'production'
  ? 'react-spectrum.adobe.com'
  : 'reactspectrum.blob.core.windows.net';

function stripMarkdown(description) {
  return (description || '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
}

export const ImageContext = React.createContext();

export function BasePage({children, currentPage, styles, scripts, publicUrl, pageSection, appendSectionToTitle, hero, className}) {
  let pathToPage = currentPage.filePath.substring(currentPage.filePath.indexOf('packages/'), currentPage.filePath.length);
  let keywords = [...new Set(currentPage.keywords.concat([currentPage.category, currentPage.title, pageSection]).filter(k => !!k))];
  let description = stripMarkdown(currentPage.description) || `Documentation for ${currentPage.title} in the ${pageSection} package.`;
  let title = currentPage.title + (appendSectionToTitle ? ` – ${pageSection}` : '');
  let heroUrl = `https://${TLD}${currentPage.image || (hero ? publicUrl + path.basename(hero) : '')}`;
  let githubLink = pathToPage;
  if (githubLink.startsWith('/tmp/')) {
    githubLink = githubLink.slice(5);
    githubLink = githubLink.substring(githubLink.indexOf('/') + 1);
    githubLink = githubLink.replace(/docs/, 'packages');
  }

  return (
    <html
      lang="en-US"
      dir="ltr"
      prefix="og: http://ogp.me/ns#"
      className={className}>
      <head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preload" as="font" href="https://use.typekit.net/af/eaf09c/000000000000000000017703/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3" crossOrigin="" />
        <link rel="preload" as="font" href="https://use.typekit.net/af/cb695f/000000000000000000017701/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n4&v=3" crossOrigin="" />
        <link rel="preload" as="font" href="https://use.typekit.net/af/505d17/00000000000000003b9aee44/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n9&v=3" crossOrigin="" />
        <link rel="preload" as="font" href="https://use.typekit.net/af/74ffb1/000000000000000000017702/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=i4&v=3" crossOrigin="" />
        {styles.map(s => <link key={s.url} rel="stylesheet" href={s.url} />)}
        {scripts.map(s => <script key={s.url} type={s.type} src={s.url} defer />)}
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={heroUrl} />
        <meta property="og:title" content={currentPage.title} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://${TLD}${currentPage.url}`} />
        <meta property="og:image" content={heroUrl} />
        <meta property="og:description" content={description} />
        <meta property="og:locale" content="en_US" />
        <link rel="canonical" href={`https://${TLD}${currentPage.url}`} />
        <meta data-github-src={githubLink} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(
            {
              '@context': 'http://schema.org',
              '@type': 'Article',
              author: 'Adobe Inc',
              headline: currentPage.title,
              description: description,
              image: heroUrl,
              publisher: {
                '@type': 'Organization',
                url: 'https://www.adobe.com',
                name: 'Adobe',
                logo: 'https://www.adobe.com/favicon.ico'
              }
            }
          )}} />
      </head>
      <body>
        <ImageContext.Provider value={publicUrl}>
          {children}
        </ImageContext.Provider>
        <script
          dangerouslySetInnerHTML={{__html: `
            window.addEventListener('load', () => {
              let script = document.createElement('script');
              script.async = true;
              script.src = 'https://assets.adobedtm.com/a7d65461e54e/01d650a3ee55/launch-4d5498348926.min.js';
              document.head.appendChild(script);
            });
          `}} />
      </body>
    </html>
  );
}
