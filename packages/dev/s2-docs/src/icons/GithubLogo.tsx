
import {createIcon} from '@react-spectrum/s2';

import {forwardRef, Ref, SVGProps} from 'react';
import {style} from '@react-spectrum/s2/style' with { type: 'macro' };

const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (<svg className={style({color: 'gray-1000'})} xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 20 19" ref={ref} {...props}><path
  d="M9.969 0C4.457 0 0 4.355 0 9.742c0 4.305 2.855 7.95 6.816 9.238.497.098.676-.207.676-.464 0-.227-.015-1-.015-1.809-2.774.582-3.352-1.16-3.352-1.16-.445-1.129-1.105-1.418-1.105-1.418-.907-.598.066-.598.066-.598 1.008.063 1.535 1 1.535 1 .89 1.485 2.328 1.063 2.906.805.082-.629.348-1.063.63-1.305-2.216-.226-4.544-1.066-4.544-4.804 0-1.067.399-1.938 1.024-2.614-.098-.242-.446-1.242.101-2.582 0 0 .84-.258 2.739 1 .812-.21 1.652-.32 2.492-.32.844 0 1.703.11 2.492.32 1.898-1.258 2.742-1 2.742-1 .543 1.34.2 2.34.098 2.582.644.676 1.023 1.547 1.023 2.614 0 3.738-2.328 4.562-4.554 4.804.363.305.675.887.675 1.805 0 1.309-.015 2.355-.015 2.68 0 .257.183.562.675.464 3.961-1.289 6.82-4.933 6.82-9.238C19.942 4.355 15.47 0 9.97 0m0 0"
  className={style({stroke: 'none', fill: '[currentcolor]'})}
  style={{
    stroke: 'none',
    fillRule: 'evenodd',
    fillOpacity: 1
  }} /></svg>);
const ForwardRef = forwardRef(SvgComponent);


export default /*#__PURE__*/ createIcon(ForwardRef);
