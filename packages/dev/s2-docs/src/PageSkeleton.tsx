'use client';

import {H1, H2, P, PageDescription, SubpageHeader} from './typography';
import {Image, Skeleton, Text} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {useRouter} from './Router';
import {VersionBadge} from './VersionBadge';

function SkeletonVisualExample() {
  return (
    <Image
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E"
      styles={style({
        padding: {
          default: 12,
          lg: 24
        },
        marginTop: {
          default: 20
        },
        borderRadius: 'xl',
        width: 'full',
        boxSizing: 'border-box',
        height: {
          default: 200,
          lg: 300
        },
        objectFit: 'cover'
      })}
      alt="Loading example" />
  );
}

const skeletonArticle = style({
  maxWidth: {
    default: 768,
    isWide: 'none',
    isLongForm: 900
  },
  marginX: 'auto',
  width: 'full',
  height: 'fit',
  '--text-width': {
    type: 'width',
    value: {
      default: 'auto',
      isLongForm: 600 // ~80 characters at body font size
    }
  }
});

export function PageSkeleton() {
  let {currentPage, pages} = useRouter();
  let isSubpage = currentPage.exports?.isSubpage;
  let section = currentPage.exports?.section || 'Components';;
  let isLongForm = isSubpage && section === 'Blog';
  let hasToC = (!currentPage.exports?.hideNav || section === 'Blog' || section === 'Releases') && currentPage.tableOfContents?.[0]?.children && currentPage.tableOfContents?.[0]?.children?.length > 0;
  let isWide = !hasToC && !isLongForm && section !== 'Blog' && section !== 'Releases';
  let parentUrl = new URL('./', currentPage.url);
  let parentIndex = parentUrl.href;
  let parentPageUrl = parentUrl.href.slice(0, -1);
  let parentPage = pages.find(p => p.url === parentIndex || p.url === parentPageUrl);
  let isComponents = section === 'Components';
  
  return (
    <article className={skeletonArticle({isLongForm, isWide})}>
      {currentPage.exports?.version && <VersionBadge version={currentPage.exports.version} />}
      {currentPage.exports?.isSubpage
        ? <SubpageHeader currentPage={currentPage} parentPage={parentPage} isLongForm={isLongForm} />
        : currentPage.tableOfContents?.[0]?.level === 1 && <H1 isLongForm={isLongForm}>{currentPage.tableOfContents?.[0].title}</H1>
      }
      <Skeleton isLoading>
        <PageDescription>
          <Text>This is placeholder content for the page description that approximates the typical length of component descriptions.</Text>
        </PageDescription>
        
        {isComponents ? (
          <>
            {/* VisualExample */}
            <SkeletonVisualExample />
            
            {/* A few sections with visual examples */}
            {[1, 2, 3].map(i => (
              <React.Fragment key={i}>
                <H2>
                  <Text>Section Heading</Text>
                </H2>
                <P>
                  <Text>Placeholder content for a section that describes various aspects of the component or feature being documented.</Text>
                </P>
                <SkeletonVisualExample />
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {/* A few sections */}
            {[1, 2, 3, 4].map(i => (
              <React.Fragment key={i}>
                <H2>
                  <Text>Section Heading</Text>
                </H2>
                <P>
                  <Text>Placeholder content for a section that describes various aspects of the topic being documented.</Text>
                </P>
              </React.Fragment>
            ))}
          </>
        )}
      </Skeleton>
    </article>
  );
}
