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

import cmp from 'semver-compare';
import React from 'react';

/**
 * This is a decorator that converts UNSAFE React lifecycle methods to their pre-React 16.3.0 variant
*/
export default function convertUnsafeMethod(WrappedComponent) {
  const proto = WrappedComponent.prototype;
  const UNSAFE_componentWillUpdate = proto.UNSAFE_componentWillUpdate;
  const UNSAFE_componentWillMount = proto.UNSAFE_componentWillMount;
  const UNSAFE_componentWillReceiveProps = proto.UNSAFE_componentWillReceiveProps;
 
  if (cmp(React.version, '16.3.0') === -1) {
    if (UNSAFE_componentWillUpdate) {
      proto.componentWillUpdate = function (props, state) {
        UNSAFE_componentWillUpdate.apply(this, arguments);
      };

      delete proto.UNSAFE_componentWillUpdate;
    }

    if (UNSAFE_componentWillMount) {
      proto.componentWillMount = function () {
        UNSAFE_componentWillMount.apply(this, arguments);
      };
      
      delete proto.UNSAFE_componentWillMount;
    }

    if (UNSAFE_componentWillReceiveProps) {
      proto.componentWillReceiveProps = function (props) {
        UNSAFE_componentWillReceiveProps.apply(this, arguments);
      };
      
      delete proto.UNSAFE_componentWillReceiveProps;
    }
  }
}
