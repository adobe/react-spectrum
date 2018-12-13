import {clamp} from '../../utils/number';
import classNames from 'classnames';
import Image from '../../Image/js/Image';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

const PERCENTAGE_CACHE = new Map;

/*
 * An AssetImage displays an image preview within an Asset component
 */
export default class AssetImage extends Component {
  static propTypes = {
    /** The image url */
    src: PropTypes.string.isRequired,

    /** A factor between 0 and 1 that controls how the preview is scaled. When 0 ("dumb") the assets fits all the space available. */
    smartness: PropTypes.number
  };

  static defaultProps = {
    smartness: 1
  };

  // Default previewPercentage of 0 ensures that it isn't rendered before previewPercentage is set onLoad
  // Loaded is set to true after the image is loaded, and is used to set opacity of image before/after load
  state = {
    previewPercentage: PERCENTAGE_CACHE.get(this.props.src) || 0
  };

  componentWillUnmount() {
    PERCENTAGE_CACHE.delete(this.props.src);
  }

  calculateSize(width, height) {
    if (width === 0 || height === 0) {
      return 0;
    }

    // smartness should be a value between 0 and 1
    let smartness = clamp(this.props.smartness, 0, 1);

    // Any asset with an aspect ratio smaller than "smallestAspectRatio" would fit the space fully (on one side).
    // Any asset with an aspect ratio bigger than "smallestAspectRatio" would fit a percentage of the space.
    let smallestAspectRatio = 0.25;
    // An asset with an aspect ratio of 1 (a square) would be displayed at the "minimumPercentage" of the space.
    let minimumPercentage = 1 - smartness * 0.25;
    // Aspect ratio of the asset (from 0 to 1) if longest side is 1.
    let aspectRatio = width / Math.max(width, height) * height / Math.max(width, height);
    // Ratio (from 0 to 1) between "smallestAspectRatio" and 1 (a square).
    let ratio = Math.max(0, aspectRatio - smallestAspectRatio) / (1 - smallestAspectRatio);
    // Percentage of the space that the asset will fit in.
    return (1 - ratio * (1 - minimumPercentage)) * 100;
  }

  onLoad(img) {
    let percentage = this.calculateSize(img.naturalWidth, img.naturalHeight);
    PERCENTAGE_CACHE.set(this.props.src, percentage);

    if (percentage !== this.state.previewPercentage) {
      this.setState({
        previewPercentage: percentage
      });
    }

    if (this.props.onLoad) {
      this.props.onLoad();
    }
  }

  render(props) {
    let {
      src,
      className,
      ...otherProps
    } = this.props;
    let percentage = this.state.previewPercentage;
    let style = {
      maxWidth: percentage + '%',
      maxHeight: percentage + '%'
    };

    return (
      <Image
        {...otherProps}
        className={classNames('spectrum-Asset-image', className)}
        onLoad={this.onLoad.bind(this)}
        src={src}
        style={style} />
    );
  }
}
