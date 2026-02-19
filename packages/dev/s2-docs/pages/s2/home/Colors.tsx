'use client';

import {Fragment, useState} from "react";
import {ListBox, ListBoxItem} from 'react-aria-components';
import {style} from "@react-spectrum/s2/style" with {type: 'macro'};

export function Colors({scales}: {scales: [string, string][][]}) {
  let [current, setCurrent] = useState<string>('red-400');

  let swatches = scales.map((scale, i) => {
    return (
      <Fragment key={i}>
        {scale.map(([name, className]) => (
          <ListBoxItem
            key={String(name)}
            className={String(className)}
            aria-label={name as string}
            onHoverStart={() => setCurrent(name)}
            onFocus={() => setCurrent(name)}
            onAction={() => setCurrent(name)} />
        ))}
      </Fragment>
    )
  });

  return (
    <>
      <pre className={style({font: 'code-sm', marginTop: 0})}>
        {current && <code style={{fontFamily: 'inherit', WebkitTextSizeAdjust: 'none'}}>
          <span className={styles.function}>style</span>
          {'({'}
          <span className={styles.property}>color</span>
          {': '}
          <span className={styles.string}>{`'${current}'`}</span>
          {'})'}
        </code>}
        {!current && <br />}
      </pre>
      <ListBox
        aria-label="Colors"
        layout="grid"
        className={style({
          display: 'grid',
          gridTemplateColumns: 'repeat(16, minmax(16px, 24px))',
          gap: 4
        })}>
        {swatches}
      </ListBox>
    </>
  );
}

const styles = {
  string: style({color: 'green-1000'}),
  number: style({color: 'pink-1000'}),
  property: style({color: 'indigo-1000'}),
  function: style({color: 'red-1000'}),
  variable: style({color: 'fuchsia-1000'})
};
