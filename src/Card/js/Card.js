import autobind from 'autobind-decorator';
import Checkbox from '../../Checkbox/js/Checkbox';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';
import '../style/index.styl';

importSpectrumCSS('card');
importSpectrumCSS('quickaction');

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Card extends React.Component {
  static propTypes = {
    /** Card variant */
    variant: PropTypes.oneOf(['standard', 'quiet', 'gallery']),

    /** Card can be large or small size */
    size: PropTypes.oneOf(['S', 'L']),

    /** Whether or not the card supports selection */
    allowsSelection: PropTypes.bool,

    /** Whether or not the card is selected */
    selected: PropTypes.bool,

    /** What happens when the checkbox is clicked */
    onSelectionChange: PropTypes.func,

    /** Whether the card is currently a drop target */
    isDropTarget: PropTypes.bool,

    /** Quick actions to display on the card. */
    quickActions: PropTypes.element,

    /** Action menu to display in the body of the card. */
    actionMenu: PropTypes.element
  };

  static defaultProps = {
    variant: 'standard',
    size: 'L',
    selected: false,
    allowsSelection: true
  };

  static childContextTypes = {
    cardVariant: PropTypes.string,
    cardSize: PropTypes.string,
    actionMenu: PropTypes.element,
    onLoad: PropTypes.func,
    hasTitle: PropTypes.bool
  };

  getChildContext() {
    let actionMenu = this.props.actionMenu;
    if (this.props.size === 'S') {
      actionMenu = null;
    }

    // Find the CardBody to determine if it has a title.
    // This is used in CardPreview to decide whether to default the 
    // image to decorative for accessibility.
    let cardBody = React.Children.toArray(this.props.children)
      .find(child => child.type.displayName === 'CardBody');
    let hasTitle = Boolean(cardBody && cardBody.props.title);

    return {
      cardVariant: this.props.variant,
      cardSize: this.props.size,
      actionMenu,
      onLoad: this.props.onLoad,
      hasTitle
    };
  }

  handleCheckboxClick(evt) {
    if (this.props.onSelectionChange) {
      evt.stopPropagation();
    }
  }

  render() {
    let {
      variant,
      size,
      selected,
      allowsSelection,
      isDropTarget,
      quickActions,
      actionMenu,
      children,
      className,
      ...otherProps
    } = this.props;

    // Small size is not supported for standard cards
    if (variant === 'standard' && size === 'S') {
      size = 'L';
    }

    let checkbox = null;
    if (allowsSelection) {
      checkbox = (
        <div className={classNames('spectrum-QuickActions', 'spectrum-Card-quickActions')}>
          <Checkbox
            onChange={this.props.onSelectionChange}
            onClick={this.handleCheckboxClick}
            checked={selected}
            title={formatMessage('select')} />
        </div>
      );
    }

    if (quickActions && actionMenu) {
      throw new Error('Either quick actions or an action button can be passed to Card, not both.');
    }

    if (size === 'S' && actionMenu) {
      quickActions = (
        <div className="spectrum-QuickActions spectrum-Card-actions">
          {actionMenu}
        </div>
      );
    }

    let assetClass = classNames('spectrum-Card', `spectrum-Card--${variant}`, {
      'spectrum-Card--large': size === 'L',
      'spectrum-Card--small': size === 'S',
      'is-selected': selected,
      'is-drop-target': isDropTarget
    }, className);

    return (
      <div {...filterDOMProps(otherProps)} className={assetClass}>
        {children}
        {checkbox}
        {quickActions}
      </div>
    );
  }
}
