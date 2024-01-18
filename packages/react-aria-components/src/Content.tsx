/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ContextValue, useContextProps} from './utils';
import React, {createContext, ForwardedRef, forwardRef, HTMLAttributes} from 'react';
import {useShallowRender} from './Collection';

// TODO: need contentContext?
export const ContentContext = createContext<ContextValue<HTMLAttributes<HTMLDivElement>, HTMLDivElement>>({});

// TODO: Delete this
function Content(originalProps: HTMLAttributes<HTMLDivElement>, originalRef: ForwardedRef<HTMLDivElement>) {
  let [props, ref] = useContextProps(originalProps, originalRef, ContentContext);
  let shallow = useShallowRender('content', originalProps, originalRef);
  if (shallow) {
    return shallow;
  }

  return (
    <div className="react-aria-Content" {...props} ref={ref}>
      {props.children}
    </div>
  );
}

const _Content = forwardRef(Content);
export {_Content as Content};
