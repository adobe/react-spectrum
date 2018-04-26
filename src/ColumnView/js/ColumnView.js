import autobind from 'autobind-decorator';
import Column from './Column';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import '../style/index.styl';

importSpectrumCSS('miller');

/**
 * The top-level column view renders a list of columns
 */
@autobind
export default class ColumnView extends React.Component {
  static propTypes = {
    /* The datasource for the column view. Should be a subclass of ColumnViewDataSource. */
    dataSource: PropTypes.object.isRequired,

    /* A function which renders an item in a column */
    renderItem: PropTypes.func.isRequired,

    /* A function which renders a detail column for the navigated item */
    renderDetail: PropTypes.func,

    /* A function which renders a component when there are no items */
    renderEmpty: PropTypes.func, // TODO

    /* A function that is called when the selection changes. Passes a list of all selected items. */
    onSelectionChange: PropTypes.func,

    /* A function that is called when the navigation path changes. */
    onNavigate: PropTypes.func,

    /* Sets the navigated path. Optional. */
    navigatedPath: PropTypes.arrayOf(PropTypes.object), // TODO

    /* Sets the selected items. Optional. */
    selectedItems: PropTypes.arrayOf(PropTypes.object),

    /* Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /* Whether to allow selecting branches. On by default. If off, only leaf nodes can be selected. */
    allowsBranchSelection: PropTypes.bool,

    /* Whether to allow resizing the columns */
    allowsColumnResizing: PropTypes.bool, // TODO

    /* Default width of a column */
    columnWidth: PropTypes.number, // TODO

    /* Min width of a column */
    minWidth: PropTypes.number, // TODO

    /* Max width of a column */
    maxWidth: PropTypes.number // TODO
  };

  static defaultProps = {
    allowsSelection: false,
    allowsBranchSelection: false,
    allowsColumnResizing: false,
    columnWidth: 272
  };

  componentWillMount() {
    this.setupEvents(this.props.dataSource);
    this.componentWillReceiveProps(this.props);
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentWillReceiveProps(props) {
    if (props.dataSource !== this.props.dataSource) {
      this.teardownEvents(this.props.dataSource);
      this.setupEvents(props.dataSource);
    }

    if (props.selectedItems) {
      this.props.dataSource.replaceSelection(props.selectedItems);
    }
  }

  setupEvents(dataSource) {
    dataSource.on('navigate', this.onNavigate);
    dataSource.on('selectionChange', this.onSelectionChange);
  }

  teardownEvents(dataSource) {
    dataSource.removeListener('navigate', this.onNavigate);
    dataSource.removeListener('selectionChange', this.onSelectionChange);
  }

  onNavigate(stack) {
    this.forceUpdate(() => {
      if (this.mounted) {
        let dom = ReactDOM.findDOMNode(this);
        if (dom) {
          dom.scrollLeft = dom.scrollWidth;
          if (dom.childNodes.length > 1) {
            // If there is a detail item highlighted but no detail column displayed,
            // focus the last column, otherwise the second to last.
            let detail = this.props.dataSource.getDetailItem();
            let focused = dom.childNodes[dom.childNodes.length - (detail && !this.props.renderDetail ? 1 : 2)];
            focused.focus();
          }
        }
      }
    });

    if (this.props.onNavigate) {
      this.props.onNavigate(stack);
    }
  }

  onSelectionChange(selectedItems) {
    if (this.props.onSelectionChange) {
      this.props.onSelectionChange(selectedItems);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.dataSource.removeListener('navigate', this.onNavigate);
    this.props.dataSource.removeListener('selectionChange', this.onSelectionChange);
  }

  render() {
    let stack = this.props.dataSource.navigationStack;
    let detail = this.props.dataSource.getDetailItem();

    if (detail) {
      stack = stack.slice(0, -1);
    }

    return (
      <div className="spectrum-MillerColumns">
        {stack.map((node, index) => (
          <Column
            key={index}
            item={node}
            renderItem={this.props.renderItem}
            dataSource={this.props.dataSource}
            allowsSelection={this.props.allowsSelection}
            allowsBranchSelection={this.props.allowsBranchSelection} />
        ))}
        {detail && this.props.renderDetail &&
          <div className="spectrum-MillerColumn">
            {this.props.renderDetail(detail)}
          </div>
        }
      </div>
    );
  }
}
