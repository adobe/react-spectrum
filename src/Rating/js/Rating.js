import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React from 'react';
import '../style/index.styl';

@autobind
export default class Rating extends React.Component {
  static defaultProps = {
    disabled: false,
    className: '',
    max: 5,
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
    let {max, disabled, className} = this.props;
    let {currentRating, currentRatingHover, hovering} = this.state;
    let rating = hovering ? currentRatingHover : currentRating;
    let ratings = [];

    for (let i = 1; i <= max; ++i) {
      let active = i <= Math.round(currentRating);

      ratings.push(
        <span
          key={i}
          className={classNames('spectrum-Rating-icon', {'is-active': active, 'is-disabled': disabled})}
          onMouseEnter={!disabled && this.onMouseEnter.bind(this, i)}
          onClick={!disabled && this.onClickRating.bind(this, i)} />
      );
    }

    return (
      <div
        className={classNames('spectrum-Rating', {'is-disabled': disabled}, className)}
        onMouseLeave={this.onMouseLeave}>
        {ratings}
      </div>
    );
  }
}
