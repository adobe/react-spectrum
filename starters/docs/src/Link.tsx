'use client';
import {Link as RACLink, type LinkProps} from 'react-aria-components/Link';
import './Link.css';

export function Link(props: LinkProps) {
  return <RACLink {...props} />;
}
