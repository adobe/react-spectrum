
import {useEffect} from 'react';

export function StaticColorProvider(props: {staticColor?: 'black' | 'white'}) {
  let {staticColor} = props;
  useEffect(() => {
    if (!staticColor) {
      return;
    }
    document.body.style.background = staticColor === 'black' ? 'linear-gradient(to right,#ddd6fe,#fbcfe8)' : 'linear-gradient(to right,#0f172a,#334155)';
    return () => {
      document.body.style.background = '';
    };
  }, [staticColor]);
  return null;
}

export const StaticColorDecorator = (Story: any, {args}: any) => (
  <>
    <StaticColorProvider staticColor={args.staticColor} />
    <Story />
  </>
);
