import {ReactNode, useCallback, useContext, useEffect, useLayoutEffect, useRef} from "react";
import {TabListStateContext} from "react-aria-components";

export function TabPanelCarousel({children}: {children: ReactNode}) {
  let state = useContext(TabListStateContext)!;
  let ref = useRef<HTMLDivElement | null>(null);

  // Update the selected tab on scroll end.
  let onScrollEnd = useCallback(() => {
    let el = ref.current;
    if (!el) return;
    let index = Math.round(el.scrollLeft / el.offsetWidth);
    state.setSelectedKey([...state.collection][index].key);
  }, [state]);

  // Polyfill for onScrollEnd in Safari.
  let timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    let onScroll = () => {
      clearTimeout(timeout.current);
      timeout.current = setTimeout(() => {
        onScrollEnd();
      }, 300);
    };

    if (!('onscrollend' in window)) {
      ref.current?.addEventListener('scroll', onScroll);
      return () => ref.current?.removeEventListener('scroll', onScroll);
    }
  }, [onScrollEnd]);

  // Scroll the selected tab panel into view when tapping on a tab.
  useLayoutEffect(() => {
    if (!state?.selectedItem || !ref.current) return;
    let panel = ref.current.children[state.selectedItem!.index] as HTMLElement;
    ref.current.scrollTo({
      left: panel.offsetLeft,
      behavior: 'smooth'
    });
  }, [state?.selectedKey]);

  return (
    <div
      ref={ref}
      className="overflow-auto snap-x snap-mandatory flex relative"
      style={{
        scrollTimeline: '--scroll x',
        scrollbarWidth: 'none'
      } as any}
      onScrollEnd={onScrollEnd}>
      {children}
    </div>
  );
}
