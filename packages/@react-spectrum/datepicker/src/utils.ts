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
import {SpectrumDatePickerBase} from '@react-types/datepicker';
import {useDateFormatter} from '@react-aria/i18n';
import {useDisplayNames} from '@react-aria/datepicker';
import {useLayoutEffect} from '@react-aria/utils';
import {useMemo, useState} from 'react';
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
  let monthWidth = scale === 'large' ? 336 : 280;
  let gap = scale === 'large' ? 30 : 24;
  let popoverPadding = scale === 'large' ? 32 : 48;
  return Math.floor((window.innerWidth - popoverPadding * 2) / (monthWidth + gap));
}
