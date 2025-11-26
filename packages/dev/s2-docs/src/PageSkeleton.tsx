'use client';

import {getTextWidth} from './textWidth';
import {Image, Skeleton, Text} from '@react-spectrum/s2';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const h1 = style({
  font: 'heading-3xl',
  fontSize: {
    default: {
      // On mobile, adjust heading to fit in the viewport, and clamp between a min and max font size.
      default: 'clamp(35px, (100vw - 32px) / var(--width-per-em), 55px)',
      isLongForm: 'heading-xl'
    },
    lg: {
      default: 'heading-3xl',
      isLongForm: 'heading-2xl'
    }
  },
  textWrap: 'balance',
  marginY: 0,
  maxWidth: '--text-width',
  marginX: 'auto'
});

const skeletonPageDescription = style({
  font: {default: 'body-lg', lg: 'body-xl'},
  marginY: 24,
  maxWidth: '--text-width',
  marginX: 'auto'
});

const skeletonParagraph = style({
  font: {default: 'body', lg: 'body-lg'},
  marginY: '[1lh]',
  maxWidth: '--text-width',
  marginX: 'auto'
});

const skeletonH2 = style({
  font: 'heading-xl',
  marginTop: 48,
  marginBottom: 24,
  maxWidth: '--text-width',
  marginX: 'auto'
});

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

export function PageSkeleton({title, section, hasToC, isLongForm, isWide}: {title?: string, section?: string, hasToC?: boolean, isLongForm?: boolean, isWide?: boolean}) {
  const isComponents = section === 'Components';
  
  return (
    <article className={skeletonArticle({isWithToC: hasToC, isLongForm, isWide})}>
      {title && (
        <h1 id="top" style={{'--width-per-em': getTextWidth(title)} as any} className={h1({isLongForm})}>
          {title}
        </h1>
      )}
      <Skeleton isLoading>
        {!title && (
          <h1 style={{'--width-per-em': getTextWidth('Page Title')} as any} className={h1({isLongForm})}>
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
