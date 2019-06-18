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

import classNames from 'classnames';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React, {Component} from 'react';

const formatMessage = messageFormatter(intlMessages);

/*
 * An AssetFolder displays a generic folder icon within an Asset component
 */
export default class AssetFolder extends Component {
  render() {
    const {
      alt = formatMessage('Folder'),
      className,
      decorative
    } = this.props;
    return (
      <svg
        viewBox="0 0 32 32"
        className={classNames('spectrum-Asset-folder', className)}
        aria-label={alt}
        aria-hidden={decorative || null}
        role="img">
        <path
          className="spectrum-Asset-folderBackground"
          d="M3,29.5c-1.4,0-2.5-1.1-2.5-2.5V5c0-1.4,1.1-2.5,2.5-2.5h10.1c0.5,0,1,0.2,1.4,0.6l3.1,3.1c0.2,0.2,0.4,0.3,0.7,0.3H29c1.4,0,2.5,1.1,2.5,2.5v18c0,1.4-1.1,2.5-2.5,2.5H3z" />
        <path
          className="spectrum-Asset-folderOutline"
          d="M29,6H18.3c-0.1,0-0.2,0-0.4-0.2l-3.1-3.1C14.4,2.3,13.8,2,13.1,2H3C1.3,2,0,3.3,0,5v22c0,1.6,1.3,3,3,3h26c1.7,0,3-1.4,3-3V9C32,7.3,30.7,6,29,6z M31,27c0,1.1-0.9,2-2,2H3c-1.1,0-2-0.9-2-2V7h28c1.1,0,2,0.9,2,2V27z" />
      </svg>
    );
  }
}
