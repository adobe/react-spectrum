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

export class TestContainer {
  private document: Document;
  private window: Window & typeof globalThis;

  constructor(type: string) {
    let doctype = document.implementation.createDocumentType(type, '', '');

    let iframe = document.createElement('iframe');
    document.body.append(iframe);

    this.document = iframe.contentDocument as typeof this.document;
    this.window = iframe.contentWindow as typeof this.window;

    this.document.replaceChildren();
    this.document.append(doctype);
  }

  /**
   * Returns the host node of the container.
   */
  public getRootNode(): HTMLIFrameElement {
    return this.window.frameElement as HTMLIFrameElement;
  }

  /**
   * Returns the document of the container.
   */
  public getDocument(): Document {
    return this.document;
  }

  /**
   * Returns the window of the container.
   */
  public getWindow(): Window & typeof globalThis {
    return this.window;
  }

  /**
   * Clears all nodes in the container document.
   */
  public reset(): void {
    let doctype = this.document.doctype;

    if (doctype != null) {
      let serializer = new this.window.XMLSerializer();
      let serialized = serializer.serializeToString(doctype);

      this.document.open();
      this.document.write(serialized);
      this.document.close();
    } else {
      this.document.open();
      this.document.write('');
      this.document.close();
    }
  }

  /**
   * Removes the container from its owner document.
   */
  public remove(): void {
    this.window.frameElement?.remove();
  }
}
