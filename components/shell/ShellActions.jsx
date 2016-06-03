import React, { Component } from 'react';
import classNames from 'classnames';

import './ShellActions.styl';

export default class ShellHeaderActions extends Component {
  state = {
    openIndex: -1
  }

  handleMenuOpen = (e, index) => {
    this.setState({ openIndex: index });
  }

  handleMenuClose = e => {
    this.setState({ openIndex: -1 });
  }

  render() {
    const {
      className,
      children,
      betaFeedback,
      ...otherProps
    } = this.props;

    const { openIndex } = this.state;

    let index = 0;

    return (
      <div className={ classNames('coral-Shell-header-actions', className) }>
        { betaFeedback }
        <div className="coral-Shell-menubar">
          {
            children &&
            React.Children.map(children, child => {
              if (typeof child === 'object' && child && child.type) { // Is this a react element?
                return React.cloneElement(
                    child,
                    {
                      onOpen: this.handleMenuOpen,
                      onClose: this.handleMenuClose,
                      defaultOpen: index === openIndex,
                      index: index++
                    }
                  );
              } else { // Must be a string
                return child;
              }
            })
          }
        </div>
      </div>
    );
  }
}
