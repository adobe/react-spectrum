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
import {Button} from 'tailwind-starter/Button';
import {ChevronLeft, ChevronRight} from 'lucide-react';
import React, {useEffect, useState} from 'react';

export function Pagination({carousel, className}: {carousel: HTMLElement, className?: string}) {
  let scroll = (dir: number) => {
    let style = window.getComputedStyle(carousel);
    carousel.scrollBy({
      left: dir * (carousel.clientWidth - parseInt(style.paddingLeft, 10) - parseInt(style.paddingRight, 10) + parseInt(style.columnGap, 10)),
      behavior: 'smooth'
    });
  };

  let [isPrevDisabled, setPrevDisabled] = useState(true);
  let [isNextDisabled, setNextDisabled] = useState(false);

  useEffect(() => {
    let update = () => {
      setPrevDisabled(carousel.scrollLeft <= 0);
      setNextDisabled(carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth);
    };

    update();

    if ('onscrollend' in document) {
      carousel.addEventListener('scrollend', update);
      return () => carousel.removeEventListener('scrollend', update);
    } else {
      carousel.addEventListener('scroll', update);
      return () => carousel.removeEventListener('scroll', update);
    }
  }, [carousel]);

  return (
    <div className={`flex gap-2 justify-end md:justify-center mt-4 ${className}`}>
      <Button
        variant="secondary"
        className="rounded-full p-2"
        aria-label="Previous Page"
        isDisabled={isPrevDisabled}
        onPress={() => scroll(-1)}>
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button
        variant="secondary"
        className="rounded-full p-2"
        aria-label="Next Page"
        isDisabled={isNextDisabled}
        onPress={() => scroll(1)}>
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
