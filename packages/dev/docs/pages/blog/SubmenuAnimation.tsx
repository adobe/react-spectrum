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
import {animate} from '../react-aria/home/utils';
import React, {useEffect, useRef, useState} from 'react';
import {useResizeObserver} from '@react-aria/utils';

export function SubmenuAnimation() {
  let ref = useRef<HTMLDivElement>(null);
  let [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  let [hovered, setHovered] = useState('Option 1');
  let isAnimating = useRef(false);
  let mouseRef = useRef<SVGSVGElement>(null);
  let [mouseWidth, setMouseWidth] = useState(12);
  let option1Ref = useRef<SVGTextElement>(null);
  let option2Ref = useRef<SVGTextElement>(null);
  let submenuOptionRef = useRef<SVGTextElement>(null);

  let updateWidth = () => {
    if (ref.current) {
      setMouseWidth(Math.min(12, (window.innerWidth / 768) * 12));
    }
  };

  useResizeObserver({ref: ref, onResize: updateWidth});

  useEffect(() => {
    let startAnimation = () => {
      let cancel = animate([
        {
          time: 500,
          perform() {
            setTimeout(() => {
              setHovered('Option 1');
            }, 500);
          }
        },
        {
          time: 700,
          perform() {
            let option1Rect = option1Ref.current!.getBoundingClientRect();
            let option2Rect = option2Ref.current!.getBoundingClientRect();
            let x = option1Rect.left + option1Rect.width / 2 - ref.current!.getBoundingClientRect().left;
            let y = option1Rect.top + option1Rect.height / 2 - ref.current!.getBoundingClientRect().top;
            let y_target = option2Rect.top + option2Rect.height / 2 - ref.current!.getBoundingClientRect().top;
            mouseRef.current!.animate({
              transform: [
                `translate(${x}px, ${y}px)`,
                `translate(${x}px, ${y_target}px)`
              ]
            }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
            setTimeout(() => {
              setHovered('Option 2');
              setIsSubmenuOpen(true);
            }, 350);
          }
        },
        {
          time: 700,
          perform() {}
        },
        {
          time: 700,
          perform() {
            let option1Rect = option1Ref.current!.getBoundingClientRect();
            let option2Rect = option2Ref.current!.getBoundingClientRect();
            let submenuOptionRect = submenuOptionRef.current!.getBoundingClientRect();
            let x = option1Rect.left + option1Rect.width / 2 - ref.current!.getBoundingClientRect().left;
            let y = option2Rect.top + option2Rect.height / 2 - ref.current!.getBoundingClientRect().top;
            let x_target = submenuOptionRect.left + submenuOptionRect.width / 2 - ref.current!.getBoundingClientRect().left;
            let y_target = submenuOptionRect.top + submenuOptionRect.height / 2 - ref.current!.getBoundingClientRect().top;
            mouseRef.current!.animate({
              transform: [
                `translate(${x}px, ${y}px)`,
                `translate(${x_target}px, ${y_target}px)`
              ]
            }, {duration: 1000, fill: 'forwards', easing: 'ease-in-out'});
            setTimeout(() => {
              setHovered('Option 3');
              setIsSubmenuOpen(false);
            }, 350);
          }
        },
        {
          time: 700,
          perform() {}
        }
      ]);

      return () => {
        cancel();
        setIsSubmenuOpen(false);
        setHovered('Option 1');
        mouseRef.current!.getAnimations().forEach(a => a.cancel());
        isAnimating.current = false;
      };
    };

    startAnimation();

    let interval = setInterval(startAnimation, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={ref} role="img" aria-label="Animation showing a submenu closing when the cursor leaves the trigger item to go to the submenu">
      <svg
        ref={mouseRef}
        viewBox="0 0 12 19"
        width={mouseWidth}
        height={19}
        aria-hidden="true"
        style={{position: 'absolute', filter: 'drop-shadow(0 1px 1px #aaa)', transform: 'translate(-1000px, -1000px)'}}>
        <g transform="matrix(1, 0, 0, 1, -150, -63.406998)">
          <path d="M150 79.422V63.407l11.591 11.619h-6.781l-.411.124Z" fill="#fff" fillRule="evenodd" />
          <path d="m159.084 80.1-3.6 1.535-4.684-11.093 3.686-1.553Z" fill="#fff" fillRule="evenodd" />
          <path d="m157.751 79.416-1.844.774-3.1-7.374 1.841-.775Z" fillRule="evenodd" />
          <path d="M151 65.814V77l2.969-2.866.431-.134h4.768Z" fillRule="evenodd" />
        </g>
      </svg>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={761}
        height={321}
        style={{
          maxHeight: 321,
          background: 'var(--spectrum-global-color-gray-100)',
          width: '100%'
        }}
        viewBox="0 0 770 321">
        <defs>
          <filter
            id="b"
            width={226}
            height={156}
            x={271}
            y={57}
            filterUnits="userSpaceOnUse">
            <feOffset dy={1} />
            <feGaussianBlur result="blur" stdDeviation={2} />
            <feFlood floodOpacity={0.149} />
            <feComposite in2="blur" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
          <filter
            id="c"
            width={226}
            height={206}
            x={477}
            y={105}
            filterUnits="userSpaceOnUse">
            <feOffset dy={1} />
            <feGaussianBlur result="blur-2" stdDeviation={2} />
            <feFlood floodOpacity={0.149} />
            <feComposite in2="blur-2" operator="in" />
            <feComposite in="SourceGraphic" />
          </filter>
          <clipPath id="a">
            <path d="M0 0h761v321H0z" />
          </clipPath>
        </defs>
        <g clipPath="url(#a)" data-name="Menu trigger anatomy \u2013 2">
          <g filter="url(#b)">
            <g
              fill="var(--anatomy-gray-50)"
              stroke="var(--anatomy-gray-400)"
              strokeWidth={1.5}
              data-name="rectangle-12"
              transform="translate(277 62)">
              <rect width={214} height={144} stroke="none" rx={6} />
              <rect
                width={212.5}
                height={142.5}
                x={0.75}
                y={0.75}
                fill="none"
                rx={5.25} />
            </g>
          </g>
          <g data-name="Action button">
            <g fill="var(--anatomy-gray-75)" stroke="var(--anatomy-gray-400)" transform="translate(277 22)">
              <rect width={124} height={32} stroke="none" rx={4} />
              <rect width={123} height={31} x={0.5} y={0.5} fill="none" rx={3.5} />
            </g>
            <g fill="var(--anatomy-gray-800)" transform="translate(277 22)">
              <circle
                cx={1.7}
                cy={1.7}
                r={1.7}
                data-name="Ellipse 387"
                transform="translate(17.2 14.4)" />
              <circle
                cx={1.7}
                cy={1.7}
                r={1.7}
                data-name="Ellipse 388"
                transform="translate(23.05 14.4)" />
              <circle
                cx={1.7}
                cy={1.7}
                r={1.7}
                data-name="Ellipse 389"
                transform="translate(11.35 14.4)" />
            </g>
            <text
              fill="var(--anatomy-gray-800)"
              fontFamily="Adobe-Clean"
              fontSize={14}
              transform="translate(313 42)">
              <tspan x={0} y={0}>
                {'More Actions'}
              </tspan>
            </text>
          </g>
          <text
            fill="var(--anatomy-gray-800)"
            data-name="Option 3"
            fontFamily="Adobe-Clean"
            fontSize={20}
            transform="translate(296 190)">
            <tspan x={0} y={0}>
              {'Option 3'}
            </tspan>
          </text>
          <text
            ref={option2Ref}
            fill="var(--anatomy-gray-800)"
            data-name="Option 2"
            fontFamily="Adobe-Clean"
            fontSize={20}
            transform="translate(296 142)">
            <tspan x={0} y={0}>
              {'Option 2'}
            </tspan>
          </text>
          <text
            ref={option1Ref}
            fill="var(--anatomy-gray-800)"
            data-name="Option 1"
            fontFamily="Adobe-Clean"
            fontSize={20}
            transform="translate(296 94)">
            <tspan x={0} y={0}>
              {'Option 1'}
            </tspan>
          </text>
          {hovered === 'Option 1' && (
            <g
              fill="var(--anatomy-gray-600)"
              stroke="rgba(0,0,0,0)"
              data-name="Hovered Option 1"
              opacity={0.081}>
              <path
                stroke="none"
                d="M284 62h200a6 6 0 0 1 6 6v42H278V68a6 6 0 0 1 6-6Z" />
              <path
                fill="none"
                d="M284 62.5h200a5.5 5.5 0 0 1 5.5 5.5v41.5h-211V68a5.5 5.5 0 0 1 5.5-5.5Z" />
            </g>
          )}
          {hovered === 'Option 2' && (
            <g fill="var(--anatomy-gray-600)" data-name="Hovered Option 2" opacity={0.079}>
              <path d="M278 110h212v48H278Z" />
              <path
                fill="rgba(0,0,0,0)"
                d="M279 111v46h210v-46H279m-1-1h212v48H278v-48Z" />
            </g>
          )}
          {hovered === 'Option 3' && (
            <g
              fill="var(--anatomy-gray-600)"
              stroke="rgba(0,0,0,0)"
              data-name="Hovered Option 3"
              opacity={0.081}>
              <path
                stroke="none"
                d="M484 206H284a6 6 0 0 1-6-6v-42h212v42a6 6 0 0 1-6 6Z" />
              <path
                fill="none"
                d="M484 205.5H284a5.5 5.5 0 0 1-5.5-5.5v-41.5h211V200a5.5 5.5 0 0 1-5.5 5.5Z" />
            </g>
          )}
          {isSubmenuOpen && (
            <>
              <g filter="url(#c)">
                <g
                  fill="var(--anatomy-gray-50)"
                  stroke="var(--anatomy-gray-400)"
                  strokeWidth={1.5}
                  data-name="Submenu"
                  transform="translate(483 110)">
                  <rect width={214} height={194} stroke="none" rx={6} />
                  <rect
                    width={212.5}
                    height={192.5}
                    x={0.75}
                    y={0.75}
                    fill="none"
                    rx={5.25} />
                </g>
              </g>
              <text
                ref={submenuOptionRef}
                fill="var(--anatomy-gray-800)"
                data-name="Submenu Option 3"
                fontFamily="Adobe-Clean"
                fontSize={20}
                transform="translate(502 238)">
                <tspan x={0} y={0}>
                  {'Submenu Option 3'}
                </tspan>
              </text>
              <text
                fill="var(--anatomy-gray-800)"
                data-name="Submenu Option 4"
                fontFamily="Adobe-Clean"
                fontSize={20}
                transform="translate(502 286)">
                <tspan x={0} y={0}>
                  {'Submenu Option 4'}
                </tspan>
              </text>
              <text
                fill="var(--anatomy-gray-800)"
                data-name="Submenu Option 2"
                fontFamily="Adobe-Clean"
                fontSize={20}
                transform="translate(501 190)">
                <tspan x={0} y={0}>
                  {'Submenu Option 2'}
                </tspan>
              </text>
              <text
                fill="var(--anatomy-gray-800)"
                data-name="Submenu Option 1"
                fontFamily="Adobe-Clean"
                fontSize={20}
                transform="translate(502 142)">
                <tspan x={0} y={0}>
                  {'Submenu Option 1'}
                </tspan>
              </text>
            </>
          )}
          <path
            fill="var(--anatomy-gray-800)"
            d="M469.587 140.449a1.026 1.026 0 0 1-.947-.6.922.922 0 0 1 .228-1.047l4.09-3.8-4.09-3.8a.923.923 0 0 1-.01-1.364 1.07 1.07 0 0 1 1.448-.008l4.832 4.485a.924.924 0 0 1 0 1.371l-4.832 4.485a1.054 1.054 0 0 1-.719.278Z"
            data-name="Option 2 arrow" />
        </g>
      </svg>
    </div>
  );
}
