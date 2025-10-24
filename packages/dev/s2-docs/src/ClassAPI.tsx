import {InterfaceType, setLinks, TInterface} from './types';
import React from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};


const wrapper = style({
  paddingX: {
    default: 0,
    isInSwitcher: 32
  },
  paddingBottom: {
    default: 0,
    isInSwitcher: 32
  }
});
interface ClassAPIProps {
  class: TInterface,
  links: any,
  // TODO: replace by making this a client component if we can do that
  isInSwitcher?: boolean
}

export function ClassAPI({class: c, links, isInSwitcher}: ClassAPIProps) {
  setLinks(links);
  return (
    <div className={wrapper({isInSwitcher})}>
      <InterfaceType {...c} />
    </div>
  );
}
