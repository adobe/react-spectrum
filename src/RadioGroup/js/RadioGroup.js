import React, {Component} from 'react';
import classNames from 'classnames';

import '../style/index.styl';

export default class RadioGroup extends Component {
  static defaultProps = {
    vertical: false,
    labelsBelow: false,
    onChange: function () {}
  };

  constructor(props) {
    super(props);

    const {
      selectedValue,
      defaultSelectedValue,
      children
    } = props;

    let firstSelectedValue;
    React.Children.forEach(children, child => {
      if (child.props.checked) {
        firstSelectedValue = child.props.value;
      }
    });

    const defaultSelected = firstSelectedValue || defaultSelectedValue;
    this.state = {
      selectedValue: selectedValue != null ? selectedValue : defaultSelected
    };
  }

  componentWillReceiveProps(nextProps) {
    if ('selectedValue' in nextProps) {
      this.setState({
        selectedValue: nextProps.selectedValue
      });
    }
  }

  setSelectedValue(value) {
    if (!('selectedValue' in this.props)) {
      this.setState({
        selectedValue: value
      });
    }

    this.props.onChange(value);
  }

  handleClickItem = (value) => {
    this.setSelectedValue(value);
  }

  render() {
    const {
      name,
      vertical,
      labelsBelow,
      className,
      children,
      ...otherProps
    } = this.props;

    const {selectedValue} = this.state;

    return (
      <div
        className={
          classNames(
            'coral-RadioGroup',
            {
              'coral-RadioGroup--vertical': vertical,
              'coral-RadioGroup--labelsBelow': labelsBelow
            },
            className
          )
        }
        { ...otherProps }
      >
        {
          React.Children.map(children, child => {
            const {value, onChange} = child.props;
            if (!value) {
              throw new Error('Each Radio Button must have a value property');
            }
            const radioGroupOnClick = this.handleClickItem.bind(this, value);

            return React.cloneElement(child, {
              checked: selectedValue === value,
              name,
              onChange: (checked, e) => {
                if (onChange) {
                  onChange(value);
                }
                radioGroupOnClick();

                // Let the RadioGroup change event propagate.
                e.stopPropagation();
              }
            });
          })
        }
      </div>
    );
  }
}

RadioGroup.displayName = 'RadioGroup';
