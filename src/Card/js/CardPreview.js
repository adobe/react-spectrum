import PropTypes from 'prop-types';
import React from 'react';

/**
 * Image or file preview, displayed at the top of a card. Pass contents as children, often an Asset component.
 */
export default class CardPreview extends React.Component {
  static contextTypes = {
    cardVariant: PropTypes.string,
    onLoad: PropTypes.func
  };

  render() {
    let {children} = this.props;
    let {cardVariant, onLoad} = this.context;

    let smartness = 0;
    if (cardVariant === 'quiet') {
      smartness = 1;
    }
    
    return (
      <div className="spectrum-Card-preview">
        {React.cloneElement(children, {smartness, onLoad})}
      </div>
    );
  }
}
