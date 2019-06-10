import autobind from 'autobind-decorator';
import classNames from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import Select from '../../Select';
import TabLine from './TabLine';
import '../style/index.styl';

@autobind
export default class TabListDropdown extends React.Component {
  state = {
    selectNode: undefined,
    selectedIndex: undefined
  };

  setSelectRef(s) {
    this.selectRef = s;
  }

  // It's useful to have the TabListDropdown be a separate component because the tabline needs a dom node
  // to do its calculations, we can guarantee that in componentDidMount whereas if we move this up
  // a component, it's conditionally rendered and we would need to use componentDidUpdate instead
  // with conditional logic.
  // By storing through setState, we can cause a render.
  componentDidMount() {
    this.setState({selectNode: ReactDOM.findDOMNode(this.selectRef)});
  }

  componentDidUpdate(prevProps) {
    // this is purely so that the Tabline re-renders whenever the selection changes
    // quiet Selects change width depending on what has been selected
    // we don't want an infinite loop, so if the index matches, don't set it
    if (prevProps.selectedIndex !== this.props.selectedIndex) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({selectedIndex: this.props.selectedIndex});
    }
  }

  onChange(selectedIndex) {
    this.props.onChange(Number(selectedIndex));
  }

  childrenToOptions() {
    const options = React.Children.toArray(this.props.children).map((child, i) => {
      let option = {};
      option.label = child.props.label || child.props.children;
      // value maps to the tab index, but has to be a string to be a valid select value
      option.value = i.toString();

      if (child.props.disabled) {
        option.disabled = true;
      }

      if (child.props.icon !== undefined) {
        option.icon = child.props.icon;
      }
      return option;
    });

    return options;
  }

  render() {
    let {
      className,
      selectedIndex,
      'aria-labelledby': ariaLabelledby,
      'aria-label': ariaLabel
    } = this.props;

    return (
      <div
        className={classNames('spectrum-Tabs', 'spectrum-Tabs--horizontal', 'react-spectrum-Tabs--dropdown', className)}>
        <Select
          quiet
          flexible
          ref={this.setSelectRef}
          options={this.childrenToOptions()}
          value={selectedIndex.toString()}
          onChange={this.onChange}
          aria-labelledby={ariaLabelledby}
          aria-label={ariaLabel} />
        {this.state.selectNode &&
          <TabLine orientation="horizontal" selectedTab={this.state.selectNode} selectedIndex={this.state.selectedIndex} />
        }
      </div>
    );
  }
}
