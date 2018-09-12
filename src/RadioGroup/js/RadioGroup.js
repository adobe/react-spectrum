import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React, {Component} from 'react';

importSpectrumCSS('fieldgroup');

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
            'spectrum-FieldGroup',
            {
              'spectrum-FieldGroup--vertical': vertical
            },
            className
          )
        }
        role="radiogroup"
        {...filterDOMProps(otherProps)}>
        {
          React.Children.map(children, child => {
            const {value, onChange} = child.props;
            if (value == null) {
              throw new Error('Each Radio Button must have a value property');
            }
            const radioGroupOnClick = this.handleClickItem.bind(this, value);

            return React.cloneElement(child, {
              checked: selectedValue === value,
              labelBelow: labelsBelow,
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
