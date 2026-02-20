'use client';
import {Link as RACLink, LinkProps} from 'react-aria-components';
import './Link.css';

export function Link(props: LinkProps) {
  return <RACLink {...props} />;
}
