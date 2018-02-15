import autobind from 'autobind-decorator';
import {chain, interpretKeyboardEvent} from '../../utils/events';
import classNames from 'classnames';
import {Menu, MenuItem} from '../../Menu';
import Overlay from '../../OverlayTrigger/js/Overlay';
import React from 'react';
import ReactDOM from 'react-dom';
import '../style/index.styl';

const getLabel = o => (typeof o === 'string' ? o : o.label);

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

  componentDidMount() {
    this.updateSize();
  }

  componentDidUpdate() {
    this.updateSize();
  }

  updateSize() {
    if (this.wrapper) {
      let width = this.wrapper.offsetWidth;
      if (width !== this.state.width) {
        this.setState({width});
      }
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
      showDropdown: this.state.isFocused,
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
      return results;
    }

    return this.state.results;
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

  onEscape(event) {
    event.preventDefault();
    this.hideMenu();
  }

  onSelectFocused(event) {
    let value = this.state.results[this.state.selectedIndex];
    if (value) {
      event.preventDefault();
      this.onSelect(value);
    } else if (this.props.allowCreate) {
      event.preventDefault();
      this.onSelect(this.state.value);
    }
  }

  onFocusFirst(event) {
    event.preventDefault();
    this.selectIndex(0);
  }

  onFocusLast(event) {
    event.preventDefault();
    this.selectIndex(this.state.results.length - 1);
  }

  onFocusPrevious(event) {
    event.preventDefault();
    let index = this.state.selectedIndex - 1;
    if (index < 0) {
      index = this.state.results.length - 1;
    }

    this.selectIndex(index);
  }

  onFocusNext(event) {
    event.preventDefault();
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

  async showMenu() {
    this.setState({showDropdown: true, selectedIndex: 0});
    let results = await this.getCompletions(this.state.value);

    // Reset the selected index based on the value
    let selectedIndex = results.findIndex(result => getLabel(result) === this.state.value);
    if (selectedIndex !== -1) {
      this.setState({selectedIndex});
    }

    if (this.props.onMenuShow) {
      this.props.onMenuShow();
    }
  }

  hideMenu() {
    this.setState({showDropdown: false, selectedIndex: -1});
    if (this.props.onMenuHide) {
      this.props.onMenuHide();
    }
  }

  render() {
    const {className} = this.props;
    const {isFocused, results, selectedIndex, showDropdown, value} = this.state;
    const children = React.Children.toArray(this.props.children);
    const trigger = children.find(c => c.props.autocompleteInput) || children[0];

    return (
      <div className={classNames('react-spectrum-Autocomplete', {'is-focused': isFocused}, className)} ref={w => this.wrapper = w}>
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

        <Overlay target={this} show={showDropdown && results.length > 0} placement="bottom left">
          <Menu onSelect={this.onSelect} style={{width: this.state.width}}>
            {results.map((result, i) => {
              let label = getLabel(result);
              return (
                <MenuItem
                  key={`item-${i}`}
                  value={result}
                  icon={result.icon}
                  focused={selectedIndex === i}
                  selected={label === value}
                  onMouseEnter={this.onMouseEnter.bind(this, i)}
                  onMouseDown={e => e.preventDefault()}>
                  {label}
                </MenuItem>
              );
            })}
          </Menu>
        </Overlay>
      </div>
    );
  }
}
