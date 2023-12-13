import {Finger} from './components';
import React, {useCallback, useRef, useState} from 'react';
import {Switch} from 'react-aria-components';
import {useIntersectionObserver} from './utils';

export function SwitchAnimation() {
  let ref = useRef();
  let [isAnimating, setAnimating] = useState(false);
  let [isSelected, setSelected] = useState(true);

  useIntersectionObserver(ref, useCallback(() => {
    setAnimating(true);
    return () => {
      setAnimating(false);
      setSelected(true);
    };
  }, []));

  return (
    <>
      <Finger style={{animation: isAnimating ? 'touch-animation 12s ease-in-out 500ms' : null}} />
      <Switch
        aria-label="Example switch"
        ref={ref}
        isSelected={isSelected}
        onChange={setSelected}
        className="group inline-flex touch-none">
        <span className="[--bg:theme(colors.slate.300)] dark:[--bg:theme(colors.zinc.600)] forced-colors:![--bg:ButtonFace] bg-[--bg] [--bg-selected:theme(colors.green.500)] forced-colors:![--bg-selected:Highlight] group-selected:bg-[--bg-selected] group-focus-visible:outline outline-2 outline-blue-600 forced-colors:outline-[Highlight] outline-offset-2 mr-4 h-10 w-16 rounded-full border border-black/[5%] dark:border-white/10 p-[3px] transition duration-200" style={{animation: isAnimating ? 'switch-background-animation 12s ease-in-out 500ms' : null}}>
          <span className="group-selected:ml-6 group-selected:group-pressed:ml-4 group-pressed:w-10 block h-8 w-8 origin-right rounded-full bg-white forced-colors:bg-[ButtonText] forced-colors:group-selected:bg-[HighlightText] border border-transparent shadow transition-all duration-200" style={{animation: isAnimating ? 'switch-animation 12s ease-in-out 500ms' : null, contain: 'layout'}} />
        </span>
      </Switch>
    </>
  );
}
