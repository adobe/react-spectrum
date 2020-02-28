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

import React, {useContext} from 'react';

export let SlotContext = React.createContext(null);

export function useSlotProvider() {
  return useContext(SlotContext) || {};
}

export function ClearSlots(props) {
  let {children, ...otherProps} = props;
  let content = children;
  if (React.Children.toArray(children).length <= 1) {
    if (typeof children === 'function') { // need to know if the node is a string or something else that react can render that doesn't get props
      content = React.cloneElement(React.Children.only(children), otherProps);
    }
  }
  return (
    <SlotContext.Provider value={{}}>
      {content}
    </SlotContext.Provider>
  );
}
