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
    theme: PropTypes.oneOf(['light', 'lightest', 'dark', 'darkest']),
    scale: PropTypes.oneOf(['medium', 'large']),
    typekitId: PropTypes.string,
    locale: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    theme: 'light',
    scale: 'medium',
    typekitId: 'ruf7eed',
    locale: defaultLocale
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
