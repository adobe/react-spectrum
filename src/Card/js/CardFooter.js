import React from 'react';

/**
 * Footer for a card. Pass custom content as children.
 */
export default class CardFooter extends React.Component {
  render() {
    return (
      <div className="spectrum-Card-footer">
        {this.props.children}
      </div>
    );
  }
}
