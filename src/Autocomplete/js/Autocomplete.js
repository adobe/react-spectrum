import autobind from 'autobind-decorator';
import {chain, interpretKeyboardEvent} from '../../utils/events';
import classNames from 'classnames';
import {Menu, MenuItem} from '../../Menu';
import React from 'react';
import '../style/index.styl';

@autobind
export default class Autocomplete extends React.Component {
  static defaultProps = {
    allowCreate: false
  };

  state = {
    value: '',
    showDropdown: false,
    results: [],
    selectedIndex: -1,
    isFocused: false
  };

  componentWillMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    if (props.value != null && props.value !== this.state.value) {
      this.setValue(props.value);
    }
  }

  onChange(value) {
    let {onChange} = this.props;
    if (onChange) {
      onChange(value);
    }

    if (this.props.value == null) {
      this.setValue(value);
    }
  }

  setValue(value) {
    this.setState({
      value,
      showDropdown: true,
      selectedIndex: this.props.allowCreate && this.state.selectedIndex === -1 ? -1 : 0
    });

    this.getCompletions(value);
  }

  async getCompletions(value) {
    this._value = value;

    let results = [];
    let {getCompletions} = this.props;
    if (getCompletions) {
      results = await getCompletions(value);
    }

    // Avoid race condition where two getCompletions calls are made in parallel.
    if (this._value === value) {
      this.setState({results});
    }
  }

  onSelect(value) {
    this.onChange(typeof value === 'string' ? value : value.label);
    this.hideMenu();

    if (this.props.onSelect) {
      this.props.onSelect(value);
    }
  }

  onFocus() {
    this.setState({isFocused: true});
  }

  onBlur() {
    this.hideMenu();
    this.setState({isFocused: false});
  }

  onEscape() {
    this.hideMenu();
  }

  onSelectFocused() {
    let value = this.state.results[this.state.selectedIndex];
    if (value) {
      this.onSelect(value);
    } else if (this.props.allowCreate) {
      this.onSelect(this.state.value);
    }
  }

  onFocusFirst() {
    this.selectIndex(0);
  }

  onFocusLast() {
    this.selectIndex(this.state.results.length - 1);
  }

  onFocusPrevious() {
    let index = this.state.selectedIndex - 1;
    if (index < 0) {
      index = this.state.results.length - 1;
    }

    this.selectIndex(index);
  }

  onFocusNext() {
    let index = (this.state.selectedIndex + 1) % this.state.results.length;
    this.selectIndex(index);
  }

  onMouseEnter(index) {
    this.selectIndex(index);
  }

  selectIndex(selectedIndex) {
    this.setState({selectedIndex});
  }

  toggleMenu() {
    if (this.state.showDropdown) {
      this.hideMenu();
    } else {
      this.showMenu();
    }
  }

  showMenu() {
    this.setState({showDropdown: true, selectedIndex: 0});
    this.getCompletions(this.state.value);
  }

  hideMenu() {
    this.setState({showDropdown: false, selectedIndex: -1});
  }

  render() {
    const {className} = this.props;
    const {isFocused, results, selectedIndex, showDropdown, value} = this.state;
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.autocompleteInput) || children[0];

    return (
      <div className={classNames('coral-Autocomplete', {'is-focused': isFocused}, className)}>
        {children.map(child => {
          if (child === trigger) {
            return React.cloneElement(child, {
              value: value,
              onChange: chain(child.props.onChange, this.onChange),
              onKeyDown: chain(child.props.onKeyDown, interpretKeyboardEvent.bind(this)),
              onFocus: chain(child.props.onFocus, this.onFocus),
              onBlur: chain(child.props.onBlur, this.onBlur)
            });
          }

          return child;
        })}

        {showDropdown && results.length > 0 &&
          <Menu className="coral-Autocomplete-menu" onSelect={this.onSelect}>
            {results.map((result, i) =>
              <MenuItem
                value={result}
                icon={result.icon}
                focused={selectedIndex === i}
                onMouseEnter={this.onMouseEnter.bind(this, i)}
                onMouseDown={e => e.preventDefault()}>
                  {typeof result === 'string' ? result : result.label}
              </MenuItem>
            )}
          </Menu>
        }
      </div>
    );
  }
}
