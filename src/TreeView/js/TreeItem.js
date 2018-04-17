import AccordionChevron from '../../Icon/core/AccordionChevron';
import classNames from 'classnames';
import React from 'react';

export default class TreeItem extends React.Component {
  render() {
    let {
      content,
      renderItem,
      allowsSelection,
      selected,
      onToggle,
      'drop-target': isDropTarget
    } = this.props;

    onToggle = onToggle.bind(null, content.item);

    let itemClassName = classNames('spectrum-TreeView-item', {
      'is-open': content.isExpanded
    });

    let linkClassName = classNames('spectrum-TreeView-link', {
      'is-selected': selected,
      'is-drop-target': isDropTarget
    });

    return (
      <div className={itemClassName}>
        <a className={linkClassName} onClick={!allowsSelection ? onToggle : null}>
          {content.isToggleable && content.hasChildren &&
            <AccordionChevron
              className="spectrum-TreeView-indicator"
              size={null}
              onClick={allowsSelection ? onToggle : null}
              onMouseDown={e => e.stopPropagation()} />
          }
          {renderItem(content.item, content)}
        </a>
      </div>
    );
  }
}
