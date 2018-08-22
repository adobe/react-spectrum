import autobind from 'autobind-decorator';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import Heading from '../../Heading';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('illustratedmessage');

@autobind
export default class IllustratedMessage extends React.Component {
  static propTypes = {
    /** Heading */
    heading: PropTypes.string,

    /** Description */
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),

    /** Illustration to be rendered above heading */
    illustration: PropTypes.element
  };

  static defaultProps = {
    heading: '',
    description: ''
  };

  render() {
    let {
      illustration = null,
      ...otherProps
    } = this.props;

    if (illustration && (!illustration.props.className || !illustration.props.className.includes('spectrum-IllustratedMessage-illustration'))) {
      illustration = React.cloneElement(illustration, {
        className: classNames(illustration.props.className, 'spectrum-IllustratedMessage-illustration')
      });
    }

    return (
      <div
        {...filterDOMProps(otherProps)}
        className={classNames('spectrum-IllustratedMessage', this.props.className)}>
        {illustration}
        {this.props.heading &&
          <Heading size={2} className="spectrum-IllustratedMessage-heading">{this.props.heading}</Heading>
        }
        {this.props.description &&
          <p className="spectrum-Body--secondary spectrum-IllustratedMessage-description">{this.props.description}</p>
        }
      </div>
    );
  }
}
