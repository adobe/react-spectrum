/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
export {CLEAR_FOCUS_EVENT, FOCUS_EVENT} from 'react-aria/private/utils/constants';

export {isMac, isIPhone, isIPad, isIOS, isAppleDevice, isWebKit, isChrome, isAndroid, isFirefox} from 'react-aria/private/utils/platform';
export {openLink, getSyntheticLinkProps, useSyntheticLinkProps, RouterProvider, shouldClientNavigate, useRouter, useLinkProps, handleLinkClick} from 'react-aria/private/utils/openLink';
export {useId} from 'react-aria/useId';
export {mergeIds, useSlotId} from 'react-aria/private/utils/useId';
export {chain} from 'react-aria/chain';
export {createShadowTreeWalker, ShadowTreeWalker} from 'react-aria/private/utils/shadowdom/ShadowTreeWalker';
export {getActiveElement, getEventTarget, nodeContains, isFocusWithin} from 'react-aria/private/utils/shadowdom/DOMFunctions';
export {getOwnerDocument, getOwnerWindow, isShadowRoot} from 'react-aria/private/utils/domHelpers';
export {mergeProps} from 'react-aria/mergeProps';
export {mergeRefs} from 'react-aria/mergeRefs';
export {filterDOMProps} from 'react-aria/filterDOMProps';
export {focusWithoutScrolling} from 'react-aria/private/utils/focusWithoutScrolling';
export {getOffset} from 'react-aria/private/utils/getOffset';
export {runAfterTransition} from 'react-aria/private/utils/runAfterTransition';
export {useDrag1D} from 'react-aria/private/utils/useDrag1D';
export {useGlobalListeners} from 'react-aria/private/utils/useGlobalListeners';
export {useLabels} from 'react-aria/private/utils/useLabels';
export {useObjectRef} from 'react-aria/useObjectRef';
export {useUpdateEffect} from 'react-aria/private/utils/useUpdateEffect';
export {useUpdateLayoutEffect} from 'react-aria/private/utils/useUpdateLayoutEffect';
export {useLayoutEffect} from 'react-aria/private/utils/useLayoutEffect';
export {useResizeObserver} from 'react-aria/private/utils/useResizeObserver';
export {useSyncRef} from 'react-aria/private/utils/useSyncRef';
export {getScrollParent} from 'react-aria/private/utils/getScrollParent';
export {getScrollParents} from 'react-aria/private/utils/getScrollParents';
export {isScrollable} from 'react-aria/private/utils/isScrollable';
export {useViewportSize} from 'react-aria/private/utils/useViewportSize';
export {useDescription} from 'react-aria/private/utils/useDescription';
export {useEvent} from 'react-aria/private/utils/useEvent';
export {useValueEffect} from 'react-aria/private/utils/useValueEffect';
export {scrollIntoView, scrollIntoViewport} from 'react-aria/private/utils/scrollIntoView';
export {isVirtualClick, isVirtualPointerEvent} from 'react-aria/private/utils/isVirtualEvent';
export {useEffectEvent} from 'react-aria/private/utils/useEffectEvent';
export {useDeepMemo} from 'react-aria/private/utils/useDeepMemo';
export {useFormReset} from 'react-aria/private/utils/useFormReset';
export {useLoadMore} from 'react-aria/private/utils/useLoadMore';
export {useLoadMoreSentinel, useLoadMoreSentinel as UNSTABLE_useLoadMoreSentinel} from 'react-aria/private/utils/useLoadMoreSentinel';
export {inertValue} from 'react-aria/private/utils/inertValue';
export {isCtrlKeyPressed, willOpenKeyboard} from 'react-aria/private/utils/keyboard';
export {useEnterAnimation, useExitAnimation} from 'react-aria/private/utils/animation';
export {isFocusable, isTabbable} from 'react-aria/private/utils/isFocusable';
export {getNonce} from 'react-aria/private/utils/getNonce';
export type {LoadMoreSentinelProps} from 'react-aria/private/utils/useLoadMoreSentinel';
export {clamp, snapValueToStep} from 'react-stately/private/utils/number';
