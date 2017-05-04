import autobind from 'autobind-decorator';
import classNames from 'classnames';
import Icon from '../../Icon';
import React from 'react';
import '../style/index.styl';

@autobind
export default class Rating extends React.Component {
  static defaultProps = {
    disabled: false,
    filledIcon: 'starFill',
    unfilledIcon: 'starStroke',
    className: '',
    max: 5
  };

  state = {
    currentRating: this.props.value || 0,
    currentRatingHover: 0,
    hovering: false
  };

  componentWillReceiveProps(props) {
    if (props.value != null) {
      this.setState({
        currentRating: props.value || 0
      });
    }
  }

  onMouseEnter(rating, e) {
    this.setState({
      currentRatingHover: rating,
      hovering: true
    });
  }

  onMouseLeave() {
    this.setState({
      hovering: false
    });
  }

  onClickRating(currentRating, e) {
    e.stopPropagation();

    if (this.props.value == null) {
      this.setState({currentRating});
    }

    if (this.props.onChange) {
      this.props.onChange(currentRating);
    }
  }

  render() {
    let {filledIcon, unfilledIcon, max, disabled, readOnly, className} = this.props;
    let {currentRating, currentRatingHover, hovering} = this.state;
    let rating = hovering ? currentRatingHover : currentRating;
    let ratings = [];

    readOnly = readOnly || disabled;

    for (let i = 1; i <= max; ++i) {
      let active = i <= Math.round(currentRating);
      let icon = i <= Math.round(rating) ? filledIcon : unfilledIcon;

      ratings.push(
        <Icon
          icon={icon}
          size="S"
          key={i}
          className={classNames('coral-Rating-icon', {'is-active': active, 'is-disabled': disabled})}
          onMouseEnter={!readOnly && this.onMouseEnter.bind(this, i)}
          onClick={!readOnly && this.onClickRating.bind(this, i)} />
      );
    }

    return (
      <div
        className={classNames('coral-Rating', {'is-readonly': readOnly}, className)}
        onMouseLeave={this.onMouseLeave}>
          {ratings}
      </div>
    );
  }
}
