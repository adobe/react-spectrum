import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

const Code = ({children}) => <code className={style({font: 'code'})}>{children}</code>;

export function S2StyleProperties({properties}: {properties: string[]}) {
  return (
    <ul
      className={style({
        fontSize: 'body-lg',
        lineHeight: 'body',
        color: 'body',
        padding: 0,
        listStyleType: 'none',
        display: 'grid',
        gridTemplateColumns: {
          default: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))'
        }
      })}>
      {properties.map(property => (
        <li key={property}><Code>{property}</Code></li>
      ))}
    </ul>
  );
}
