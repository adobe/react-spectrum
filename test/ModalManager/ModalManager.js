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

import assert from 'assert';
import ModalManager from '../../src/ModalContainer/js/ModalManager';
import React from 'react';

describe('ModalManager', () => {
  let manager;
  let overflowStyle = getComputedStyle(document.body).overflow;

  beforeEach(() => {
    manager = new ModalManager({handleContainerOverflow: false});
  });

  afterEach(() => {
    document.body.style.overflow = overflowStyle;
  });

  it('should not change body overflow style for things like tooltips', () => {
    let modal = 'modal';
    let isOverlay = true;
    manager.hideBodyOverflow(modal, isOverlay);
    assert.equal(getComputedStyle(document.body).overflow, overflowStyle);
    manager.resetBodyOverflow(modal);
    assert.equal(getComputedStyle(document.body).overflow, overflowStyle);
  });

  it('should hide body overflow when showing dialogs', () => {
    let modal = 'modal';
    let isOverlay = false;
    manager.hideBodyOverflow(modal, isOverlay);
    assert.equal(manager.overflowMap.get(modal), '');
    assert.equal(getComputedStyle(document.body).overflow, 'hidden');
    manager.resetBodyOverflow(modal);
    assert.equal(getComputedStyle(document.body).overflow, overflowStyle);
  });

  it('remembers the previous overflow setting', () => {
    document.body.style.overflow = 'scroll';
    let modal = 'modal';
    let isOverlay = false;
    manager.hideBodyOverflow(modal, isOverlay);
    assert.equal(getComputedStyle(document.body).overflow, 'hidden');
    manager.resetBodyOverflow(modal);
    assert.equal(getComputedStyle(document.body).overflow, 'scroll');
  });
});
