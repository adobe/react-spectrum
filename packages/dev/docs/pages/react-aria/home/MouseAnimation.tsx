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
import {animate, useIntersectionObserver} from './utils';
import {Button} from 'tailwind-starter/Button';
import {ButtonContext, Key, TooltipTrigger} from 'react-aria-components';
import {CogIcon, PencilIcon, ShareIcon} from 'lucide-react';
import React, {useCallback, useRef, useState} from 'react';
import {Tooltip} from 'tailwind-starter/Tooltip';

export function MouseAnimation() {
  let ref = useRef<HTMLDivElement>(null);
  let [tooltip, setTooltip] = useState<Key | null>(null);
  let [hovered, setHovered] = useState<Key | null>(null);
  let [isPressed, setPressed] = useState(false);
  let isAnimating = useRef(false);
  let mouseRef = useRef<SVGSVGElement>(null);
  useIntersectionObserver(ref, useCallback(() => {
    isAnimating.current = true;
    let cancel = animate([
      {
        time: 500,
        perform() {}
      },
      {
        time: 700,
        perform() {
          mouseRef.current!.animate({
            transform: [
              'translate(-50px, 150px)',
              'translate(10px, 10px)'
            ]
          }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 1700,
        perform() {
          setHovered('edit');
        }
      },
      {
        time: 800,
        perform() {
          setTooltip('edit');
        }
      },
      {
        time: 700,
        perform() {
          mouseRef.current!.animate({
            transform: [
              'translate(10px, 10px)',
              'translate(110px, 14px)'
            ]
          }, {duration: 2000, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 600,
        perform() {
          setHovered('share');
          setTooltip('share');
        }
      },
      {
        time: 1500,
        perform() {
          setHovered('settings');
          setTooltip('settings');
        }
      },
      {
        time: 300,
        perform() {
          setPressed(true);
          setTooltip(null);
        }
      },
      {
        time: 1000,
        perform() {
          setPressed(false);
        }
      },
      {
        time: 400,
        perform() {
          mouseRef.current!.animate({
            transform: [
              'translate(110px, 14px)',
              'translate(170px, 150px)'
            ]
          }, {duration: 1500, fill: 'forwards', easing: 'ease-in-out'});
        }
      },
      {
        time: 1100,
        perform() {
          setHovered(null);
        }
      },
      {
        time: 0,
        perform() {
          isAnimating.current = false;
        }
      }
    ]);

    return () => {
      cancel();
      setTooltip(null);
      setHovered(null);
      setPressed(false);
      mouseRef.current!.getAnimations().forEach(a => a.cancel());
      isAnimating.current = false;
    };
  }, []));

  let onOpenChange = (tooltip: string, isOpen: boolean) => {
    if (!isAnimating.current) {
      setTooltip(isOpen ? tooltip : null);
    }
  };

  return (
    <div className="flex gap-2" ref={ref}>
      <svg
        ref={mouseRef}
        viewBox="0 0 12 19"
        width={12}
        height={19}
        aria-hidden="true"
        className="absolute z-10"
        style={{filter: 'drop-shadow(0 1px 1px #aaa)', transform: 'translate(-50px, 130px)'}}>
        <g transform="matrix(1, 0, 0, 1, -150, -63.406998)">
          <path d="M150 79.422V63.407l11.591 11.619h-6.781l-.411.124Z" fill="#fff" fillRule="evenodd" />
          <path d="m159.084 80.1-3.6 1.535-4.684-11.093 3.686-1.553Z" fill="#fff" fillRule="evenodd" />
          <path d="m157.751 79.416-1.844.774-3.1-7.374 1.841-.775Z" fillRule="evenodd" />
          <path d="M151 65.814V77l2.969-2.866.431-.134h4.768Z" fillRule="evenodd" />
        </g>
      </svg>
      <TooltipTrigger isOpen={tooltip === 'edit'} onOpenChange={(o) => onOpenChange('edit', o)}>
        <Button aria-label="Edit" variant="secondary" className={`w-9 h-9 p-0 relative ${hovered === 'edit' ? 'bg-gray-200 dark:bg-zinc-500' : ''}`}>
          <PencilIcon aria-hidden className="inline w-5 h-5" />
        </Button>
        <Tooltip>Edit</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger isOpen={tooltip === 'share'} onOpenChange={(o) => onOpenChange('share', o)}>
        <Button aria-label="Share" variant="secondary" className={`w-9 h-9 p-0 relative ${hovered === 'share' ? 'bg-gray-200 dark:bg-zinc-500' : ''}`}>
          <ShareIcon aria-hidden className="inline w-5 h-5" />
        </Button>
        <Tooltip>Share</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger isOpen={tooltip === 'settings'} onOpenChange={(o) => onOpenChange('settings', o)}>
        <ButtonContext.Provider value={{isPressed}}>
          <Button aria-label="Settings" variant="secondary" className={`w-9 h-9 p-0 relative ${hovered === 'settings' ? 'bg-gray-200 dark:bg-zinc-500' : ''}`}>
            <CogIcon aria-hidden className="inline w-5 h-5" />
          </Button>
        </ButtonContext.Provider>
        <Tooltip>Settings</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
