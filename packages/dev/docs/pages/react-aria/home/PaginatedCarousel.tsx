/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
'use client';

import {Pagination} from './Pagination';
import React, {useRef} from 'react';

export function PaginatedCarousel({children, className, paginationClassName}) {
  let carouselRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={carouselRef} className={className}>
        {children}
      </div>
      <Pagination carouselRef={carouselRef} className={paginationClassName} />
    </>
  );
}

