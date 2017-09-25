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
    currentRating: this.props.value || 0
  };

  componentWillReceiveProps(props) {
    if (props.value != null) {
      this.setState({
        currentRating: props.value || 0
      });
    }
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
    let {currentRating} = this.state;
    let ratings = [];

    for (let i = 1; i <= max; ++i) {
      let active = i <= Math.round(currentRating);

      ratings.push(
        <span
          key={i}
          className={classNames('spectrum-Rating-icon', {'is-active': active, 'is-disabled': disabled})}
          onClick={!disabled && this.onClickRating.bind(this, i)} />
      );
    }

    return (
      <div
        className={classNames('spectrum-Rating', {'is-disabled': disabled}, className)}>
        {ratings}
      </div>
    );
  }
}
