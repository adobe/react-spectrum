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
 
import {Disclosure, DisclosurePanel, DisclosureProps, DisclosureTitle} from './Disclosure';
import React, {forwardRef} from 'react';
import {useDOMRef} from './useDOMRef';

export interface MessageSourceProps extends Omit<DisclosureProps, 'isQuiet'> {
  label: string
};


/**
 * Message sources display references associated with a system message. Associating the source to the output builds trust and transparency in the conversation.
 * 
 */
export const MessageSource = forwardRef(function MessageSource(
  props: MessageSourceProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {size = 'M', density = 'regular', label, UNSAFE_style, UNSAFE_className = ''} = props;
  let domRef = useDOMRef(ref);

  return (
    <Disclosure
      {...props}
      ref={domRef}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}
      isQuiet>
      {/* we can do this if we don't plan to allow extra stuff like buttons and icons inside the message source. otherwise, might be good to do what we did in S2 Disclosure and have users render their own DisclosureTitle/DisclosureHeader */}
      {/* will note that this matches more closely with how swc has chosen to implement it */}
      <DisclosureTitle>{label}</DisclosureTitle>
      {/* this is where SourceList would go */}
      {props.children}
    </Disclosure>
  );
});


/**
 * Something about the source list blah blah blah 
 */
export const SourceList = forwardRef(function SourceList(
  props: DisclosurePanelProps,
  ref: DOMRef<HTMLDivElement>
) {
  let {UNSAFE_style, UNSAFE_className = '', ...otherProps} = props;
  const domProps = filterDOMProps(otherProps);
  let {size} = useSlottedContext(DisclosureContext)!;
  let panelRef = useDOMRef(ref);
  return (
    <DisclosurePanel
      {...domProps}
      ref={panelRef}
      UNSAFE_style={UNSAFE_style}
      UNSAFE_className={UNSAFE_className}>
      {props.children}
    </DisclosurePanel>
  );
});




// do we want to automatically number the SourceListItem? (this is what swc does)
// based on danni's comment in the ticket, the numbered decorators should be exported (it's giving NotifcationBadge)
// should the number decorators be internationalized? probably
