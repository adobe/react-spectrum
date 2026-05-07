/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Mark as a client only package. This will cause a build time error if you try
// to import it from a React Server Component in a framework like Next.js.
import 'client-only';

export {
  Disclosure,
  DisclosurePanel,
  DisclosureStateContext,
  DisclosureContext
} from '../src/Disclosure';
export type {
  DisclosureProps,
  DisclosureRenderProps,
  DisclosurePanelProps,
  DisclosurePanelRenderProps
} from '../src/Disclosure';
export type {DisclosureState} from 'react-stately/useDisclosureState';

export {Heading} from '../src/Heading';
export type {HeadingProps} from '../src/Heading';

export {Button} from '../src/Button';
export type {ButtonProps, ButtonRenderProps} from '../src/Button';
