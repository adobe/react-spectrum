import Checkbox from '../../Checkbox';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import React from 'react';

/*
 * A wrapper for an Item within an ItemColumn that will manage the Item's state
 */
export default class Item extends React.Component {
  render() {
    let {
      item,
      renderItem,
      selected: highlighted, // selected comes from collection-view, but is really highlighted
      allowsSelection,
      allowsBranchSelection,
      isSelected,
      ...props
    } = this.props;

    let className = classNames('spectrum-AssetList-item', {
      'is-branch-selectable': allowsBranchSelection,
      'is-branch': item.hasChildren,
      'is-navigated': highlighted && !isSelected,
      'is-selected': isSelected
    });

    return (
      <div className={className} {...filterDOMProps(props)}>
        {allowsSelection && allowsBranchSelection && this.renderCheckbox()}
        <span className="spectrum-AssetList-itemLabel">{renderItem(item.item)}</span>
        {item.hasChildren && this.renderChevron()}
        {allowsSelection && !allowsBranchSelection && !item.hasChildren && this.renderCheckbox()}
      </div>
    );
  }

  renderChevron() {
    return (
      <ChevronRightMedium className="spectrum-AssetList-itemChildIndicator" size="XS" />
    );
  }

  renderCheckbox() {
    return (
      <Checkbox
        onMouseDown={e => e.stopPropagation()}
        checked={this.props.isSelected}
        onChange={this.props.onSelect} />
    );
  }
}
