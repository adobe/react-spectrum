import React from 'react';
import classNames from 'classnames';
import Tag from './Tag';

export default class TagList extends React.Component {
  static displayName = 'TagList';

  static defaultProps = {
    readOnly: false,
    disabled: false,
    required: false,
    invalid: false,
    onClose: () => {},
    onFocus: () => {},
    onBlur: () => {}
  };

  state = {
    selectedIndex: 0,
    focused: false
  }

  handleFocus = e => {
    const { onFocus } = this.props;
    this.setState({ focused: true });
    onFocus(e);
  }

  handleBlur = e => {
    const { onBlur } = this.props;
    this.setState({ focused: false });
    onBlur(e);
  }

  baseChildProps(index) {
    const { readOnly, onClose, disabled } = this.props;
    const { selectedIndex, focused } = this.state;
    return {
      key: index,
      selected: !disabled && focused && selectedIndex === index,
      tabIndex: !disabled && selectedIndex === index ? 0 : -1,
      closable: !readOnly,
      disabled,
      onClose,
      onFocus: () => { this.setState({ selectedIndex: index }); },
      role: 'option'
    };
  }

  renderChildren() {
    if (this.props.values) {
      return this.renderValues();
    }
    return React.Children.map(this.props.children, (child, index) => {
      return React.cloneElement(child, this.baseChildProps(index));
    });
  }

  renderValues() {
    const { values } = this.props;
    return values.map((value, index) => {
      return (
        <Tag value={ value } { ...this.baseChildProps(index) }>
          { value }
        </Tag>
      );
    });
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

    const { focused } = this.state;

    return (
      <div
        { ...otherProps }
        className={
          classNames(
            'coral-TagList',
            {
              'is-disabled': disabled
            },
            className
          )
        }
        name={ name }
        readOnly={ readOnly }
        disabled={ disabled }
        role="listbox"
        aria-atomic="false"
        aria-relevant="additions"
        aria-live={ focused ? 'polite' : 'off' }
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-required={ required }
        onFocus={ this.handleFocus }
        onBlur={ this.handleBlur }
      >
        { this.renderChildren() }
      </div>
    );
  }
}
