/* eslint-disable rulesdir/imports */
import {ComponentType} from 'react';
// @ts-ignore
import illustrations from '/packages/@react-spectrum/s2/spectrum-illustrations/gradient/generic1/*.tsx';

type IllustrationItemType = {
  id: string,
  Component: ComponentType<any>
};

export default Object.keys(illustrations).reduce<IllustrationItemType[]>((acc, name) => {
  let mod = illustrations[name];
  if (mod?.default) {acc.push({id: name, Component: mod.default});}
  return acc;
}, []);
