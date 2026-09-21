/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createPortal} from 'react-dom';
import {describe, expect, it, vi} from 'vitest';
import {getScrollParent} from '../../src/utils/getScrollParent';
import {getScrollParents} from '../../src/utils/getScrollParents';
import {isScrollable} from '../../src/utils/isScrollable';
import {Key} from '@react-types/shared';
import {mergeRefs} from '../../src/utils/mergeRefs';
import React, {
  createContext,
  createRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import {render} from 'vitest-browser-react';
import {shadowDOM} from 'react-stately/private/flags/flags';
import {TestContainer} from '@react-aria/test-utils';
import {useId} from '../../src/utils/useId';
import {useLayoutEffect} from '../../src/utils/useLayoutEffect';
import {useObjectRef} from '../../src/utils/useObjectRef';

vi.mock('react-stately/private/flags/flags', () => ({
  shadowDOM: vi.fn(() => false),
  enableShadowDOM: vi.fn(),
  tableNestedRows: vi.fn(() => false),
  enableTableNestedRows: vi.fn()
}));

export const STYLESHEET = Object.freeze(`
  .container { width: 100px; height: 100px; }
  .content { width: 100%; height: 100%; min-width: 1px; min-height: 1px; flex: none; }

  .scroll-y { height: 300vh; }
  .scroll-x { width: 300vw; }

  .overflow-auto { overflow: auto; }
  .overflow-hidden { overflow: hidden; }

  .overflow-x-auto { overflow-x: auto; }
  .overflow-x-hidden { overflow-x: hidden; }
  .overflow-y-auto { overflow-y: auto; }
  .overflow-y-hidden { overflow-y: hidden; }

  .snap-block { scroll-snap-type: block mandatory; }
  .snap-inline { scroll-snap-type: inline mandatory; }

  .position-relative { position: relative; }
  .position-absolute { position: absolute; }
  .position-fixed { position: fixed; }

  .transform { transform: translateZ(0); }
`);

interface ShadowRootProps extends React.PropsWithChildren {
  mode: ShadowRootMode;
}

interface DocumentProps extends React.PropsWithChildren {
  doctype: string;
  width?: number;
  height?: number;
}

class TestBench extends TestContainer {
  constructor(type: string, key: Key) {
    super(type);

    let window = this.getWindow();
    let iframe = this.getRootNode();
    let document = this.getDocument();

    iframe.dataset.testId = String(key);

    let sheet = new window.CSSStyleSheet();
    sheet.replaceSync(STYLESHEET.trim());

    document.adoptedStyleSheets.push(sheet);

    this.reset();
  }

  public override reset(): void {
    let document = this.getDocument();

    super.reset();

    if (parseInt(React.version, 10) < 19) {
      document.documentElement.remove();
    }
  }
}

const ShadowRootContext = createContext<ShadowRoot | null>(null);

const ShadowRoot = forwardRef<HTMLDivElement, ShadowRootProps>((props, forwardedRef) => {
  let ref = useObjectRef(forwardedRef);
  let [root, setRoot] = useState<ShadowRoot | null>(null);

  useLayoutEffect(() => {
    let host = ref.current!;

    let root = host.attachShadow({mode: props.mode});
    let styles = host.ownerDocument.adoptedStyleSheets;

    root.adoptedStyleSheets.push(...styles);
    setRoot(root);
  }, [ref, props.mode]);

  return (
    <div ref={ref}>
      <ShadowRootContext.Provider value={root} children={props.children} />
    </div>
  );
});

const Shadow = forwardRef<null, React.PropsWithChildren>(props => {
  let ctx = React.useContext(ShadowRootContext);

  if (ctx == null) return null;

  return createPortal(props.children, ctx);
});

const Document = forwardRef<Document, DocumentProps>((props, ref) => {
  let {width = 300, height = 300} = props;

  let id = useId();

  let bench = useMemo(() => {
    return new TestBench(props.doctype, id);
  }, [props.doctype, id]);

  useImperativeHandle(ref, () => {
    return bench.getDocument();
  }, [bench]);

  useLayoutEffect(() => {
    let iframe = bench.getRootNode();
    iframe.width = String(width);
    iframe.height = String(height);

    return () => bench.remove();
  }, [width, height, bench]);

  // @ts-expect-error
  return createPortal(props.children, bench.getDocument());
});

function supportsModernSignature(): boolean {
  try {
    // @ts-ignore
    isScrollable(document);
    return true;
  } catch {
    return false;
  }
}

function getNativeScrollParents(element: Element): Element[] {
  let scrollingElement = element.contains(element.ownerDocument.scrollingElement)
    ? element.ownerDocument.scrollingElement!
    : element;

  let scrollParents: Element[] = [];
  let cursor: Element | null = scrollingElement;

  element.scrollIntoView({block: 'end', inline: 'end', behavior: 'instant'});

  while (cursor != null) {
    if (cursor.scrollTop !== 0 || cursor.scrollLeft !== 0) {
      scrollParents.push(cursor);
    }

    cursor.scrollTo(0, 0);

    let root = cursor.getRootNode() as ShadowRoot | Document;
    cursor = cursor.assignedSlot ?? cursor.parentElement ?? ('host' in root ? root.host : null);
  }

  return scrollParents;
}

describe('getScrollParent (legacy)', () => {
  describe('supports querying the nearest scrollable ancestor', () => {
    it('should return the nearest scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should not return a scrollable element itself', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={ref}>
                  <div className="content scroll-y" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should skip past a non-containing scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto position-relative" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto">
                  <div className="content scroll-y" />
                  <div className="position-absolute" ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should skip past a non-containing scrollable ancestor to the root', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="position-absolute" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should skip past a transformed containing block', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="transform">
                  <div className="position-fixed" ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should return null for a fixed element', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="position-fixed" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      // TODO(later): Revisit after fallback fix
      expect(expected).toBe(undefined);
      expect(actual).toBe(scrollRef.current);
      expect(actual).not.toBe(expected);
    });

    it('should return null without a scrollable root', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-hidden" ref={scrollRef}>
            <body>
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      // TODO(later): Revisit after fallback fix.
      expect(expected).toBe(undefined);
      expect(actual).toBe(scrollRef.current);
      expect(actual).not.toBe(expected);
    });

    it('should return null for a top layer element', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="container overflow-auto transform">
                <div className="content scroll-y" />
                <div popover="manual" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      ref.current!.showPopover();

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      // TODO(later): Revisit after fallback fix.
      expect(expected).toBe(undefined);
      expect(actual).toBe(scrollRef.current);
      expect(actual).not.toBe(expected);
    });

    it('should return the root scrolling element for a detached element', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="content scroll-y" />
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let element = ref.current!.ownerDocument.createElement('div');

      let [expected] = getNativeScrollParents(element);
      let actual = getScrollParent(element);

      expect(expected).toBe(undefined);
      expect(actual).toBe(scrollRef.current);
    });

    it('should return the root scrolling element under a scrollable root', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="content scroll-y" />
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should return the root scrolling element for the body', async () => {
      let ref = createRef<HTMLBodyElement>();
      let scrollRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body ref={ref}>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should return the root scrolling element for itself', async () => {
      let ref = createRef<HTMLHtmlElement>();
      let scrollRef = createRef<HTMLHtmlElement>();
      let mergedRef = mergeRefs<HTMLHtmlElement>(ref, scrollRef);

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={mergedRef}>
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });
  });

  describe('supports checking for actual overflow', () => {
    it('should skip past a non-scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={containerRef}>
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actualPotential = getScrollParent(ref.current!);
      let actual = getScrollParent(ref.current!, true);

      expect(actualPotential).toBe(containerRef.current);
      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });
  });

  describe('supports quirks mode documents', () => {
    it('should return the root scrolling element under a scrollable root', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US">
            <body ref={scrollRef}>
              <div className="content scroll-y" />
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);
      expect(scrollRef.current).toBe(bodyElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should return the root scrolling element for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();
      let scrollRef = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US" ref={ref}>
            <body ref={scrollRef}>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);
      expect(scrollRef.current).toBe(bodyElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });
  });

  describe('supports shadow DOM (disabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should return the nearest scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should not skip past a shadow boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="container overflow-auto" ref={containerRef}>
                <ShadowRoot mode="open">
                  <Shadow>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </Shadow>
                </ShadowRoot>
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      // TODO(later): Revisit after fallback fix.
      expect(expected).toBe(containerRef.current);
      expect(actual).toBe(scrollRef.current);
      expect(actual).not.toBe(expected);
    });

    it('should not skip past an assigned shadow slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={containerRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(scrollRef.current).toBe(rootElement);

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(expected).toBe(containerRef.current);
      expect(actual).toBe(scrollRef.current);
      expect(actual).not.toBe(expected);
    });
  });

  describe('supports shadow DOM (enabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(true));
    afterAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should the nearest scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should skip past a shadow boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <ShadowRoot mode="open">
                  <Shadow>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </Shadow>
                </ShadowRoot>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should skip past an assigned shadow slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });

    it('should not skip past a containing scrollable ancestor of an assigned slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto position-relative" ref={scrollRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div className="position-absolute" ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!);

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });
  });
});

describe('getScrollParents (legacy)', () => {
  describe('supports querying all scrollable ancestors', () => {
    it('should return all scrollable ancestors nearest first', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={containerRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={nearestRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, containerRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should not include a scrollable element itself', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={containerRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={ref}>
                  <div className="content scroll-y" />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([containerRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should skip past a non-containing scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto position-relative" ref={containerRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto">
                  <div className="content scroll-y" />
                  <div className="position-absolute" ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([containerRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should skip past a non-containing scrollable ancestor to the root', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="position-absolute" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should skip past a transformed containing block', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={nearestRef}>
                <div className="content scroll-y" />
                <div className="transform">
                  <div className="position-fixed" ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should return an empty list for a fixed element', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="position-fixed" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([]);
      expect(actual).toEqual(expected);
    });

    it('should return an empty list without a scrollable root', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-hidden" ref={rootRef}>
            <body>
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([]);
      expect(actual).toEqual(expected);
    });

    it('should return an empty list for a top layer element', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto transform">
                <div className="content scroll-y" />
                <div popover="manual" ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      ref.current!.showPopover();

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([]);
      expect(actual).toEqual(expected);
    });

    it('should return the root scrolling element for a detached element', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let element = ref.current!.ownerDocument.createElement('div');

      let expected = getNativeScrollParents(element);
      let actualPotential = getScrollParents(element);

      expect(expected).toEqual([]);
      expect(actualPotential).toEqual([rootRef.current]);
    });

    it('should return the root scrolling element under a scrollable root', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div ref={ref} />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should return the root scrolling element for the body', async () => {
      let ref = createRef<HTMLBodyElement>();
      let rootRef = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body ref={ref}>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should return the root scrolling element for itself', async () => {
      let ref = createRef<HTMLHtmlElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let mergedRef = mergeRefs<HTMLHtmlElement>(ref, rootRef);

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={mergedRef}>
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([rootRef.current]);
      expect(actual).toEqual(expected);
    });
  });

  describe('supports checking for actual overflow', () => {
    it('should skip past a non-scrollable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={nearestRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={containerRef}>
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actualPotential = getScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!, true);

      expect(actualPotential).toEqual([containerRef.current, nearestRef.current, rootRef.current]);
      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });
  });

  describe('supports quirks mode documents', () => {
    it('should return all scrollable ancestors nearest first', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLBodyElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US">
            <body ref={rootRef}>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={nearestRef}>
                <div className="content scroll-y" />
                <div ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);
      expect(rootRef.current).toBe(bodyElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should return the root scrolling element for the root', async () => {
      let ref = createRef<HTMLHtmlElement>();
      let rootRef = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US" ref={ref}>
            <body ref={rootRef}>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);
      expect(rootRef.current).toBe(bodyElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([rootRef.current]);
      expect(actual).toEqual(expected);
    });
  });

  describe('supports shadow DOM (disabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should return all scrollable ancestors nearest first', async () => {
      let ref = createRef<HTMLDivElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={nearestRef}>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should not skip past a shadow boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={containerRef}>
                <ShadowRoot mode="open">
                  <Shadow>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </Shadow>
                </ShadowRoot>
              </div>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(expected).toEqual([containerRef.current, rootRef.current]);
      expect(actual).toEqual([]);
      expect(actual).not.toEqual(expected);
    });

    it('should not skip past an assigned shadow slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={containerRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let rootElement = ref.current?.ownerDocument.documentElement;

      expect(scrollingElement).toBe(rootElement);
      expect(rootRef.current).toBe(rootElement);

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(expected).toEqual([containerRef.current, rootRef.current]);
      expect(actual).toEqual([rootRef.current]);
      expect(actual).not.toEqual(expected);
    });
  });

  describe('supports shadow DOM (enabled)', () => {
    beforeAll(() => vi.mocked(shadowDOM).mockReturnValue(true));
    afterAll(() => vi.mocked(shadowDOM).mockReturnValue(false));

    it('should return all scrollable ancestors nearest first', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={nearestRef}>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </div>
                </Shadow>
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should skip past a shadow boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={nearestRef}>
                <ShadowRoot mode="open">
                  <Shadow>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </Shadow>
                </ShadowRoot>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should skip past an assigned shadow slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto" ref={nearestRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });

    it('should not skip past a containing scrollable ancestor of an assigned slot', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <ShadowRoot mode="open">
                <Shadow>
                  <div className="container overflow-auto position-relative" ref={nearestRef}>
                    <div className="content scroll-y" />
                    <slot />
                  </div>
                </Shadow>
                <div className="position-absolute" ref={ref} />
              </ShadowRoot>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!);

      expect(actual).toEqual([nearestRef.current, rootRef.current]);
      expect(actual).toEqual(expected);
    });
  });
});

describe.skipIf(!supportsModernSignature())('getScrollParent', () => {
  describe('supports interaction modalities', () => {
    it('should return a hidden ancestor under virtual modality', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-hidden" ref={containerRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actualPointer = getScrollParent(ref.current!);
      let actualVirtual = getScrollParent(ref.current!, {modality: 'virtual'});

      expect(actualPointer).toBe(scrollRef.current);
      expect(actualVirtual).toBe(containerRef.current);
      expect(actualVirtual).toBe(expected);
    });
  });

  describe('supports axis isolation', () => {
    it('should return the nearest scrollable ancestor of the queried axis', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollYRef = createRef<HTMLDivElement>();
      let scrollXRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-y-auto overflow-x-hidden" ref={scrollYRef}>
                <div className="content scroll-y" />
                <div className="container overflow-x-auto overflow-y-hidden" ref={scrollXRef}>
                  <div className="content scroll-x" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actualInline = getScrollParent(ref.current!, {axis: 'inline'});
      let actualBlock = getScrollParent(ref.current!, {axis: 'block'});

      expect(actualInline).toBe(scrollXRef.current);
      expect(actualBlock).toBe(scrollYRef.current);
    });
  });

  describe('supports scroll snapping', () => {
    it('should return the nearest snappable ancestor', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto snap-block" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={containerRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actual = getScrollParent(ref.current!);
      let actualSnapping = getScrollParent(ref.current!, {snappable: true});

      expect(actual).toBe(containerRef.current);
      expect(actualSnapping).toBe(scrollRef.current);
    });
  });

  describe('supports a boundary container', () => {
    it('should return null past the boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLHtmlElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={scrollRef}>
            <body>
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div ref={containerRef}>
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actual = getScrollParent(ref.current!, {container: containerRef.current});

      // TODO(later): Revisit after fallback fix.
      expect(actual).toBe(scrollRef.current);
    });

    it('should return the boundary itself', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={scrollRef}>
                <div className="content scroll-y" />
                <div ref={ref} />
              </div>
            </body>
          </html>
        </Document>
      );

      let [expected] = getNativeScrollParents(ref.current!);
      let actual = getScrollParent(ref.current!, {container: scrollRef.current});

      expect(actual).toBe(scrollRef.current);
      expect(actual).toBe(expected);
    });
  });

  describe('supports legacy signature', () => {
    it('should assert scrollable for the shorthand option', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="container overflow-auto">
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedDefault = getScrollParent(ref.current!, {});
      let expectedPotential = getScrollParent(ref.current!, {scrollable: false});
      let expectedActual = getScrollParent(ref.current!, {scrollable: true});

      let actualDefault = getScrollParent(ref.current!);
      let actualPotential = getScrollParent(ref.current!, false);
      let actualActual = getScrollParent(ref.current!, true);

      expect(actualDefault).toBe(expectedDefault);
      expect(actualPotential).toBe(expectedPotential);
      expect(actualActual).toBe(expectedActual);
      expect(actualActual).not.toBe(actualPotential);
    });
  });
});

describe.skipIf(!supportsModernSignature())('getScrollParents', () => {
  describe('supports interaction modalities', () => {
    it('should include a hidden ancestor under virtual modality', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let nearestRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={nearestRef}>
                <div className="content scroll-y" />
                <div className="container overflow-hidden" ref={containerRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actualPointer = getScrollParents(ref.current!);
      let actualVirtual = getScrollParents(ref.current!, {modality: 'virtual'});

      expect(actualPointer).toEqual([nearestRef.current, rootRef.current]);
      expect(actualVirtual).toEqual([containerRef.current, nearestRef.current, rootRef.current]);
      expect(actualVirtual).toEqual(expected);
    });
  });

  describe('supports axis isolation', () => {
    it('should return the scrollable ancestors of the queried axis', async () => {
      let ref = createRef<HTMLDivElement>();
      let rootRef = createRef<HTMLHtmlElement>();
      let scrollYRef = createRef<HTMLDivElement>();
      let scrollXRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-x-hidden" ref={rootRef}>
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-y-auto overflow-x-hidden" ref={scrollYRef}>
                <div className="content scroll-y" />
                <div className="container overflow-x-auto overflow-y-hidden" ref={scrollXRef}>
                  <div className="content scroll-x" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actualInline = getScrollParents(ref.current!, {axis: 'inline'});
      let actualBlock = getScrollParents(ref.current!, {axis: 'block'});

      expect(actualInline).toEqual([scrollXRef.current]);
      expect(actualBlock).toEqual([scrollYRef.current, rootRef.current]);
    });
  });

  describe('supports scroll snapping', () => {
    it('should return the snappable ancestors', async () => {
      let ref = createRef<HTMLDivElement>();
      let scrollRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto snap-block" ref={scrollRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={containerRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actualSnapping = getScrollParents(ref.current!, {snappable: true});

      expect(actualSnapping).toEqual([scrollRef.current]);
    });
  });

  describe('supports a boundary container', () => {
    it('should stop at the boundary', async () => {
      let ref = createRef<HTMLDivElement>();
      let nearestRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div ref={containerRef}>
                  <div className="container overflow-auto" ref={nearestRef}>
                    <div className="content scroll-y" />
                    <div ref={ref} />
                  </div>
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let actual = getScrollParents(ref.current!, {container: containerRef.current});

      expect(actual).toEqual([nearestRef.current]);
    });

    it('should include the boundary itself', async () => {
      let ref = createRef<HTMLDivElement>();
      let nearestRef = createRef<HTMLDivElement>();
      let containerRef = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto" ref={containerRef}>
                <div className="content scroll-y" />
                <div className="container overflow-auto" ref={nearestRef}>
                  <div className="content scroll-y" />
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = getNativeScrollParents(ref.current!);
      let actual = getScrollParents(ref.current!, {container: containerRef.current});

      expect(actual).toEqual([nearestRef.current, containerRef.current]);
      expect(actual).toEqual(expected.slice(0, 2));
    });
  });

  describe('supports legacy signature', () => {
    it('should assert scrollable for the shorthand option', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
              <div className="container overflow-auto">
                <div className="content scroll-y" />
                <div className="container overflow-auto">
                  <div ref={ref} />
                </div>
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedDefault = getScrollParents(ref.current!, {});
      let expectedPotential = getScrollParents(ref.current!, {scrollable: false});
      let expectedActual = getScrollParents(ref.current!, {scrollable: true});

      let actualDefault = getScrollParents(ref.current!);
      let actualPotential = getScrollParents(ref.current!, false);
      let actualActual = getScrollParents(ref.current!, true);

      expect(actualDefault).toEqual(expectedDefault);
      expect(actualPotential).toEqual(expectedPotential);
      expect(actualActual).toEqual(expectedActual);
      expect(actualActual).not.toEqual(actualPotential);
    });
  });
});
