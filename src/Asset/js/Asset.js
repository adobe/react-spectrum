/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import AssetFile from './AssetFile';
import AssetFolder from './AssetFolder';
import AssetImage from './AssetImage';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import PropTypes from 'prop-types';
import React from 'react';

importSpectrumCSS('asset');

export default class Asset extends React.Component {
  static propTypes = {
    /** Asset can be an image, folder or file type */
    type: PropTypes.oneOf(['image', 'folder', 'file']),

    /** Source of the Asset if it is an image */
    src: PropTypes.string,

    /** Whether to use the image cache for the asset image */
    cache: PropTypes.bool,

    /** HTTP headers to add to the request for the asset image */
    headers: PropTypes.object,

    /** Placeholder image to display while the fullsize one is loading, if cached. */
    placeholder: PropTypes.string,

    /** A factor between 0 and 1 that controls how the preview is scaled. When 0 ("dumb") the assets fits all the space available. */
    smartness: PropTypes.number,

    /** Alternate content for screen readers */
    alt: PropTypes.string,

    /** Whether the image is being used for decoration and should not be announced by screen readers */
    decorative: PropTypes.bool,

    /** Load callback triggered when images load */
    onLoad: PropTypes.func
  };

  static defaultProps = {
    type: 'file',
    smartness: 1
  };

  render(props) {
    let {
      type,
      src,
      placeholder,
      cache,
      headers,
      smartness,
      alt,
      className,
      onLoad,
      decorative,
      ...otherProps
    } = this.props;
    let content;

    if (type === 'image') {
      content = (
        <AssetImage
          src={src}
          placeholder={placeholder}
          smartness={smartness}
          onLoad={onLoad}
          cache={cache}
          headers={headers}
          alt={alt}
          decorative={decorative} />
      );
    } else if (type === 'folder') {
      content = <AssetFolder alt={alt} decorative={decorative} />;
    } else {
      content = <AssetFile alt={alt} decorative={decorative} />;
    }

    return (
      <div
        {...filterDOMProps(otherProps)}
        className={classNames('spectrum-Asset', className)}>
        {content}
      </div>
    );
  }
}
