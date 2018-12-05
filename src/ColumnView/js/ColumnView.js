import autobind from 'autobind-decorator';
import classNames from 'classnames';
import Column from './Column';
import createId from '../../utils/createId';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import '../style/index.styl';

importSpectrumCSS('assetlist');
importSpectrumCSS('miller');

/**
 * The top-level column view renders a list of columns
 */
@autobind
export default class ColumnView extends React.Component {
  static propTypes = {
    /** The datasource for the column view. Should be a subclass of `ColumnViewDataSource`. */
    dataSource: PropTypes.object.isRequired,

    /** A function which renders an item in a column */
    renderItem: PropTypes.func.isRequired,

    /** A function which renders a detail column for the navigated item */
    renderDetail: PropTypes.func,

    /* A function which renders a component when there are no items */
    // renderEmpty: PropTypes.func, // TODO

    /** A function that is called when the selection changes. Passes a list of all selected items. */
    onSelectionChange: PropTypes.func,

    /** A function that is called when the navigation path changes. */
    onNavigate: PropTypes.func,

    /* Sets the navigated path. Optional. */
    // navigatedPath: PropTypes.arrayOf(PropTypes.object), // TODO

    /** Sets the selected items. Optional. */
    selectedItems: PropTypes.arrayOf(PropTypes.object),

    /** Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /** Whether to allow selecting branches. On by default. If off, only leaf nodes can be selected. */
    allowsBranchSelection: PropTypes.bool,

    /* Whether to allow resizing the columns */
    // allowsColumnResizing: PropTypes.bool, // TODO

    /* Default width of a column */
    // columnWidth: PropTypes.number, // TODO

    /* Min width of a column */
    // minWidth: PropTypes.number, // TODO

    /* Max width of a column */
    // maxWidth: PropTypes.number // TODO

    /* Custom class name to apply */
    className: PropTypes.string
  };

  static defaultProps = {
    allowsSelection: false,
    allowsBranchSelection: false,
    // allowsColumnResizing: false,
    // columnWidth: 272
  };

  state = {
    focusedColumnIndex: 0
  };

  constructor(props) {
    super(props);
    this.columnViewId = createId();
    this.columns = [];
  }

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
            let focusedColumnIndex = dom.childNodes.length - (detail && !this.props.renderDetail ? 1 : 2);
            this.onColumnFocus(focusedColumnIndex, () => {
              this.columns[focusedColumnIndex].focus();
            });
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

  onColumnFocus(focusedColumnIndex, fn) {
    if (focusedColumnIndex === this.state.focusedColumnIndex) {
      return;
    }

    this.setState({focusedColumnIndex}, fn);
  }

  componentWillUnmount() {
    this.mounted = false;
    this.props.dataSource.removeListener('navigate', this.onNavigate);
    this.props.dataSource.removeListener('selectionChange', this.onSelectionChange);
  }

  render() {
    let {
      id = this.columnViewId,
      className,
      dataSource,
      renderItem,
      allowsSelection,
      allowsBranchSelection,
      renderDetail
    } = this.props;
    let stack = dataSource.navigationStack;
    let detail = dataSource.getDetailItem();
    let detailNode = dataSource.getDetailNode();

    // array of refs for columns
    this.columns = [];

    if (detail) {
      stack = stack.slice(0, -1);
    }

    return (
      <div
        role="tree"
        id={id}
        aria-label={this.props['aria-label']}
        aria-labelledby={this.props['aria-labelledby']}
        aria-multiselectable={allowsSelection}
        className={classNames('spectrum-MillerColumns react-spectrum-MillerColumns', className)}>
        {stack.map((node, index) => (
          <Column
            key={index}
            item={node}
            ref={column => this.columns[index] = column}
            focused={this.state.focusedColumnIndex === index}
            level={index}
            aria-label={index === 0 ? this.props['aria-label'] : null}
            aria-labelledby={index === 0 ? this.props['aria-labelledby'] : null}
            renderItem={renderItem}
            dataSource={dataSource}
            detailNode={renderDetail ? detailNode : null}
            allowsSelection={allowsSelection}
            allowsBranchSelection={allowsBranchSelection}
            onFocus={e => this.onColumnFocus(index)} />
        ))}
        {detail && renderDetail &&
          <div
            role="group"
            id={detailNode.getColumnId()}
            aria-labelledby={detailNode.getItemId()}
            className="spectrum-MillerColumns-item">
            {renderDetail(detail)}
          </div>
        }
      </div>
    );
  }
}
