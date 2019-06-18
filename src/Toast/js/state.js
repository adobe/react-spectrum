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

export const TOAST_CONTAINERS = new Map;
export let TOAST_PLACEMENT = 'top center';

export function setToastPlacement(placement) {
  TOAST_PLACEMENT = placement;

  for (let container of TOAST_CONTAINERS.values()) {
    container.setState({placement});
  }
}
