/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2019 Adobe
* All Rights Reserved.
*
* NOTICE: All information contained herein is, and remains
* the property of Adobe and its suppliers, if any. The intellectual
* and technical concepts contained herein are proprietary to Adobe
* and its suppliers and are protected by all applicable intellectual
* property laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe.
**************************************************************************/

import autobind from 'autobind-decorator';
import classNames from 'classnames';
import CollectionView from '../../utils/CollectionView';
import convertUnsafeMethod from '../../utils/convertUnsafeMethod';
import GridItem from './GridItem';
import {IndexPath, IndexPathSet, Layout} from '@react/collection-view';
import ListDataSource from '../../ListDataSource';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

@convertUnsafeMethod
@autobind
export default class GridView extends React.Component {
  static propTypes = {
    /** The layout to arrange the items in. */
    layout: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.instanceOf(Layout)
    ]).isRequired,

    /** Whether changes to the `layout` prop should be animated. */
    animateLayoutChanges: PropTypes.bool,

    /** Whether to display large or small size cards */
    cardSize: PropTypes.oneOf(['S', 'L']),

    /** The datasource for the grid view. Should be a subclass of `ListDataSource`. */
    dataSource: PropTypes.instanceOf(ListDataSource).isRequired,

    /** A function which renders a cell. Passed a column object and cell data. */
    renderItem: PropTypes.func.isRequired,

    /** An optional function which is called to render the contents of the grid view when there are no items. */
    renderEmptyView: PropTypes.func,

    /** Whether to allow the user to select items */
    allowsSelection: PropTypes.bool,

    /** Whether to allow multiple selection of items */
    allowsMultipleSelection: PropTypes.bool,

    /** A function that is called when the selection changes. Passed an IndexPathSet object. */
    onSelectionChange: PropTypes.func,

    /** Sets the selected items. Should be an IndexPathSet object or an array of IndexPaths. */
    selectedIndexPaths: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.instanceOf(IndexPath)),
      PropTypes.instanceOf(IndexPathSet)
    ]),

    /** Whether the user can drag items from the grid view. */
    canDragItems: PropTypes.bool,

    /** A function which renders the view to display under the cursor during drag and drop. */
    renderDragView: PropTypes.func,

    /**
     * Whether the GridView accepts drops.
     * If `true`, the grid view accepts all types of drops. Alternatively,
     * it can be set to an array of accepted drop types.
     */
    acceptsDrops: PropTypes.oneOfType([PropTypes.bool, PropTypes.arrayOf(PropTypes.string)]),

    /**
     * Whether drops should appear on top of items, or between them. If you want to customize this
     * or mix the modes, you can override `getDropTarget` on the data source.
     */
    dropPosition: PropTypes.oneOf(['on', 'between'])
  };

  static defaultProps = {
    cardSize: 'L',
    animateLayoutChanges: true,
    allowsSelection: true,
    allowsMultipleSelection: true,
    canDragItems: false,
    acceptsDrops: false,
    dropPosition: 'between'
  };

  constructor(props) {
    super(props);

    this.state = {
      layout: this.getLayout(props.layout, props.cardSize)
    };
  }

  getLayout(layout, cardSize) {
    if (typeof layout === 'function') {
      layout = new layout({cardSize});
    }

    if (layout instanceof Layout) {
      return layout;
    }

    throw new Error('Invalid layout prop passed to GridView. Must be a Layout constructor or an instanceof the Layout class.');
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.layout !== this.props.layout || props.cardSize !== this.props.cardSize) {
      this.setState({layout: this.getLayout(props.layout, props.cardSize)});
    }
  }

  renderItemView(type, data) {
    return (
      <GridItem size={this.props.cardSize} allowsSelection={this.props.allowsSelection}>
        {this.props.renderItem(data)}
      </GridItem>
    );
  }

  render() {
    let {
      allowsSelection,
      allowsMultipleSelection,
      className,
      dataSource,
      onSelectionChange,
      ...otherProps
    } = this.props;

    let rowCount = dataSource && dataSource.getNumberOfSections() > 0 ? dataSource.getSectionLength(0) : 0;

    return (
      <CollectionView
        {...otherProps}
        role="grid"
        aria-rowcount={rowCount}
        aria-multiselectable={(allowsSelection && allowsMultipleSelection) || null}
        className={classNames('react-spectrum-GridView', className)}
        renderItemView={this.renderItemView}
        layout={this.state.layout}
        dataSource={dataSource}
        canSelectItems={allowsSelection}
        onSelectionChanged={onSelectionChange}
        allowsMultipleSelection={allowsMultipleSelection}
        selectionMode="toggle"
        keyboardMode="focus" />
    );
  }
}
