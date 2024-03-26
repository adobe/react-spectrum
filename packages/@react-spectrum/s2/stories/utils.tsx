
import {ReactNode} from 'react';

type StaticColor = 'black' | 'white' | undefined;

function getBackgroundColor(staticColor: StaticColor) {
  if (staticColor === 'black') {
    return 'linear-gradient(to right,#ddd6fe,#fbcfe8)';
  } else if (staticColor === 'white') {
    return 'linear-gradient(to right,#0f172a,#334155)';
  }
  return undefined;
}
export function StaticColorProvider(props: {children: ReactNode, staticColor?: StaticColor}) {
  return <div style={{padding: 8, background: getBackgroundColor(props.staticColor)}}>{props.children}</div>;
}

export const StaticColorDecorator = (Story: any, {args}: any) => (
  <StaticColorProvider staticColor={args.staticColor}>
    <Story />
  </StaticColorProvider>
);
