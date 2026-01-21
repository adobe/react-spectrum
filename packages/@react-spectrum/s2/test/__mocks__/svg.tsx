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

import React, {forwardRef, SVGProps} from 'react';

const MockSvgIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(function MockSvgIcon(props, ref) {
  return (
    <svg
      ref={ref}
      role="img"
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...props}>
      <rect width="20" height="20" fill="currentColor" />
    </svg>
  );
});

export default MockSvgIcon;
