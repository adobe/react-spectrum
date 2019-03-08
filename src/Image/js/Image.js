import autobind from 'autobind-decorator';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import ImageCache from './ImageCache';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

const DEFAULT_STATE = {
  src: '',
  loaded: false,
  isPlaceholder: false
};

@autobind
export default class Image extends React.Component {
  static propTypes = {
    /** The image url **/
    src: PropTypes.string.isRequired,

    /** Placeholder image to display while the fullsize one is loading, if cached. */
    placeholder: PropTypes.string,

    /** HTTP headers to add to the request for the asset image */
    headers: PropTypes.object,

    /** Whether to use the image cache for the image */
    cache: PropTypes.bool,

    /** Alternate content for screen readers */
    alt: PropTypes.string,

    /** Whether the image is being used for decoration and should not be announced by screen readers */
    decorative: PropTypes.bool,

    /** Load callback triggered when images load */
    onLoad: PropTypes.func
  };

  static defaultProps = {
    cache: false
  };

  state = DEFAULT_STATE;

  reset() {
    this.setState(DEFAULT_STATE);
  }

  loadImage(src, placeholder) {
    if (!this.props.cache && !this.props.headers) {
      this.setState({
        src,
        loaded: false,
        isPlaceholder: false
      });

      return;
    }

    this._src = src;
    let fromCache = ImageCache.has(src);

    if (ImageCache.has(placeholder) && !fromCache) {
      this.setState({
        src: ImageCache.getCached(placeholder),
        loaded: false,
        isPlaceholder: true
      });
    }

    this._loadCallback = (err, url) => {
      // Ignore result if the image src changed while
      // loading, or the component was unmounted.
      if (this._src !== src || !this.mounted) {
        return;
      }

      // Handle loading errors
      if (err) {
        return this.onError(err);
      }

      // Update the state. Mark as already loaded if it was from the cache.
      this.setState({
        src: url,
        loaded: fromCache,
        isPlaceholder: this.state.isPlaceholder && !fromCache
      });
    };

    ImageCache.get(src, {headers: this.props.headers || {}}, this._loadCallback);
  }

  componentDidMount() {
    this.mounted = true;
    this.loadImage(this.props.src, this.props.placeholder);
  }

  componentWillUnmount() {
    ImageCache.abort(this.props.src, this._loadCallback);
    this.mounted = false;
  }

  componentWillReceiveProps(props) {
    if (props.src !== this.props.src) {
      ImageCache.abort(this.props.src, this._loadCallback);
      this.reset();
      this.loadImage(props.src, props.placeholder);
    }
  }

  componentDidUpdate() {
    this.onLoad();
  }

  isImageLoaded() {
    let image = this.imgRef;
    if (!image || !image.complete) {
      return false;
    }

    if (typeof image.naturalWidth !== 'undefined' && image.naturalWidth === 0) {
      return false;
    }

    return true;
  }

  onLoad() {
    if (this.isImageLoaded()) {
      requestAnimationFrame(() => {
        // Image could have been unmounted or changed between frames, so double check it is still there.
        if (this.isImageLoaded()) {
          if (this.props.onLoad) {
            this.props.onLoad(this.imgRef);
          }
          if (!this.state.loaded) {
            this.setState({loaded: true, isPlaceholder: false});
          }
        }
      });
    }
  }

  onError(err) {
    if (this.props.onError) {
      this.props.onError(err);
    }

    if (this.state.src) {
      this.reset();
    }
  }

  render() {
    let {
      alt,
      className,
      decorative,
      ...otherProps
    } = this.props;
    let {
      loaded,
      isPlaceholder,
      src
    } = this.state;

    if (decorative) {
      alt = '';
    }

    if (alt == null) {
      console.warn(
        'Neither the `alt` prop or `decorative` were provided to an image. ' +
        'Add `alt` text for screen readers, or enable the `decorative` prop to indicate that the image ' +
        'is decorative or redundant with displayed text and should not be annouced by screen readers.'
      );
    }

    return (
      <img
        {...filterDOMProps(otherProps)}
        className={classNames(className, 'react-spectrum-Image', {
          'is-loaded': loaded,
          'is-placeholder': isPlaceholder
        })}
        src={src}
        onLoad={this.onLoad}
        onError={this.onError}
        ref={r => this.imgRef = r}
        alt={alt} />
    );
  }
}
