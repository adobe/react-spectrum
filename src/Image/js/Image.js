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
    src: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    headers: PropTypes.object,
    cache: PropTypes.bool
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
    var fromCache = ImageCache.has(src);

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
    var image = this.imgRef;
    if (!image || !image.complete) {
      return false;
    }

    if (typeof image.naturalWidth !== 'undefined' && image.naturalWidth === 0) {
      return false;
    }

    return true;
  }

  onLoad() {
    var image = this.imgRef;
    if (image && this.props.onLoad && this.isImageLoaded()) {
      requestAnimationFrame(() => this.props.onLoad(image));
    }

    if (!this.state.loaded && this.isImageLoaded()) {
      this.setState({loaded: true, isPlaceholder: false});
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
    return (
      <img
        {...filterDOMProps(this.props)}
        className={classNames(this.props.className, 'react-spectrum-Image', {
          'is-loaded': this.state.loaded,
          'is-placeholder': this.state.isPlaceholder
        })}
        src={this.state.src}
        onLoad={this.onLoad}
        onError={this.onError}
        ref={r => this.imgRef = r} />
    );
  }
}
