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
          alt={alt} />
      );
    } else if (type === 'folder') {
      content = <AssetFolder />;
    } else {
      content = <AssetFile />;
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
