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
  UNSTABLE_Toast,
  UNSTABLE_ToastList,
  UNSTABLE_ToastRegion,
  UNSTABLE_ToastContent,
  UNSTABLE_ToastStateContext
} from '../src/Toast';
export {ToastQueue as UNSTABLE_ToastQueue} from 'react-stately/useToastState';
export type {
  ToastRegionProps,
  ToastListProps,
  ToastRegionRenderProps,
  ToastProps,
  ToastRenderProps
} from '../src/Toast';
export type {QueuedToast, ToastOptions, ToastState} from 'react-stately/useToastState';

export {Text} from '../src/Text';
export type {TextProps} from '../src/Text';

export {Button} from '../src/Button';
export type {ButtonProps, ButtonRenderProps} from '../src/Button';
