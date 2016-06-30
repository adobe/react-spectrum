import React, { Component } from 'react';

export default class ShellSolutionGroup extends Component {
  static defaultProps = {
    secondary: false
  };

  renderPrimarySolutions(children) {
    const linkedChildren = children.filter(child => child.props && child.props.linked);
    const unlinkedChildren = children.filter(child => child.props && child.props.linked == null);

    return (
      <div className="coral-Shell-solutions-container">
        <div className="coral-Shell-solutions">
          { linkedChildren }
        </div>
        <div className="coral-Shell-solutions">
          { unlinkedChildren }
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
