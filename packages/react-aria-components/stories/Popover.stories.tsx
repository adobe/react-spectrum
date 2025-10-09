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
import {Meta, StoryFn, StoryObj} from '@storybook/react';
import React, {JSX, useEffect, useRef, useState} from 'react';
import styles from './styles.css';

export default {
  title: 'React Aria Components/Popover',
  component: Popover,
  args: {
    placement: 'bottom start',
    hideArrow: false
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom', 'bottom left', 'bottom right', 'bottom start', 'bottom end',
        'top', 'top left', 'top right', 'top start', 'top end',
        'left', 'left top', 'left bottom', 'start', 'start top', 'start bottom',
        'right', 'right top', 'right bottom', 'end', 'end top', 'end bottom'
      ]
    },
    animation: {
      control: 'radio',
      options: ['transition', 'animation', 'animation-delayed']
    }
  }
} as Meta<typeof Popover>;

export type PopoverStory = StoryFn<typeof Popover>;

export const PopoverExample: PopoverStory = (args) => (
  <DialogTrigger>
    <Button>Open popover</Button>
    <Popover
      {...args}
      className={`${styles['popover-base']} ${styles[(args as any).animation]}`}
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        padding: 30,
        zIndex: 5
      }}>
      {!(args as any).hideArrow && <OverlayArrow style={{display: 'flex'}}>
        <svg width="12" height="12" viewBox="0 0 12 12" style={{display: 'block'}}>
          <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
        </svg>
      </OverlayArrow>}
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


const COUNTDOWN = 5000;

function PopoverTriggerObserver(): JSX.Element {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN);

  useEffect(() => {
    if (countdown > 0) {
      const intervalId = setInterval(() => {
        setCountdown(countdown - 1000);
      }, 1000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [countdown]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.style.width = '200px';
        buttonRef.current.style.height = '50px';
      }
    }, COUNTDOWN + 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div style={{marginBottom: 100, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div>
        <p>The trigger button below will change size in <strong>{Math.floor(countdown / 1000)}s</strong></p>
      </div>
      <DialogTrigger defaultOpen>
        <Button ref={buttonRef}>Open popover</Button>
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
    </div>
  );
}


export const PopoverTriggerObserverExample: StoryObj<typeof PopoverTriggerObserver> = {
  render: () => <PopoverTriggerObserver />
};

function PopoverArrowBoundaryOffsetExampleRender({topLeft, topRight, leftTop, leftBottom, rightTop, rightBottom, bottomLeft, bottomRight}:
  {topLeft: number, topRight: number, leftTop: number, leftBottom: number, rightTop: number, rightBottom: number, bottomLeft: number, bottomRight: number}): JSX.Element {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex'}}>
        <div style={{padding: 12}}>
          <DialogTrigger>
            <Button style={{width: 200, height: 100}}>Top left</Button>
            <Popover
              placement="top left"
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
              arrowBoundaryOffset={leftBottom}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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
              shouldFlip={false}
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
                  <path d="M0 0L6 6L12 0" fill="white" strokeWidth={1} stroke="gray" />
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

export const PopoverArrowBoundaryOffsetExample: StoryObj<typeof PopoverArrowBoundaryOffsetExampleRender> = {
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
    leftBottom: {
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
  render: (args) => <PopoverArrowBoundaryOffsetExampleRender {...args} />
};

export const PopoverTriggerWidthExample: PopoverStory = () => (
  <DialogTrigger>
    <Button>Open popover</Button>
    <Popover
      placement="bottom start"
      style={{
        background: 'Canvas',
        color: 'CanvasText',
        border: '1px solid gray',
        zIndex: 5,
        width: 'var(--trigger-width)'
      }}>
      <Dialog>
        Should match the width of the trigger button
      </Dialog>
    </Popover>
  </DialogTrigger>
);

function ScrollingBoundaryContainerExample(args) {
  let [boundaryElem, setBoundaryElem] = useState<HTMLDivElement | null>(null);
  return (
    <div id="scrolling-boundary" ref={setBoundaryElem} style={{height: 300, width: 300, overflow: 'auto', border: '1px solid light-dark(black, white)'}}>
      <div style={{width: 600, height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <DialogTrigger>
          <Button style={{width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Open popover</Button>
          <Popover
            {...args}
            boundaryElement={boundaryElem ?? undefined}
            style={{
              background: 'Canvas',
              color: 'CanvasText',
              border: '1px solid gray',
              zIndex: 5
            }}>
            <Dialog>
              This is some dummy content for the popover
            </Dialog>
          </Popover>
        </DialogTrigger>
      </div>
    </div>
  );
}

export const ScrollingBoundaryContainer: StoryObj<typeof ScrollingBoundaryContainerExample> = {
  render: (args) => <ScrollingBoundaryContainerExample {...args} />,
  args: {
    containerPadding: 0,
    placement: 'bottom'
  },
  argTypes: {
    containerPadding: {
      control: {
        type: 'range',
        min: 0,
        max: 100
      }
    },
    hideArrow: {
      table: {
        disable: true
      }
    },
    animation: {
      table: {
        disable: true
      }
    }
  }
};
