/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {Button, OverlayArrow, Tooltip, TooltipTrigger} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const TooltipExample = () => (
  <TooltipTrigger>
    <Button>Tooltip trigger</Button>
    <Tooltip
      offset={5}
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 5,
        borderRadius: 4
      }}>
      <OverlayArrow style={{transform: 'translateX(-50%)'}}>
        <svg width="8" height="8" style={{display: 'block'}}>
          <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
        </svg>
      </OverlayArrow>
      I am a tooltip
    </Tooltip>
  </TooltipTrigger>
);

export const TooltipArrowBoundaryOffsetExample = {
  args: {
    topLeft: 25,
    topRight: 25,
    leftTop: 15,
    leftBottom: 15,
    rightTop: 15,
    rightBottom: 15,
    bottomLeft: 25,
    bottomRight: 25
  },
  argTypes: {
    topLeft: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    topRight: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    leftTop: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    leftBotton: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    rightTop: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    rightBottom: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    bottomLeft: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    bottomRight: {
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    }
  },
  render: ({topLeft, topRight, leftTop, leftBottom, rightTop, rightBottom, bottomLeft, bottomRight}: any) => {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Top left</Button>
              <Tooltip
                placement="top left"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={topLeft}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Top left
              </Tooltip>
            </TooltipTrigger>
          </div>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Top right</Button>
              <Tooltip
                placement="top right"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={topRight}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Top right
              </Tooltip>
            </TooltipTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Left top</Button>
              <Tooltip
                placement="left top"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={leftTop}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(-90deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Left top
              </Tooltip>
            </TooltipTrigger>
          </div>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Left bottom</Button>
              <Tooltip
                placement="left bottom"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={leftBottom}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(-90deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Left bottom
              </Tooltip>
            </TooltipTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Right top</Button>
              <Tooltip
                placement="right top"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={rightTop}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(90deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Right top
              </Tooltip>
            </TooltipTrigger>
          </div>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Right bottom</Button>
              <Tooltip
                placement="right bottom"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={rightBottom}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(90deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Right bottom
              </Tooltip>
            </TooltipTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Bottom left</Button>
              <Tooltip
                placement="bottom left"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={bottomLeft}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(180deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Bottom left
              </Tooltip>
            </TooltipTrigger>
          </div>
          <div style={{padding: 12}}>
            <TooltipTrigger isOpen delay={0} closeDelay={0}>
              <Button style={{width: 200, height: 100}}>Bottom right</Button>
              <Tooltip
                placement="bottom right"
                shouldFlip={false}
                offset={7}
                arrowBoundaryOffset={bottomRight}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  borderRadius: 9999
                }}>
                <OverlayArrow>
                  <svg width="8" height="8" style={{display: 'block', transform: 'rotate(180deg)'}}>
                    <path d="M0 0L4 4L8 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                Bottom right
              </Tooltip>
            </TooltipTrigger>
          </div>
        </div>
      </div>
    );
  }
};
