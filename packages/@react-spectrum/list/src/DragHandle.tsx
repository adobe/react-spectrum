/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import React from 'react';

export default function DragHandle() {
  return (
    <svg width="16" height="32" viewBox="0 0 16 32">
      <g transform="translate(5.5 10.5)">
        <circle cx="1" cy="1" r="1" transform="translate(0 9)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(0 6)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(0 3)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(3 9)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(3 6)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(3 3)" fill="#6e6e6e" />
        <circle cx="1" cy="1" r="1" transform="translate(3)" fill="#6e6e6e" />
      </g>
    </svg>
  );
}
