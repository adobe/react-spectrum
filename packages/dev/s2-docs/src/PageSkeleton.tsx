'use client';

import {getTextWidth} from './textWidth';
import React from 'react';
import {Skeleton, Text} from '@react-spectrum/s2';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const h1 = style({
  font: 'heading-3xl',
  fontSize: {
    // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
    default: 'clamp(35px, (100vw - 32px) / var(--width-per-em), 55px)',
    lg: 'heading-3xl'
  },
  marginY: 0
});

const skeletonPageDescription = style({
  font: {default: 'body-lg', lg: 'body-xl'},
  marginY: 24,
  width: '100%'
});

const skeletonParagraph = style({
  font: {default: 'body', lg: 'body-lg'},
  marginY: 24,
  width: '100%'
});

const skeletonH2 = style({
  font: 'heading-xl',
  marginTop: 48,
  marginBottom: 16,
  width: '40%'
});

const skeletonVisualExample = style({
  backgroundColor: 'layer-1',
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
  minHeight: {
    default: 200,
    lg: 300
  }
});

function SkeletonVisualExample() {
  return (
    <div className={skeletonVisualExample} />
  );
}

const skeletonArticle = style({
  maxWidth: {
    default: 'none',
    isWithToC: 768
  },
  width: 'full',
  height: 'fit'
});

export function PageSkeleton({title, section, hasToC}: {title?: string, section?: string, hasToC?: boolean}) {
  const isComponents = section === 'Components';
  
  return (
    <article className={skeletonArticle({isWithToC: hasToC})}>
      {title && (
        <h1 id="top" style={{'--width-per-em': getTextWidth(title)} as any} className={h1}>
          {title}
        </h1>
      )}
      <Skeleton isLoading>
        {!title && (
          <h1 className={style({font: 'heading-3xl', fontSize: {default: 'clamp(35px, (100vw - 32px) / var(--width-per-em), 55px)', lg: 'heading-3xl'}, marginY: 0, width: '60%'})}>
            <Text>Page Title</Text>
          </h1>
        )}
        
        {/* PageDescription */}
        <p className={skeletonPageDescription}>
          <Text>This is placeholder content for the page description that approximates the typical length of component descriptions.</Text>
        </p>
        
        {isComponents ? (
          <>
            {/* VisualExample */}
            <SkeletonVisualExample />
            
            {/* A few sections with visual examples */}
            {[1, 2, 3].map(i => (
              <React.Fragment key={i}>
                <h2 className={skeletonH2}>
                  <Text>Section Heading</Text>
                </h2>
                <p className={skeletonParagraph}>
                  <Text>Placeholder content for a section that describes various aspects of the component or feature being documented.</Text>
                </p>
                <SkeletonVisualExample />
              </React.Fragment>
            ))}
          </>
        ) : (
          <>
            {/* A few sections */}
            {[1, 2, 3, 4].map(i => (
              <React.Fragment key={i}>
                <h2 className={skeletonH2}>
                  <Text>Section Heading</Text>
                </h2>
                <p className={skeletonParagraph}>
                  <Text>Placeholder content for a section that describes various aspects of the topic being documented.</Text>
                </p>
              </React.Fragment>
            ))}
          </>
        )}
      </Skeleton>
    </article>
  );
}
