import React, { Component } from 'react';
import classNames from 'classnames';
import TetherComponent from 'react-tether';

import DialogHeader from './internal/DialogHeader';
import DialogFooter from './internal/DialogFooter';
import DialogContent from './internal/DialogContent';
import DialogBackdrop from './internal/DialogBackdrop';

class Dialog extends Component {
  static defaultProps = {
    open: false,
    closable: false,
    fullscreen: false,
    variant: 'default', // default, error, warning, success, info, help
    onClose: () => {}
  };

  componentDidMount() {
    window.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = e => {
    const { onClose, open } = this.props;

    if (open) {
      switch (e.which) {
        case 27: // escape
          onClose(e);
          break;
        default:
          // do nothing
      }
    }
  }

  render() {
    const {
      fullscreen,
      backdrop,
      onClose,
      open,
      variant,
      closable,
      className,
      children,
      ...otherProps
    } = this.props;

    let RootEl = fullscreen ? 'div' : TetherComponent;

    const rootProps = {
      style: {
        zIndex: open ? 10020 : 10010,
        display: open ? 'block' : 'none'
      }
    };

    // If we're not full screen we need to supply TetherComponent with the props it needs.
    if (!fullscreen) {
      rootProps.attachment = 'middle center';
      rootProps.targetAttachment = 'middle center';
      rootProps.target = document.body;
      rootProps.targetModifier = 'visible';
    }

    return (
      <RootEl { ...rootProps }>
        {
          !fullscreen &&
          <DialogBackdrop open={ open } backdrop={ backdrop } onClose={ onClose } />
        }
        <div
          className={
            classNames(
              'coral-Dialog',
              `coral-Dialog--${ variant }`,
              {
                'coral-Dialog--closable': closable,
                'coral-Dialog--fullscreen': fullscreen,
                'is-open': open
              },
              className
            )
          }
          style={ {
            display: open ? 'block' : 'none',
            zIndex: open ? 10020 : 10010,
            position: fullscreen ? null : 'static'
          } }
          { ...otherProps }
        >
          <div className="coral-Dialog-wrapper">
            {
              React.Children.map(children, child => (
                // Pass each child some extra props. Each child can decide to use them or not.
                React.cloneElement(child, {
                  variant,
                  closable,
                  onClose
                })
              ))
            }
          </div>
        </div>
      </RootEl>
    );
  }
}

Dialog.Header = DialogHeader;
Dialog.Footer = DialogFooter;
Dialog.Content = DialogContent;
export default Dialog;
