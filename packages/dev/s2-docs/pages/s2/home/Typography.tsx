'use client';

import { Avatar } from "@react-spectrum/s2";
import { style } from "@react-spectrum/s2/style" with {type: 'macro'};

export function Typography() {
  return (
    <div className={style({display: 'flex', columnGap: 16})}>
      <div
        className={style({
          backgroundColor: 'base',
          padding: 16,
          boxSizing: 'border-box',
          borderRadius: 'lg',
          width: 'full'
        })}>
        <div className={style({display: 'flex', alignItems: 'center', columnGap: 8, marginBottom: 20})}>
          <h3 className={style({font: 'title-lg', marginY: 0})}>Comments</h3>
          <Arrow />
          <Style>title-lg</Style>
        </div>
        <div className={style({display: 'flex', flexDirection: 'column', gap: 20})}>
          <Comment
            author={<>Nikolas Gibbons<Arrow /><Style>title-sm</Style></>}
            avatar="https://www.untitledui.com/images/avatars/nikolas-gibbons"
            date={<>2 hours ago<Arrow /><Style>detail-sm</Style></>}
            body={<>Thanks for the feedback!<Arrow /><Style>body</Style></>}
            showArrow />
          <Comment
            author="Adriana Sullivan"
            avatar="https://www.untitledui.com/images/avatars/adriana-sullivan"
            date="July 14"
            body="Transitions are smooth! Could we speed them up just a bit?" />
          <Comment
            author="Frank Whitaker"
            avatar="https://www.untitledui.com/images/avatars/frank-whitaker?"
            date="July 13"
            body="Love the direction. Could we simplify the header a bit more?" />
        </div>
      </div>
    </div>
  );
}

const styles = {
  string: style({color: 'green-1000'}),
  number: style({color: 'pink-1000'}),
  property: style({color: 'indigo-1000'}),
  function: style({color: 'red-1000'}),
  variable: style({color: 'fuchsia-1000'})
};

function Style({children}: {children: string}) {
  return (
    <pre className={style({font: 'code-xs', marginY: 0, marginTop: 2})}>
      <span className={style({display: {default: 'none', sm: 'inline'}})}>
        <span className={styles.function}>style</span>
        {'({'}
        <span className={styles.property}>font</span>
        {': '}
      </span>
      <span className={styles.string}>'{children}'</span>
      <span className={style({display: {default: 'none', sm: 'inline'}})}>
        {'})'}
      </span>
    </pre>
  );
}

export function Comment({author, avatar, date, body}: any) {
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
      <span className={style({gridArea: 'name', font: 'title-sm', color: {default: 'title', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {author}
      </span>
      <span className={style({gridArea: 'date', font: 'detail-sm', color: {default: 'detail', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {date}
      </span>
      <span className={style({gridArea: 'body', font: 'body', color: {default: 'body', forcedColors: 'ButtonText'}, display: 'flex', alignItems: 'center', columnGap: 8})}>
        {body}
      </span>
    </div>
  )
}

function Arrow() {
  return (
    <svg
      height={5}
      className={style({
        flexGrow: 1,
        flexShrink: 0,
        minWidth: 0,
        contain: 'size'
      })}>
      <circle r={2.5} cx={2.5} cy={2.5} className={style({fill: 'gray-500'})} />
      <line x1={2.5} y1={2.5} x2="100%" y2={2.5} className={style({stroke: 'gray-500'})} strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}
