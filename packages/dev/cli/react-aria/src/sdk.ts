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

import {
  type ApiDocsResult,
  type CommonQueryOptions,
  prefetchDocs as corePrefetchDocs,
  queryApi as coreQueryApi,
  readDocs as coreReadDocs,
  resolveWorkspace as coreResolveWorkspace,
  searchDocs as coreSearchDocs,
  type PrefetchDocsResult,
  type QueryApiOptions,
  type ReadDocsOptions,
  type ReadDocsResult,
  type ResolutionState,
  type SearchDocsOptions,
  type SearchDocsResult
} from '../../../agent-docs-core/src/index.js';

export * from '../../../agent-docs-core/src/index.js';

export function resolveWorkspace(options: CommonQueryOptions = {}): Promise<ResolutionState> {
  return coreResolveWorkspace({defaultLibrary: 'rac', ...options});
}

export function searchDocs(options: SearchDocsOptions): Promise<SearchDocsResult> {
  return coreSearchDocs({defaultLibrary: 'rac', ...options});
}

export function readDocs(options: ReadDocsOptions): Promise<ReadDocsResult> {
  return coreReadDocs({defaultLibrary: 'rac', ...options});
}

export function queryApi(options: QueryApiOptions): Promise<ApiDocsResult> {
  return coreQueryApi({defaultLibrary: 'rac', ...options});
}

export function prefetchDocs(options: CommonQueryOptions = {}): Promise<PrefetchDocsResult> {
  return corePrefetchDocs({defaultLibrary: 'rac', ...options});
}
