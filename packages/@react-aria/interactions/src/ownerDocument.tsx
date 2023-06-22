/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React, {createContext, ReactNode} from 'react';
import {resetGlobalFocusEvents} from './useFocusVisible';
import {useIsSSR} from '@react-aria/ssr';
import {useLayoutEffect} from '@react-aria/utils';
import {resetGlobalEvents} from "@react-aria/utils/src/runAfterTransition";

export interface DocumentProviderProps {
  /** Contents that should use the owner document. */
  children: ReactNode,
  /** The owner document to use. */
  document: Document
}

const DocumentContext = createContext<Document>(document);

export function DocumentProvider(props: DocumentProviderProps) {
  let {children, document: ownerDocument} = props;

  useLayoutEffect(() => {
    if (ownerDocument) {
      resetGlobalFocusEvents(ownerDocument);
      resetGlobalEvents(ownerDocument);
    }
  }, [ownerDocument]);

  return <DocumentContext.Provider value={ownerDocument}>{children}</DocumentContext.Provider>;
}

export function useDocument() {
  let isSSR = useIsSSR();
  let context = React.useContext(DocumentContext);
  return isSSR ? null : context || document;
}
