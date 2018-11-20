import PropTypes from 'prop-types';
import React from 'react';

/**
 * Cover photo for standard variant cards. Accepts an image url, and custom children 
 * (e.g. Avatar) displayed at the bottom of the cover photo.
 */
export default class CardCoverPhoto extends React.Component {
  static propTypes = {
    /** Image url to be displayed in the cover photo */
    src: PropTypes.string
  };

  render() {
    let {src, children} = this.props;

    return (
      <div className="spectrum-Card-coverPhoto" style={{backgroundImage: `url(${JSON.stringify(src)})`}}>
        {children}
      </div>
    );
  }
}
