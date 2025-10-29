import {useContext, useId} from "react";
import {TabListStateContext} from "react-aria-components";

export function TabSelectionIndicator() {
  let state = useContext(TabListStateContext);
  if (!state) return null;

  // Generate keyframes for each tab using CSS anchor positioning.
  let animationId = useId();
  let keyframes = [];
  for (let item of state.collection) {
    keyframes.push(`${Math.round(item.index / (state.collection.size - 1) * 100)}% {
      top: anchor(--tab-${item.key} start);
      left: anchor(--tab-${item.key} start);
      bottom: anchor(--tab-${item.key} end);
      right: anchor(--tab-${item.key} end);
    }`);
  }

  return (
    <>
      <style>
        {`@keyframes ${animationId} {
          ${keyframes.join('\n\n')}
        `}
      </style>
      <div
        className="absolute z-10 bg-white forced-color-adjust-none rounded-full mix-blend-difference contain-strict transition-[inset]"
        style={{
          animationName: animationId,
          animationTimingFunction: 'linear',
          animationTimeline: '--scroll',
          animationFillMode: 'both'
        } as any} />
    </>
  );
}
