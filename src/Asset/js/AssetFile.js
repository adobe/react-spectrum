import classNames from 'classnames';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import React, {Component} from 'react';

const formatMessage = messageFormatter(intlMessages);

/*
 * An AssetFile displays a generic file icon within an Asset component
 */
export default class AssetFile extends Component {
  render() {
    const {
      alt = formatMessage('File'),
      className,
      decorative
    } = this.props;
    return (
      <svg
        viewBox="0 0 128 128"
        className={classNames('spectrum-Asset-file', className)}
        aria-label={alt}
        aria-hidden={decorative || null}
        role="img">
        <g>
          <path
            className="spectrum-Asset-fileBackground"
            d="M24,126c-5.5,0-10-4.5-10-10V12c0-5.5,4.5-10,10-10h61.5c2.1,0,4.1,0.8,5.6,2.3l20.5,20.4c1.5,1.5,2.4,3.5,2.4,5.7V116c0,5.5-4.5,10-10,10H24z" />
          <g>
            <path
              className="spectrum-Asset-fileOutline"
              d="M113.1,23.3L92.6,2.9C90.7,1,88.2,0,85.5,0H24c-6.6,0-12,5.4-12,12v104c0,6.6,5.4,12,12,12h80c6.6,0,12-5.4,12-12V30.4C116,27.8,114.9,25.2,113.1,23.3z M90,6l20.1,20H92c-1.1,0-2-0.9-2-2V6z M112,116c0,4.4-3.6,8-8,8H24c-4.4,0-8-3.6-8-8V12c0-4.4,3.6-8,8-8h61.5c0.2,0,0.3,0,0.5,0v20c0,3.3,2.7,6,6,6h20c0,0.1,0,0.3,0,0.4V116z" />
          </g>
        </g>
      </svg>
    );
  }
}
