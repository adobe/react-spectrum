import {InterfaceType, setLinks, TInterface} from './types';
import React from 'react';

interface ClassAPIProps {
  class: TInterface,
  links: any
}

export function ClassAPI({class: c, links}: ClassAPIProps) {
  setLinks(links);
  return (
    <InterfaceType {...c} />
  );
}
