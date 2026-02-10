import { Link } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import { ReactNode } from 'react';

export function Arrows({children}: {children: ReactNode}): ReactNode {
  return (
    <svg
      viewBox="0 0 1324 700"
      style={{position: 'absolute', insetInline: -150, insetBlock: -50, width: 'calc(100% + 300px)', height: 'calc(100% + 100px)', pointerEvents: 'none'}}
      className={style({
        display: {
          default: 'none',
          '@media (width >= 1400px)': 'block'
        }
      })}>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 6 6"
          refX={3}
          refY={3}
          markerWidth={6}
          markerHeight={6}
          orient="auto-start-reverse"
          fill="light-dark(black,white)">
          <circle r={3} cx={3} cy={3} />
        </marker>
        <mask id="app-mask" maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="white" />
          <rect x={150} y={50} width={1024} height={600} fill="black" />
        </mask> 
        <mask id="app-mask2" maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="black" />
          <rect x={150} y={50} width={1024} height={600} fill="white" />
        </mask> 
      </defs>
      {children}
    </svg>
  );
}

interface ArrowProps {
  href: string,
  children: ReactNode,
  textX: number,
  x1?: number,
  x2?: number,
  points?: string,
  y: number,
  marker?: 'markerStart' | 'markerEnd' | 'none'
}

export function Arrow({href, children, textX, x1, x2, points, y, marker = 'markerEnd'}: ArrowProps): ReactNode {
  let markerProps = marker === 'none' ? {} : {...{[marker]: 'url(#arrow)'}};
  return (
    <>
      {points
        ? <polyline points={points} {...markerProps} stroke="white" fill="none" mask="url(#app-mask)" />
        : <line x1={x1} y1={y} x2={x2} y2={y} {...markerProps} stroke="white" mask="url(#app-mask)" />
      }
      {points
        ? <polyline points={points} {...markerProps} stroke="light-dark(black,white)" fill="none" mask="url(#app-mask2)" />
        : <line x1={x1} y1={y} x2={x2} y2={y} {...markerProps} stroke="light-dark(black,white)" mask="url(#app-mask2)" />
      }
      <Link href={href} target="_blank" isQuiet isStandalone staticColor="white" UNSAFE_style={{pointerEvents: 'auto'}}>
        <text x={textX} y={y + 3} fill="currentColor" textDecoration="inherit">{children}</text>
      </Link>
    </>
  );
}
