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

export default class Timer {

  constructor(callback, delay) {
    this.callback = callback;
    this.remaining = delay;
    this.resume();
  }

  pause() {
    window.clearTimeout(this.timerId);
    this.remaining -= new Date() - this.start;
  }

  resume() {
    this.start = new Date();
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }
    this.timerId = window.setTimeout(this.callback, this.remaining);
  }
}
