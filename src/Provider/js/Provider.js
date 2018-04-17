import classNames from 'classnames';
import configureTypekit from '../../utils/configureTypekit';
import {defaultLocale, setLocale} from '../../utils/intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import '../../focus-ring-polyfill';
import '../style/index.styl';

export default class Provider extends Component {
  static propTypes = {
    theme: PropTypes.oneOf(['light', 'lightest', 'dark', 'darkest']),
    typekitId: PropTypes.string,
    locale: PropTypes.string,
    className: PropTypes.string
  };

  static defaultProps = {
    theme: 'light',
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
    const {
      theme,
      className,
      children,
      ...props
    } = this.props;

    delete props.typekitId;
    delete props.locale;

    return (
      <div
        className={classNames(className, 'react-spectrum-provider', 'spectrum', `spectrum--${theme}`)}
        {...props}>
        {children}
      </div>
    );
  }
}
