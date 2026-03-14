'use client';
import {ReactNode} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};
import {Token} from './CodeToken';

const styles = [
  style({color: 'magenta-1000'}), // keyword
  style({color: 'green-1000'}), // string
  style({color: 'pink-1000'}), // number
  style({color: 'indigo-1000'}), // property
  style({color: 'red-1000'}), // function
  style({color: 'gray-700'}), // comment
  style({color: 'fuchsia-1000'}), // variable
  style({display: '--import-display'}) // import
];

interface CodeClientProps {
  tokens: Token[]
}

export function CodeClient({tokens}: CodeClientProps) {
  let i = 0;
  let children: ReactNode[] = [];
  while (i < tokens.length) {
    let value = tokens[i++];
    if (typeof value === 'number') {
      // A number represents a token type. The following value is its children.
      let type = value;
      value = tokens[i++];
      let child = Array.isArray(value) ? <CodeClient tokens={value} /> : value;
      children.push(<span key={i} className={styles[type]}>{child}</span>);
    } else if (Array.isArray(value)) {
      // A nested array of tokens.
      children.push(<CodeClient key={i} tokens={value} />);
    } else {
      children.push(value);
    }
  }

  return children;
}
