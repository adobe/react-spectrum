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

import React, {Component} from 'react';

export default class ShellSolutionGroup extends Component {
  static defaultProps = {
    secondary: false
  };

  renderPrimarySolutions(children) {
    const entitledChildren = children.filter(
      child => child.props && child.props.entitled
    );
    const unentitledChildren = children.filter(
      child => child.props && child.props.entitled == null
    );

    return (
      <div className="coral-Shell-solutions-container">
        <div className="coral-Shell-solutions">
          {entitledChildren}
        </div>
        <div className="coral-Shell-solutions">
          {unentitledChildren}
        </div>
      </div>
    );
  }

  renderSecondarySolutions(children) {
    return (
      <div className="coral-Shell-solutions coral-Shell-solutions--secondary">
        {
          React.Children.map(children, child => (
            React.cloneElement(child, {
              target: '_blank'
            })
          ))
        }
      </div>
    );
  }

  render() {
    const {
      secondary,
      children
    } = this.props;

    if (secondary) {
      return this.renderSecondarySolutions(children);
    }
    return this.renderPrimarySolutions(children);
  }
}

ShellSolutionGroup.displayName = 'ShellSolutionGroup';
