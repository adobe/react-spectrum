import classNames from 'classnames';
import React from 'react';
import Tag from './Tag';
import '../style/index.styl';

export default class TagList extends React.Component {
  static displayName = 'TagList';

  static defaultProps = {
    readOnly: false,
    disabled: false,
    required: false,
    invalid: false,
    onClose: function () {},
    onFocus: function () {},
    onBlur: function () {}
  };

  state = {
    selectedIndex: 0,
    focused: false
  }

  handleFocus = e => {
    const {onFocus} = this.props;
    this.setState({focused: true});
    onFocus(e);
  }

  handleBlur = e => {
    const {onBlur} = this.props;
    this.setState({focused: false});
    onBlur(e);
  }

  baseChildProps(index) {
    const {readOnly, onClose, disabled} = this.props;
    const {selectedIndex, focused} = this.state;
    return {
      key: index,
      selected: !disabled && focused && selectedIndex === index,
      tabIndex: !disabled && selectedIndex === index ? 0 : -1,
      closable: !readOnly,
      disabled,
      onClose,
      onFocus: () => {this.setState({selectedIndex: index}); },
      role: 'option'
    };
  }

  renderChildren() {
    if (this.props.values) {
      return this.renderValues();
    }
    return React.Children.map(this.props.children, (child, index) =>
      React.cloneElement(child, this.baseChildProps(index))
    );
  }

  renderValues() {
    const {values} = this.props;
    return values.map((value, index) => (
      <Tag value={value} {...this.baseChildProps(index)}>
        {value}
      </Tag>
    ));
  }

  render() {
    const {
      className,
      name,
      readOnly,
      disabled,
      required,
      invalid,
      ...otherProps
    } = this.props;

    delete otherProps.onClose;

    const {focused} = this.state;

    return (
      <div
        {...otherProps}
        className={
          classNames(
            'coral-TagList',
            {
              'is-disabled': disabled
            },
            className
          )
        }
        name={name}
        readOnly={readOnly}
        disabled={disabled}
        role="listbox"
        aria-atomic="false"
        aria-relevant="additions"
        aria-live={focused ? 'polite' : 'off'}
        aria-disabled={disabled}
        aria-invalid={invalid}
        aria-required={required}
        onFocus={this.handleFocus}
        onBlur={this.handleBlur}
      >
        {this.renderChildren()}
      </div>
    );
  }
}
