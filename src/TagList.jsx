import React from 'react';
import classNames from 'classnames';
import Tag from './Tag';

export default class TagList extends React.Component {

  baseChildProps(index) {
    const { readonly, onClose, disabled } = this.props;
    return {
      tabIndex: (disabled) ? -1 : index,
      closable: !readonly,
      disabled,
      onClose,
      role: 'option',
      'aria-selected': false
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
      readonly,
      disabled,
      required,
      invalid,
      ...otherProps
    } = this.props;

    return (
      <div
        { ...otherProps }
        className={
          classNames(
            'coral-TagList',
            disabled ? 'is-disabled' : '',
            className
          )
        }
        name={ name }
        role="listbox"
        aria-disabled={ disabled }
        aria-invalid={ invalid }
        aria-readonly={ readonly }
        aria-required={ required }
        readOnly={ readonly }
        disabled={ disabled }
      >
        { this.renderChildren() }
      </div>
    );
  }
}

TagList.displayName = 'TagList';
