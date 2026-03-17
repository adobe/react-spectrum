import {ReactNode} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};


const Strong = ({children}: {children: ReactNode}) => <strong className={style({fontWeight: 'bold'})}>{children}</strong>;

export function S2Typography() {
  return (
    <>
      <p className={style({font: 'body'})}>There are several different type scales.</p>
      <ul>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>UI</Strong> – use within interactive UI components.</li>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Body</Strong> – use for the content of pages that are primarily text.</li>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Heading</Strong> – use for headings in content pages.</li>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Title</Strong> – use for titles within UI components such as cards or panels.</li>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Detail</Strong> – use for less important metadata.</li>
        <li className={style({font: 'body-lg', marginTop: 0, marginBottom: 8})}><Strong>Code</Strong> – use for source code.</li>
      </ul>
      <p className={style({font: 'body'})}>Each type scale has a default size, and several t-shirt size modifiers for additional sizes.</p>
      <div
        className={style({
          display: 'grid',
          gridTemplateColumns: {
            default: '1fr',
            sm: 'repeat(3, auto)',
            md: 'repeat(6, auto)'
          },
          justifyContent: 'space-between'
        })}>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'ui-xs'})}>ui-xs</li>
          <li className={style({font: 'ui-sm'})}>ui-sm</li>
          <li className={style({font: 'ui'})}>ui</li>
          <li className={style({font: 'ui-lg'})}>ui-lg</li>
          <li className={style({font: 'ui-xl'})}>ui-xl</li>
          <li className={style({font: 'ui-2xl'})}>ui-2xl</li>
          <li className={style({font: 'ui-3xl'})}>ui-3xl</li>
        </ul>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'body-2xs'})}>body-2xs</li>
          <li className={style({font: 'body-xs'})}>body-xs</li>
          <li className={style({font: 'body-sm'})}>body-sm</li>
          <li className={style({font: 'body'})}>body</li>
          <li className={style({font: 'body-lg'})}>body-lg</li>
          <li className={style({font: 'body-xl'})}>body-xl</li>
          <li className={style({font: 'body-2xl'})}>body-2xl</li>
          <li className={style({font: 'body-3xl'})}>body-3xl</li>
        </ul>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'heading-2xs'})}>heading-2xs</li>
          <li className={style({font: 'heading-xs'})}>heading-xs</li>
          <li className={style({font: 'heading-sm'})}>heading-sm</li>
          <li className={style({font: 'heading'})}>heading</li>
          <li className={style({font: 'heading-lg'})}>heading-lg</li>
          <li className={style({font: 'heading-xl'})}>heading-xl</li>
          <li className={style({font: 'heading-2xl'})}>heading-2xl</li>
          <li className={style({font: 'heading-3xl'})}>heading-3xl</li>
        </ul>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'title-xs'})}>title-xs</li>
          <li className={style({font: 'title-sm'})}>title-sm</li>
          <li className={style({font: 'title'})}>title</li>
          <li className={style({font: 'title-lg'})}>title-lg</li>
          <li className={style({font: 'title-xl'})}>title-xl</li>
          <li className={style({font: 'title-2xl'})}>title-2xl</li>
          <li className={style({font: 'title-3xl'})}>title-3xl</li>
        </ul>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'detail-sm'})}>detail-sm</li>
          <li className={style({font: 'detail'})}>detail</li>
          <li className={style({font: 'detail-lg'})}>detail-lg</li>
          <li className={style({font: 'detail-xl'})}>detail-xl</li>
        </ul>
        <ul className={style({padding: 0, listStyleType: 'none'})}>
          <li className={style({font: 'code-sm'})}>code-sm</li>
          <li className={style({font: 'code'})}>code</li>
          <li className={style({font: 'code-lg'})}>code-lg</li>
          <li className={style({font: 'code-xl'})}>code-xl</li>
        </ul>
      </div>
    </>
  );
}
