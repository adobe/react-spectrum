'use client';

import { Avatar, TextArea } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

export function Typography({titleLg, titleSm, detailSm, body}: any) {
  return (
    <div className={style({display: 'flex', columnGap: 16})}>
      <div
        className={style({
          backgroundColor: 'layer-1',
          padding: 12,
          borderRadius: 'lg',
          boxShadow: 'emphasized'
        })}>
        <div className={style({display: 'flex', alignItems: 'center', columnGap: 8, marginBottom: 12})}>
          <h3 className={style({font: 'title-lg', marginY: 0})}>Comments</h3>
          <Arrow />
        </div>
        <div className={style({display: 'flex', flexDirection: 'column', gap: 16})}>
          <Comment
            author="Nikolas Gibbons"
            avatar="https://www.untitledui.com/images/avatars/nikolas-gibbons"
            date="2 hours ago"
            body="Thanks for the feedback!"
            showArrow />
          <Comment
            author="Adriana Sullivan"
            avatar="https://www.untitledui.com/images/avatars/adriana-sullivan"
            date="July 14"
            body="I love the colors! Can we add a little more pop?" />
        </div>
      </div>
      <div className={style({paddingY: 12})}>
        <pre className={style({font: 'code-xs', marginY: 0, marginTop: 2})}>{titleLg}</pre>
        <pre className={style({font: 'code-xs', marginY: 0, marginTop: 16})}>{titleSm}</pre>
        <pre className={style({font: 'code-xs', marginY: 0})}>{detailSm}</pre>
        <pre className={style({font: 'code-xs', marginY: 0, marginTop: 8})}>{body}</pre>
      </div>
    </div>
  );
}

function Comment({author, avatar, date, body, showArrow}: any) {
  return (
    <div
      className={style({
        display: 'grid',
        gridTemplateAreas: [
          'avatar name',
          'avatar date',
          '. .',
          'body body'
        ],
        gridTemplateColumns: ['auto', '1fr'],
        gridTemplateRows: ['auto', 'auto', 8, 'auto'],
        columnGap: 8,
        alignItems: 'center'
      })}>
      <Avatar styles={style({gridArea: 'avatar'})} src={avatar} size={32} />
      <span className={style({gridArea: 'name', font: 'title-sm', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {author}
        {showArrow && <Arrow />}
      </span>
      <span className={style({gridArea: 'date', font: 'detail-sm', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {date}
        {showArrow && <Arrow />}
      </span>
      <span className={style({gridArea: 'body', font: 'body', display: 'flex', alignItems: 'center', columnGap: 8})}>
        {body}
        {showArrow && <Arrow />}
      </span>
    </div>
  )
}

function Arrow() {
  return (
    <svg height={5} style={{flex: 1, minWidth: 0, contain: 'size', marginInlineEnd: -20}}>
      <circle r={2.5} cx={2.5} cy={2.5} className={style({fill: 'gray-500'})} />
      <line x1={2.5} y1={2.5} x2="100%" y2={2.5} className={style({stroke: 'gray-500'})} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  )
}