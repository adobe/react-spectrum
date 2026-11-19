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

import {commands} from 'vitest/browser';
import {createPortal} from 'react-dom';
import {describe, expect, it} from 'vitest';
import {isScrollable, ScrollableOptions} from '../../src/utils/isScrollable';
import {Key} from '@react-types/shared';
import React, {createRef, forwardRef, useImperativeHandle, useMemo} from 'react';
import {render} from 'vitest-browser-react';
import {TestContainer} from '@react-aria/test-utils';
import {useId} from '../../src/utils/useId';
import {useLayoutEffect} from '../../src/utils/useLayoutEffect';

declare module 'vitest/browser' {
  interface BrowserCommands {
    wheel: (deltaX: number, deltaY: number) => Promise<void>;
  }
}

export const STYLESHEET = Object.freeze(`
  .container { width: 100px; height: 100px; }
  .content { width: 100%; height: 100%; min-width: 1px; min-height: 1px; }

  .scroll-y { height: 300vh; }
  .scroll-x { width: 300vw; }

  .display-none { display: none; }

  .overflow-visible { overflow: visible; }
  .overflow-hidden { overflow: hidden; }
  .overflow-clip { overflow: clip; }
  .overflow-scroll { overflow: scroll; }
  .overflow-auto { overflow: auto; }

  .overflow-x-visible { overflow-x: visible; }
  .overflow-x-hidden { overflow-x: hidden; }
  .overflow-x-clip { overflow-x: clip; }
  .overflow-x-scroll { overflow-x: scroll; }
  .overflow-x-auto { overflow-x: auto; }

  .overflow-y-visible { overflow-y: visible; }
  .overflow-y-hidden { overflow-y: hidden; }
  .overflow-y-clip { overflow-y: clip; }
  .overflow-y-scroll { overflow-y: scroll; }
  .overflow-y-auto { overflow-y: auto; }

  .snap-none { scroll-snap-type: none; }
  .snap-block { scroll-snap-type: block mandatory; }
  .snap-inline { scroll-snap-type: inline mandatory; }
  .snap-both { scroll-snap-type: both mandatory; }
`);

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

async function isNativeScrollable(
  element: HTMLElement,
  options: ScrollableOptions = {}
): Promise<boolean> {
  let {axis = 'block', modality = 'pointer', scrollable = false} = options;

  let actions: Array<() => unknown> = [];

  let ownerWindow = element.ownerDocument.defaultView!;
  let ownerDocument = element.ownerDocument;

  let frameElement = ownerWindow.frameElement!;
  let contentElement = ownerDocument.createElement('div');

  let isRoot = element.contains(ownerDocument.scrollingElement);

  let propagatingTarget = isRoot ? ownerDocument : element;
  let containingElement = isRoot ? ownerDocument.documentElement : element;
  let scrollingElement = isRoot ? ownerDocument.scrollingElement! : element;

  let rects = scrollingElement.getClientRects();
  let rect = scrollingElement.getBoundingClientRect();

  let wheelUp: [number, number] = axis === 'block' ? [0, -100] : [-100, 0];
  let wheelDown: [number, number] = axis === 'block' ? [0, 100] : [100, 0];
  let scrollUp: ScrollToOptions = axis === 'block' ? {top: -100} : {left: -100};
  let scrollDown: ScrollToOptions = axis === 'block' ? {top: 100} : {left: 100};

  if (!scrollable) {
    try {
      let scrollSize = axis === 'block' ? 'scrollHeight' : 'scrollWidth';
      let size = axis === 'block' ? 'height' : 'width';
      let crossSize = axis === 'block' ? 'width' : 'height';

      contentElement.style[size] = element[scrollSize] + 1 + 'px';
      contentElement.style[crossSize] = '1px';

      containingElement.append(contentElement);

      return await isNativeScrollable(element, {...options, scrollable: true});
    } finally {
      contentElement.remove();
    }
  }

  if (rects.length > 0 && modality === 'pointer') {
    let id = frameElement.getAttribute('data-test-id');
    let selector = `iframe[data-test-id="${id}"]`;

    let left = Math.max(rect.left, 0);
    let top = Math.max(rect.top, 0);
    let right = Math.min(rect.right, ownerWindow.innerWidth);
    let bottom = Math.min(rect.bottom, ownerWindow.innerHeight);

    let mouseX = frameElement.clientLeft + (left + right) / 2;
    let mouseY = frameElement.clientTop + (top + bottom) / 2;

    await commands.mouseDownOnElement(selector, mouseX, mouseY);
    await commands.mouseUp();

    actions.push(() => commands.wheel(...wheelDown));
    actions.push(() => commands.wheel(...wheelUp));
  } else if (rects.length > 0) {
    actions.push(() => scrollingElement.scrollBy(scrollDown));
    actions.push(() => scrollingElement.scrollBy(scrollUp));
  }

  try {
    for (let scroll of actions) {
      let signal = AbortSignal.timeout(100);

      let scrolled = new Promise<boolean>(resolve => {
        signal.addEventListener('abort', () => resolve(false), {once: true});
        propagatingTarget.addEventListener('scroll', () => resolve(true), {
          once: true,
          signal
        });
      });

      await scroll();
      if (await scrolled) return true;
    }

    return false;
  } finally {
    scrollingElement.scroll(0, 0);
  }
}

describe('isScrollable (legacy)', () => {
  describe('supports potentially-scrollable container', () => {
    it('should return false for visible overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return false for hidden overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-hidden" ref={ref}>
                <div className="content scroll-y" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for auto overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for scroll overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-scroll" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for clip overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-clip" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for single axis overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-y-auto" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for visible root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-visible" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for hidden root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-hidden" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for auto root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-auto" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for scroll root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-scroll" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for clip root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-clip" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });
  });

  describe('supports viewport overflow propagation', () => {
    it('should return true for visible body overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-visible">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for hidden body overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for auto body overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-auto">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for scroll body overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-scroll">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for clip body overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-clip">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return false when propagating overflow', async () => {
      let ref = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body className="overflow-scroll" ref={ref}>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for non-propagating overflow', async () => {
      let ref = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-hidden">
            <body className="container overflow-auto" ref={ref}>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should not propagate under hidden root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-y-hidden" ref={ref}>
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline'});
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should not propagate when hidden', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-hidden display-none">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should not propagate under hidden root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="display-none" ref={ref}>
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
    });

    it('should not propagate under single axis visible root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-x-clip" ref={ref}>
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'block'});
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });
  });

  describe('supports checking for actual overflow', () => {
    it('should return false for non-scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedY = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let expectedX = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(false);
      expect(actual).toBe(expectedY || expectedX);
    });

    it('should return true for block scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={ref}>
                <div className="content scroll-y" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for inline scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={ref}>
                <div className="content scroll-x" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for inline reverse scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" dir="rtl" ref={ref}>
                <div className="content scroll-x" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for non-scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expectedY = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let expectedX = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(false);
      expect(actual).toBe(expectedY || expectedX);
    });

    it('should return false for block scrollable under hidden block overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-x-scroll overflow-y-hidden" ref={ref}>
                <div className="content scroll-y" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedY = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let expectedX = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(false);
      expect(actual).toBe(expectedY || expectedX);
    });

    it('should return false for inline scrollable under hidden inline overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-x-hidden overflow-y-scroll" ref={ref}>
                <div className="content scroll-x" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedY = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let expectedX = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(false);
      expect(actual).toBe(expectedY || expectedX);
    });

    it('should return true for block scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for inline scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body>
              <div className="content scroll-x" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for inline reverse scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" dir="rtl" ref={ref}>
            <body>
              <div className="content scroll-x" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for block reverse flex scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto flex-column-reverse" ref={ref}>
                <div className="content scroll-y" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for inline reverse flex scrollable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto flex-row-reverse" ref={ref}>
                <div className="content scroll-x" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'inline', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for block reverse flex scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="flex-column-reverse">
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {axis: 'block', scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });
  });

  describe('supports quirks mode documents', () => {
    it('should return true for visible root overflow', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for visible body overflow', async () => {
      let ref = createRef<HTMLBodyElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US">
            <body ref={ref}>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);

      let expected = await isNativeScrollable(ref.current!);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for the scrollable root', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="quirks">
          <html lang="en-US" ref={ref}>
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let scrollingElement = ref.current?.ownerDocument.scrollingElement;
      let bodyElement = ref.current?.ownerDocument.body;

      expect(scrollingElement).toBe(bodyElement);

      let expected = await isNativeScrollable(ref.current!, {scrollable: true});
      let actual = isScrollable(ref.current!, true);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });
  });
});

describe.skipIf(!supportsModernSignature())('isScrollable', () => {
  describe('supports interaction modalities', () => {
    it('should return true for hidden overflow under virtual modality', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-hidden" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
      expect(isScrollable(ref.current!, {modality: 'keyboard'})).toBe(actual);
    });

    it('should return false for clip overflow under virtual modality', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-clip" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for hidden root overflow under virtual modality', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-hidden" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for clip root overflow under virtual modality', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-clip" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for hidden body overflow under virtual modality', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for clip body overflow under virtual modality', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="overflow-clip">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!, {modality: 'virtual'});
      let actual = isScrollable(ref.current!, {modality: 'virtual'});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });
  });

  describe('supports axis isolation', () => {
    it('should return true only for the scrollable axis', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-x-scroll overflow-y-hidden" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedBlock = await isNativeScrollable(ref.current!, {axis: 'block'});
      let actualBlock = isScrollable(ref.current!, {axis: 'block'});

      await new Promise(resolve => setTimeout(resolve, 100));

      let expectedInline = await isNativeScrollable(ref.current!, {axis: 'inline'});
      let actualInline = isScrollable(ref.current!, {axis: 'inline'});

      expect(actualBlock).toBe(false);
      expect(actualBlock).toBe(expectedBlock);
      expect(actualInline).toBe(true);
      expect(actualInline).toBe(expectedInline);
    });

    it('should return true only for the overflowing axis', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto" ref={ref}>
                <div className="content scroll-y" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedBlock = await isNativeScrollable(ref.current!, {
        axis: 'block',
        scrollable: true
      });
      let actualBlock = isScrollable(ref.current!, {
        axis: 'block',
        scrollable: true
      });

      await new Promise(resolve => setTimeout(resolve, 100));

      let expectedInline = await isNativeScrollable(ref.current!, {
        axis: 'inline',
        scrollable: true
      });
      let actualInline = isScrollable(ref.current!, {
        axis: 'inline',
        scrollable: true
      });

      expect(actualBlock).toBe(true);
      expect(actualBlock).toBe(expectedBlock);
      expect(actualInline).toBe(false);
      expect(actualInline).toBe(expectedInline);
    });

    it('should return true only for the scrollable root axis', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="overflow-y-hidden" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expectedBlock = await isNativeScrollable(ref.current!, {axis: 'block'});
      let actualBlock = isScrollable(ref.current!, {axis: 'block'});

      await new Promise(resolve => setTimeout(resolve, 100));

      let expectedInline = await isNativeScrollable(ref.current!, {axis: 'inline'});
      let actualInline = isScrollable(ref.current!, {axis: 'inline'});

      expect(actualBlock).toBe(false);
      expect(actualBlock).toBe(expectedBlock);
      expect(actualInline).toBe(true);
      expect(actualInline).toBe(expectedInline);
    });
  });

  describe('supports scroll snapping', () => {
    it('should return true for block snappable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto snap-block" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let actualBlock = isScrollable(ref.current!, {snappable: true, axis: 'block'});
      let actualInline = isScrollable(ref.current!, {snappable: true, axis: 'inline'});

      expect(actualBlock).toBe(true);
      expect(actualInline).toBe(false);
    });

    it('should return true for inline snappable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto snap-inline" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let actualBlock = isScrollable(ref.current!, {snappable: true, axis: 'block'});
      let actualInline = isScrollable(ref.current!, {snappable: true, axis: 'inline'});

      expect(actualBlock).toBe(false);
      expect(actualInline).toBe(true);
    });

    it('should return false for non-snappable', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-auto snap-none" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let actual = isScrollable(ref.current!, {snappable: true});

      expect(actual).toBe(false);
    });

    it('should return true for hidden overflow', async () => {
      let ref = createRef<HTMLDivElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US">
            <body>
              <div className="container overflow-hidden snap-block" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let actual = isScrollable(ref.current!, {snappable: true});

      expect(actual).toBe(true);
    });

    it('should return true for root snappable', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" className="snap-block" ref={ref}>
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let actualBlock = isScrollable(ref.current!, {snappable: true, axis: 'block'});
      let actualInline = isScrollable(ref.current!, {snappable: true, axis: 'inline'});

      expect(actualBlock).toBe(true);
      expect(actualInline).toBe(false);
    });

    it('should return false for body snappable', async () => {
      let ref = createRef<HTMLHtmlElement>();

      await render(
        <Document doctype="html">
          <html lang="en-US" ref={ref}>
            <body className="snap-block">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let actual = isScrollable(ref.current!, {snappable: true});

      expect(actual).toBe(false);
    });
  });

  describe('supports document nodes', () => {
    it('should return true for visible root overflow', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!.documentElement);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return false for hidden body overflow', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body className="overflow-hidden">
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!.documentElement);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(false);
      expect(actual).toBe(expected);
    });

    it('should return true for root scrollable', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="html" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content scroll-y" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!.documentElement, {scrollable: true});
      let actual = isScrollable(ref.current!, {scrollable: true});

      expect(actual).toBe(true);
      expect(actual).toBe(expected);
    });

    it('should return true for visible root overflow in quirks mode', async () => {
      let ref = createRef<Document>();

      await render(
        <Document doctype="quirks" ref={ref}>
          <html lang="en-US">
            <body>
              <div className="content" />
            </body>
          </html>
        </Document>
      );

      let expected = await isNativeScrollable(ref.current!.documentElement);
      let actual = isScrollable(ref.current!);

      expect(actual).toBe(true);
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
              <div className="container overflow-auto" ref={ref}>
                <div className="content" />
              </div>
            </body>
          </html>
        </Document>
      );

      let expectedDefault = isScrollable(ref.current!, {});
      let expectedPotential = isScrollable(ref.current!, {scrollable: false});
      let expectedActual = isScrollable(ref.current!, {scrollable: true});

      let actualDefault = isScrollable(ref.current!);
      let actualPotential = isScrollable(ref.current!, false);
      let actualActual = isScrollable(ref.current!, true);

      expect(actualDefault).toBe(expectedDefault);
      expect(actualPotential).toBe(expectedPotential);
      expect(actualActual).toBe(expectedActual);
      expect(actualActual).not.toBe(actualPotential);
    });
  });
});
