import PropTypes from 'prop-types';
import React from 'react';

/**
 * Body of a card. Allows optional title, subtitle, and description props, and custom children displayed underneath.
 */
export default class CardBody extends React.Component {
  static propTypes = {
    /** Title for the card */
    title: PropTypes.string,

    /** Subtitle for the card, e.g. file type, displayed in capitalized style */
    subtitle: PropTypes.string,

    /** Description for the card */
    description: PropTypes.string
  };

  static contextTypes = {
    cardVariant: PropTypes.string,
    actionMenu: PropTypes.element
  };

  render() {
    let {title, subtitle, description, children} = this.props;
    let {cardVariant, actionMenu} = this.context;

    let subtitleWrapper = subtitle ? <div className="spectrum-Card-subtitle">{subtitle}</div> : null;
    let descriptionWrapper = description ? <div className="spectrum-Card-description">{description}</div> : null;

    return (
      <div className="spectrum-Card-body">
        {title || actionMenu ?
          <div className="spectrum-Card-header">
            {title ? <div className="spectrum-Card-title">{title}</div> : null}
            {cardVariant === 'gallery' && subtitleWrapper}
            {cardVariant === 'gallery' && descriptionWrapper}
            {actionMenu ?
              <div className="spectrum-Card-actionButton">
                {React.cloneElement(actionMenu, {alignRight: true})}
              </div>
            : null}
          </div>
        : null}
        {cardVariant !== 'gallery' && (subtitle || description) ?
          <div className="spectrum-Card-content">
            {subtitleWrapper}
            {descriptionWrapper}
          </div>
        : null}
        {children}
      </div>
    );
  }
}
