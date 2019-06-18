/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function rAF(func = () => {}) {
  return new Promise(
    resolve => requestAnimationFrame(
      () => {
        func();
        resolve();
      }
    )
  );
}

export function nextEventLoopIteration() {
  return new Promise(resolve => process.nextTick(resolve));
}
