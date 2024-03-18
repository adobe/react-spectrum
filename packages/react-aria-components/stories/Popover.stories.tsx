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

import {Button, Dialog, DialogTrigger, Heading, OverlayArrow, Popover} from 'react-aria-components';
import React from 'react';

export default {
  title: 'React Aria Components'
};

export const PopoverExample = () => (
  <DialogTrigger>
    <Button>Open popover</Button>
    <Popover
      placement="bottom start"
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 30,
        zIndex: 5
      }}>
      <Dialog>
        {({close}) => (
          <form style={{display: 'flex', flexDirection: 'column'}}>
            <Heading slot="title">Sign up</Heading>
            <label>
              First Name: <input placeholder="John" />
            </label>
            <label>
              Last Name: <input placeholder="Smith" />
            </label>
            <Button onPress={close} style={{marginTop: 10}}>
              Submit
            </Button>
          </form>
        )}
      </Dialog>
    </Popover>
  </DialogTrigger>
);

export const PopoverArrowBoundaryOffsetExample = {
  argTypes: {
    topLeft: {
      defaultValue: 25,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    topRight: {
      defaultValue: 25,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    leftTop: {
      defaultValue: 15,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    leftBotton: {
      defaultValue: 15,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    rightTop: {
      defaultValue: 15,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    rightBottom: {
      defaultValue: 15,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    bottomLeft: {
      defaultValue: 25,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    },
    bottomRight: {
      defaultValue: 25,
      control: {
        type: 'range',
        min: -100,
        max: 100
      }
    }
  }, 
  render: ({topLeft, topRight, leftTop, leftBotton, rightTop, rightBottom, bottomLeft, bottomRight}: any) => {
    return (
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Top left</Button>
              <Popover
                placement="top left"
                arrowBoundaryOffset={topLeft}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Top left</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Top right</Button>
              <Popover
                placement="top right"
                arrowBoundaryOffset={topRight}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Top right</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Left top</Button>
              <Popover
                placement="left top"
                arrowBoundaryOffset={leftTop}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(-90deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Left top</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Left bottom</Button>
              <Popover
                placement="left bottom"
                arrowBoundaryOffset={leftBotton}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(-90deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Left bottom</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Right top</Button>
              <Popover
                placement="right top"
                arrowBoundaryOffset={rightTop}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(90deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Right top</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Right bottom</Button>
              <Popover
                placement="right bottom"
                arrowBoundaryOffset={rightBottom}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(90deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Right bottom</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Bottom left</Button>
              <Popover
                placement="bottom left"
                arrowBoundaryOffset={bottomLeft}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(180deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Bottom left</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
          <div style={{padding: 12}}>
            <DialogTrigger>
              <Button style={{width: 200, height: 100}}>Bottom right</Button>
              <Popover
                placement="bottom right"
                arrowBoundaryOffset={bottomRight}
                style={{
                  background: 'Canvas',
                  color: 'CanvasText',
                  border: '1px solid gray',
                  padding: 8,
                  zIndex: 5,
                  borderRadius: '30px'
                }}>
                <OverlayArrow style={{display: 'flex'}}>
                  <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block', transform: 'rotate(180deg)'}}>
                    <path d="M0 0,L6 6,L12 0" fill="white" strokeWidth={1} stroke="gray" />
                  </svg>
                </OverlayArrow>
                <Dialog style={{outline: 'none'}}>
                  <div>Bottom right</div>
                </Dialog>
              </Popover>
            </DialogTrigger>
          </div>
        </div>
      </div>
    );
  }
};
