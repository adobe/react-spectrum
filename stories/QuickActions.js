import {action} from '@storybook/addon-actions';
import Copy from '../src/Icon/Copy';
import Delete from '../src/Icon/Delete';
import Edit from '../src/Icon/Edit';
import {QuickActions, QuickActionsItem} from '../src/QuickActions';
import React from 'react';
import ReactDOM from 'react-dom';
import './QuickActions.styl';
import {storiesOf} from '@storybook/react';

storiesOf('QuickActions', module)
  .add(
    'Default',
    () => render(),
    {inline: true}
  )
  .add(
    'Default, maxVisibleItems: 1',
    () => render({maxVisibleItems: 1}),
    {inline: true}
  )
  .add(
    'Default, maxVisibleItems: 3',
    () => render({maxVisibleItems: 3}),
    {inline: true}
  )
  .add(
    'Icon only',
    () => render({variant: 'icon'}),
    {inline: true}
  )
  .add(
    'Icon only, maxVisibleItems: 1',
    () => render({variant: 'icon', maxVisibleItems: 1}),
    {inline: true}
  )
  .add(
    'Text only',
    () => render({variant: 'text'}),
    {inline: true}
  )
  .add(
    'Text only, maxVisibleItems: 1',
    () => render({variant: 'text', maxVisibleItems: 1}),
    {inline: true}
  );

function render(props) {
  return (
    <CardWithQuickActions {...props} />
  );
}

class CardWithQuickActions extends React.Component {
  // we could make it better by not having it close and reopen when a dropdown option is clicked
  state = {
    showQuickActions: false,
    quickActionMenuOpen: false
  };
  hovered = false;
  focused = false;
  onMenuOpen = () => {
    this.setState({quickActionMenuOpen: true});
  };
  onMenuClose = () => {
    this.setState({quickActionMenuOpen: false});
  };
  onMouseEnter = () => {
    this.hovered = true;
    this.setState({showQuickActions: this.hovered || this.focused});
  };
  onMouseLeave = () => {
    this.hovered = false;
    this.setState({showQuickActions: this.hovered || this.focused});
  };
  onFocus = () => {
    this.focused = true;
    this.setState({showQuickActions: this.hovered || this.focused});
  };
  onBlur = () => {
    this.focused = false;
    this.setState({showQuickActions: this.hovered || this.focused});
  };
  onKeyDown = (e) => {
    const {showQuickActions} = this.state;
    let newShowQuickActions = false;
    let dom = ReactDOM.findDOMNode(this);
    switch (e.key) {
      case 'Escape': {
        if (showQuickActions) {
          dom && dom.querySelector('.card').focus();
          this.setState({quickActionMenuOpen: false, showQuickActions: false});
        }
        break;
      }
      case 'ContextMenu':
      case 'App': {
        if (!showQuickActions) {
          newShowQuickActions = true;
        }
        break;
      }
      case 'F10': {
        if (e.shiftKey && !showQuickActions) {
          newShowQuickActions = true;
        }
        break;
      }
    }
    if (newShowQuickActions) {
      e.preventDefault();
      e.stopPropagation();
      this.setState(
        {showQuickActions: true},
        () => {
          if (dom) {
            let node = dom.querySelector(`.quickActions .spectrum-${QuickActionsItem.displayName}`);
            if (node) {
              node.focus();
            }
          }
        }
      );
    }
  };
  render() {
    let props = this.props;
    return (
      <div style={{width: '976px', height: '320px'}}>
        {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
        <div role="region" tabIndex={0} className="card" onFocus={this.onFocus} onBlur={this.onBlur} onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave} onKeyDown={this.onKeyDown}>
          <div className="body">
            <div style={{width: '140px', overflow: 'hidden', height: '140px'}}>
              <img alt="" style={{width: '160px'}} src="https://mir-s3-cdn-cf.behance.net/project_modules/disp/174bad18577023.562cbc60cbbe2.jpg" />
            </div>
          </div>
          <div className="caption">
            <div className="title">Shades of Blue</div>
            <div className="subtitle">jpg</div>
          </div>
          <div className="quickActions">
            <QuickActions
              {...props}
              isOpen={this.state.showQuickActions || this.state.quickActionMenuOpen}
              onMenuOpen={this.onMenuOpen}
              onMenuClose={this.onMenuClose}>
              <QuickActionsItem label="Edit" icon={<Edit alt="Edit" />} onClick={action('Edit')} />
              <QuickActionsItem label="Copy" icon={<Copy alt="Copy" />} onClick={action('Copy')} />
              <QuickActionsItem label="Delete" icon={<Delete alt="Delete" />} onClick={action('Delete')} />
            </QuickActions>
          </div>
        </div>
      </div>
    );
  }
}
