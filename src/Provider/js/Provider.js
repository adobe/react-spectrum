import classNames from 'classnames';
import configureTypekit from '../../utils/configureTypekit';
import {defaultLocale, setLocale} from '../../utils/intl';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../../focus-ring-polyfill';
import '../style/index.styl';

importSpectrumCSS('page');
importSpectrumCSS('typography');

export default class Provider extends Component {
  static propTypes = {
    /**
     * Theme.
     */
    theme: PropTypes.oneOf(['light', 'lightest', 'dark', 'darkest']),

    /**
     * Scale.
     */
    scale: PropTypes.oneOf(['medium', 'large']),

    /**
     * Type kit ID. This is required and products must get their own id's.
     * https://typekit.com/account/kits
     * There is a default provided, but it's only intended for prototyping work.
     */
    typekitId: PropTypes.string,

    /**
     * Locale, takes format primary-region ex. en-US, cs-CZ
     */
    locale: PropTypes.string,

    /**
     * CSS class name.
     */
    className: PropTypes.string
  };

  static defaultProps = {
    theme: 'light',
    scale: 'medium',
    typekitId: 'ruf7eed',
    locale: defaultLocale
  };

  // Expose the current theme etc. on the context for children to read if needed.
  static childContextTypes = {
    theme: PropTypes.oneOf(['light', 'lightest', 'dark', 'darkest']),
    scale: PropTypes.oneOf(['medium', 'large']),
    locale: PropTypes.string
  };

  constructor(props) {
    super(props);
    setLocale(props.locale);
    if (process.browser) {
      configureTypekit(props.typekitId);
    }
  }

  componentWillReceiveProps(nextProps) {
    if ('locale' in nextProps) {
      setLocale(nextProps.locale);
    }
  }

  getChildContext() {
    return {
      theme: this.props.theme,
      scale: this.props.scale,
      locale: this.props.locale
    };
  }

  render() {
    let {
      theme,
      className,
      children,
      scale,
      ...props
    } = this.props;

    return (
      <div
        className={classNames(className, 'react-spectrum-provider', 'spectrum', `spectrum--${theme}`, `spectrum--${scale}`)}
        {...filterDOMProps(props)}>
        {children}
      </div>
    );
  }
}
