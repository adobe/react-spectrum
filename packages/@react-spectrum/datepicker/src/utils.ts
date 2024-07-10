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
import {createDOMRef} from '@react-spectrum/utils';
import {createFocusManager} from '@react-aria/focus';
import {FocusableRef} from '@react-types/shared';
import {SpectrumDatePickerBase} from '@react-types/datepicker';
import {useDateFormatter, useLocale} from '@react-aria/i18n';
import {useDisplayNames} from '@react-aria/datepicker';
import {useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';
import {useProvider} from '@react-spectrum/provider';

export function useFormatHelpText(props: Pick<SpectrumDatePickerBase<any>, 'description' | 'showFormatHelpText'>) {
  let formatter = useDateFormatter({dateStyle: 'short'});
  let displayNames = useDisplayNames();
  return useMemo(() => {
    if (props.description) {
      return props.description;
    }

    if (props.showFormatHelpText) {
      return formatter.formatToParts(new Date()).map(s => {
        if (s.type === 'literal') {
          return s.value;
        }

        return displayNames.of(s.type);
      }).join(' ');
    }

    return '';
  }, [props.description, props.showFormatHelpText, formatter, displayNames]);
}

export function useVisibleMonths(maxVisibleMonths: number) {
  let {scale} = useProvider();
  let [visibleMonths, setVisibleMonths] = useState(getVisibleMonths(scale));
  useLayoutEffect(() => {
    let onResize = () => setVisibleMonths(getVisibleMonths(scale));
    onResize();

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [scale]);

  return Math.max(1, Math.min(visibleMonths, maxVisibleMonths, 3));
}

function getVisibleMonths(scale) {
  if (typeof window === 'undefined') {
    return 1;
  }
  let monthWidth = scale === 'large' ? 336 : 280;
  let gap = scale === 'large' ? 30 : 24;
  let popoverPadding = scale === 'large' ? 32 : 48;
  return Math.floor((window.innerWidth - popoverPadding * 2) / (monthWidth + gap));
}

export function useFocusManagerRef(ref: FocusableRef<HTMLElement>) {
  let domRef = useRef(undefined);
  useImperativeHandle(ref, () => ({
    ...createDOMRef(domRef),
    focus() {
      createFocusManager(domRef).focusFirst({tabbable: true});
    }
  }));
  return domRef;
}

// Passing in segments because state and state.segments don't always
// cause the useEffect to run when the segments change.
export function useTextWidth(state, segments) {
  let [width, setWidth] = useState('auto');
  let locale = useLocale()?.locale;

  useEffect(() => {
    let totalCharacters = 0;
    if (state && !state.segments) {
      if (state.value?.start && state.value?.end) {
        let {start, end} = state.formatValue(locale, {month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
        // adding characters for the seperator
        totalCharacters = start?.length + end?.length + 3;
      } else {
        let {start, end} = state.formatPlaceholder(locale, {month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'});
        // adding characters for the seperator
        totalCharacters = start?.length + end?.length + 3;
      }
    } else if (state?.segments) {
      totalCharacters = state.segments.reduce((total, segment) => total + (segment.placeholder || segment.text).length, 0);
    }

    // Always need a minimum of 2 characters for extra width.
    // Proporitionally strings need about one exta character for every five
    // characters in a string.
    let newWidth = (totalCharacters + Math.max(Math.floor(totalCharacters / 5), 2)) + 'ch';
    if (width === 'auto' || newWidth !== width) {
      setWidth(newWidth);
    }
  }, [state, segments, width, locale]);

  return width;
}
