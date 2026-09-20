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

import {Axis, Key} from '@react-types/shared';
import {createPortal} from 'react-dom';
import {describe, expect, it} from 'vitest';
import {
  getMaxScrollLeft,
  getMaxScrollTop,
  getScrollLeft,
  getScrollLeftDirection,
  getScrollTop,
  getScrollTopDirection
} from '../../src/utils/getScrollOffset';
import React, {createRef, forwardRef, useImperativeHandle, useMemo} from 'react';
import {render} from 'vitest-browser-react';
import {TestContainer} from '@react-aria/test-utils';
import {useId} from '../../src/utils/useId';
import {useLayoutEffect} from '../../src/utils/useLayoutEffect';

export const STYLESHEET = Object.freeze(`
  .container { width: 100px; height: 100px; }
  .content { width: 100%; height: 100%; min-width: 1px; min-height: 1px; flex: none; }

  .scroll-y { height: 300vh; }
  .scroll-x { width: 300vw; }

  .overflow-auto { overflow: auto; }
  .overflow-hidden { overflow: hidden; }

  .flex-column-reverse { display: flex; flex-direction: column-reverse; }
  .flex-row-reverse { display: flex; flex-direction: row-reverse; }
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

function getNativeScrollOffset(element: HTMLElement, axis: Axis): number {
  let scrollingElement = element.contains(element.ownerDocument.scrollingElement)
    ? element.ownerDocument.scrollingElement!
    : element;

  switch (axis) {
    case 'block':
      return scrollingElement.scrollTop;
    case 'inline':
      return scrollingElement.scrollLeft;
  }
}

function getNativeMaxScrollOffset(element: HTMLElement, axis: Axis): number {
  let scrollingElement = element.contains(element.ownerDocument.scrollingElement)
    ? element.ownerDocument.scrollingElement!
    : element;

  try {
    let key = axis === 'block' ? 'top' : 'left';

    scrollingElement.scrollTo({[key]: Number.MAX_SAFE_INTEGER});
    let max = getNativeScrollOffset(element, axis);

    scrollingElement.scrollTo({[key]: Number.MIN_SAFE_INTEGER});
    let min = getNativeScrollOffset(element, axis);

    return max !== 0 ? max : min;
  } finally {
    scrollingElement.scroll(0, 0);
  }
}

describe('getScrollTop', () => {
  it('should return the block scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'block');
    let actual = getScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.scroll(0, 1);

    expected = getNativeScrollOffset(ref.current!, 'block');
    actual = getScrollTop(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('should return the block reverse scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'block');
    let actual = getScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.scroll(0, -1);

    expected = getNativeScrollOffset(ref.current!, 'block');
    actual = getScrollTop(ref.current!);

    expect(actual).toBe(-1);
    expect(actual).toBe(expected);
  });

  it('should return the block root scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'block');
    let actual = getScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.ownerDocument.defaultView?.scroll(0, 1);

    expected = getNativeScrollOffset(ref.current!, 'block');
    actual = getScrollTop(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('supports document nodes', async () => {
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

    let expected = getNativeScrollOffset(ref.current!.documentElement, 'block');
    let actual = getScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.defaultView?.scroll(0, 1);

    expected = getNativeScrollOffset(ref.current!.documentElement, 'block');
    actual = getScrollTop(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('supports quirks mode documents', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'block');
    let actual = getScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.ownerDocument.defaultView?.scroll(0, 1);

    expected = getNativeScrollOffset(ref.current!, 'block');
    actual = getScrollTop(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });
});

describe('getScrollLeft', () => {
  it('should return the inline scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.scroll(1, 0);

    expected = getNativeScrollOffset(ref.current!, 'inline');
    actual = getScrollLeft(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('should return the inline reverse scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.scroll(-1, 0);

    expected = getNativeScrollOffset(ref.current!, 'inline');
    actual = getScrollLeft(ref.current!);

    expect(actual).toBe(-1);
    expect(actual).toBe(expected);
  });

  it('should return the inline root scroll offset', async () => {
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

    let expected = getNativeScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.ownerDocument.defaultView?.scroll(1, 0);

    expected = getNativeScrollOffset(ref.current!, 'inline');
    actual = getScrollLeft(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('supports document nodes', async () => {
    let ref = createRef<Document>();

    await render(
      <Document doctype="html" ref={ref}>
        <html lang="en-US">
          <body>
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeScrollOffset(ref.current!.documentElement, 'inline');
    let actual = getScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.defaultView?.scroll(1, 0);

    expected = getNativeScrollOffset(ref.current!.documentElement, 'inline');
    actual = getScrollLeft(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });

  it('supports quirks mode documents', async () => {
    let ref = createRef<HTMLHtmlElement>();

    await render(
      <Document doctype="quirks">
        <html lang="en-US" ref={ref}>
          <body>
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let scrollingElement = ref.current?.ownerDocument.scrollingElement;
    let bodyElement = ref.current?.ownerDocument.body;

    expect(scrollingElement).toBe(bodyElement);

    let expected = getNativeScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);

    ref.current?.ownerDocument.defaultView?.scroll(1, 0);

    expected = getNativeScrollOffset(ref.current!, 'inline');
    actual = getScrollLeft(ref.current!);

    expect(actual).toBe(1);
    expect(actual).toBe(expected);
  });
});

describe('getMaxScrollTop', () => {
  it('should return the max block scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return zero for non-scrollable', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);
  });

  it('should return the max block reverse scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeLessThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max block root scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max block reverse root scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return zero when propagating overflow', async () => {
    let ref = createRef<HTMLBodyElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US">
          <body ref={ref}>
            <div className="content scroll-y" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);
  });

  it('supports document nodes', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!.documentElement, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('supports quirks mode documents', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getMaxScrollTop(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });
});

describe('getMaxScrollLeft', () => {
  it('should return the max inline scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return zero for non-scrollable', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);
  });

  it('should return the max inline reverse scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeLessThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max inline rtl scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeLessThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max inline reverse rtl scroll offset', async () => {
    let ref = createRef<HTMLDivElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US">
          <body>
            <div className="container overflow-auto flex-row-reverse" dir="rtl" ref={ref}>
              <div className="content scroll-x" />
            </div>
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max inline root scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('should return the max inline rtl root scroll offset', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeLessThan(0);
    expect(actual).toBe(expected);
  });

  it('should return zero when propagating overflow', async () => {
    let ref = createRef<HTMLBodyElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US">
          <body ref={ref}>
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBe(0);
    expect(actual).toBe(expected);
  });

  it('supports document nodes', async () => {
    let ref = createRef<Document>();

    await render(
      <Document doctype="html" ref={ref}>
        <html lang="en-US">
          <body>
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!.documentElement, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });

  it('supports quirks mode documents', async () => {
    let ref = createRef<HTMLHtmlElement>();

    await render(
      <Document doctype="quirks">
        <html lang="en-US" ref={ref}>
          <body>
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getMaxScrollLeft(ref.current!);

    expect(actual).toBeGreaterThan(0);
    expect(actual).toBe(expected);
  });
});

describe('getScrollTopDirection', () => {
  it('should return ascending for normal scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getScrollTopDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return descending for reverse scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getScrollTopDirection(ref.current!);

    expect(actual).toBe('descending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return ascending for root scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getScrollTopDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return ascending for reverse root scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'block');
    let actual = getScrollTopDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });
});

describe('getScrollLeftDirection', () => {
  it('should return ascending for normal scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return descending for reverse scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('descending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return descending for rtl scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('descending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return ascending for reverse rtl scroll direction', async () => {
    let ref = createRef<HTMLDivElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US">
          <body>
            <div className="container overflow-auto flex-row-reverse" dir="rtl" ref={ref}>
              <div className="content scroll-x" />
            </div>
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return ascending for reverse root scroll direction', async () => {
    let ref = createRef<HTMLHtmlElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US" ref={ref}>
          <body className="flex-row-reverse">
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('ascending');
    expect(expected).toBe(0);
  });

  it('should return descending for rtl root scroll direction', async () => {
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

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('descending');
    expect(actual).toBe(expected > 0 ? 'ascending' : 'descending');
  });

  it('should return descending for reverse rtl root scroll direction', async () => {
    let ref = createRef<HTMLHtmlElement>();

    await render(
      <Document doctype="html">
        <html lang="en-US" dir="rtl" ref={ref}>
          <body className="flex-row-reverse">
            <div className="content scroll-x" />
          </body>
        </html>
      </Document>
    );

    let expected = getNativeMaxScrollOffset(ref.current!, 'inline');
    let actual = getScrollLeftDirection(ref.current!);

    expect(actual).toBe('descending');
    expect(expected).toBe(0);
  });
});
