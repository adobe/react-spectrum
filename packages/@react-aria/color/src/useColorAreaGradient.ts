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

import {CSSProperties, useMemo} from 'react';

const generateRGB_R = (orientation, dir: boolean, zValue: number) => {
  let maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  let result = {
    colorAreaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,0),rgb(${zValue},255,0))`
    },
    gradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(${zValue},0,255),rgb(${zValue},255,255))`,
      'WebkitMaskImage': maskImage,
      maskImage
    }
  };
  return result;
};

const generateRGB_G = (orientation, dir: boolean, zValue: number) => {
  let maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  let result = {
    colorAreaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},0),rgb(255,${zValue},0))`
    },
    gradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,${zValue},255),rgb(255,${zValue},255))`,
      'WebkitMaskImage': maskImage,
      maskImage
    }
  };
  return result;
};

const generateRGB_B = (orientation, dir: boolean, zValue: number) => {
  let maskImage = `linear-gradient(to ${orientation[Number(!dir)]}, transparent, #000)`;
  let result = {
    colorAreaStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,0,${zValue}),rgb(255,0,${zValue}))`
    },
    gradientStyles: {
      backgroundImage: `linear-gradient(to ${orientation[Number(dir)]},rgb(0,255,${zValue}),rgb(255,255,${zValue}))`,
      'WebkitMaskImage': maskImage,
      maskImage
    }
  };
  return result;
};


const generateHSL_H = (orientation, dir: boolean, zValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]}, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,50%),hsla(0,0%,50%,0))`,
        `hsl(${zValue}, 100%, 50%)`
      ].join(',')
    }
  };
  return result;
};

const generateHSL_S = (orientation, dir: boolean, alphaValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]}, hsla(0,0%,0%,${alphaValue}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alphaValue}) 100%)`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        'hsl(0, 0%, 50%)'
      ].join(',')
    }
  };
  return result;
};

const generateHSL_L = (orientation, dir: boolean, zValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      backgroundImage: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,${zValue}%),hsla(0,0%,${zValue}%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,100%,${zValue}%),hsl(60,100%,${zValue}%),hsl(120,100%,${zValue}%),hsl(180,100%,${zValue}%),hsl(240,100%,${zValue}%),hsl(300,100%,${zValue}%),hsl(360,100%,${zValue}%))`
      ].join(',')
    }
  };
  return result;
};


const generateHSB_H = (orientation, dir: boolean, zValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(dir)]},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
        `hsl(${zValue}, 100%, 50%)`
      ].join(',')
    }
  };
  return result;
};

const generateHSB_S = (orientation, dir: boolean, alphaValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,0%,${alphaValue}),hsla(0,0%,0%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        `linear-gradient(to ${orientation[Number(!dir)]},hsl(0,0%,0%),hsl(0,0%,100%))`
      ].join(',')
    }
  };
  return result;
};

const generateHSB_B = (orientation, dir: boolean, alphaValue: number) => {
  let result = {
    colorAreaStyles: {},
    gradientStyles: {
      background: [
        `linear-gradient(to ${orientation[Number(!dir)]},hsla(0,0%,100%,${alphaValue}),hsla(0,0%,100%,0))`,
        `linear-gradient(to ${orientation[Number(dir)]},hsla(0,100%,50%,${alphaValue}),hsla(60,100%,50%,${alphaValue}),hsla(120,100%,50%,${alphaValue}),hsla(180,100%,50%,${alphaValue}),hsla(240,100%,50%,${alphaValue}),hsla(300,100%,50%,${alphaValue}),hsla(359,100%,50%,${alphaValue}))`,
        '#000'
      ].join(',')
    }
  };
  return result;
};


interface Gradients {
  colorAreaStyleProps: {
    style: CSSProperties
  },
  gradientStyleProps: {
    style: CSSProperties
  },
  thumbStyleProps: {
    style: CSSProperties
  }
}

export function useColorAreaGradient({direction, state, zChannel, xChannel, isDisabled}): Gradients {
  let returnVal = useMemo<Gradients>(() => {
    let orientation = ['top', direction === 'rtl' ? 'left' : 'right'];
    let dir = false;
    let background = {colorAreaStyles: {}, gradientStyles: {}};
    let zValue = state.value.getChannelValue(zChannel);
    let {minValue: zMin, maxValue: zMax} = state.value.getChannelRange(zChannel);
    let alphaValue = (zValue - zMin) / (zMax - zMin);
    let isHSL = state.value.getColorSpace() === 'hsl';
    if (!isDisabled) {
      switch (zChannel) {
        case 'red': {
          dir = xChannel === 'green';
          background = generateRGB_R(orientation, dir, zValue);
          break;
        }
        case 'green': {
          dir = xChannel === 'red';
          background = generateRGB_G(orientation, dir, zValue);
          break;
        }
        case 'blue': {
          dir = xChannel === 'red';
          background = generateRGB_B(orientation, dir, zValue);
          break;
        }
        case 'hue': {
          dir = xChannel !== 'saturation';
          if (isHSL) {
            background = generateHSL_H(orientation, dir, zValue);
          } else {
            background = generateHSB_H(orientation, dir, zValue);
          }
          break;
        }
        case 'saturation': {
          dir = xChannel === 'hue';
          if (isHSL) {
            background = generateHSL_S(orientation, dir, alphaValue);
          } else {
            background = generateHSB_S(orientation, dir, alphaValue);
          }
          break;
        }
        case 'brightness': {
          dir = xChannel === 'hue';
          background = generateHSB_B(orientation, dir, alphaValue);
          break;
        }
        case 'lightness': {
          dir = xChannel === 'hue';
          background = generateHSL_L(orientation, dir, zValue);
          break;
        }
      }
    }

    let {x, y} = state.getThumbPosition();

    if (direction === 'rtl') {
      x = 1 - x;
    }

    return {
      colorAreaStyleProps: {
        style: {
          position: 'relative',
          touchAction: 'none',
          ...background.colorAreaStyles
        }
      },
      gradientStyleProps: {
        style: {
          touchAction: 'none',
          ...background.gradientStyles
        }
      },
      thumbStyleProps: {
        style: {
          position: 'absolute',
          left: `${x * 100}%`,
          top: `${y * 100}%`,
          transform: 'translate(0%, 0%)',
          touchAction: 'none'
        }
      }
    };
  }, [direction, state, zChannel, xChannel, isDisabled]);

  return returnVal;
}

