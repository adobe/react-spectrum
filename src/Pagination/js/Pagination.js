import autobind from 'autobind-decorator';
import Button from '../../Button';
import ChevronLeftMedium from '../../Icon/core/ChevronLeftMedium';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Textfield from '../../Textfield';

importSpectrumCSS('pagination');
importSpectrumCSS('splitbutton');

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Pagination extends Component {
  static propTypes = {
    variant: PropTypes.oneOf(['button', 'explicit']),
    mode: PropTypes.oneOf(['cta', 'primary', 'secondary']),
    currentPage: PropTypes.number,
    defaultPage: PropTypes.number,
    totalPages: PropTypes.number,
    onChange: PropTypes.func,
    onPrevious: PropTypes.func,
    onNext: PropTypes.func
  }

  static defaultProps = {
    variant: 'button',
    mode: 'primary',
    defaultPage: 1
  }

  defaultPage = this.props.currentPage || this.props.defaultPage;

  state = {
    currentPage: this.defaultPage,
    pageInput: this.defaultPage
  }

  componentWillReceiveProps(nextProps) {
    const currentPage = nextProps.currentPage;
    if ('currentPage' in nextProps && !this.isInvalidPage(currentPage)) {
      this.setState({currentPage, pageInput: currentPage});
    }
  }

  isInvalidPage(page) {
    const {totalPages} = this.props;
    return isNaN(page) || page < 1 || totalPages && page > totalPages;
  }

  changePage(pageNumber, eventToFire, event) {
    if (this.isInvalidPage(pageNumber)) {
      return;
    }
    if (!('currentPage' in this.props)) {
      this.setState({currentPage: pageNumber, pageInput: pageNumber});
    }
    if (eventToFire) {
      eventToFire(pageNumber, event);
    }
  }

  onPageInputChange(value) {
    if (value === '' || !this.isInvalidPage(Number(value))) {
      this.setState({pageInput: value});
    }
  }

  onKeyDown(event) {
    let currentPage = Number(this.state.pageInput);
    switch (event.key) {
      case 'ArrowUp':
      case 'Up':
        currentPage += 1;
        break;
      case 'ArrowDown':
      case 'Down':
        currentPage -= 1;
        break;
      case 'Enter':
      case ' ':
        return this.changePage(currentPage, this.props.onChange, event);
    }
    this.onPageInputChange(currentPage);
  }

  onPrevious(e) {
    this.changePage(this.state.currentPage - 1, this.props.onPrevious, e);
  }

  onNext(e) {
    this.changePage(this.state.currentPage + 1, this.props.onNext, e);
  }

  render() {
    const {
      mode,
      variant,
      totalPages,
      ...otherProps
    } = this.props;

    delete otherProps.onChange;

    const {pageInput} = this.state;
    const isButtonMode = variant === 'button';
    const isExplicitMode = variant === 'explicit';
    const buttonVariant = isButtonMode ? mode : 'icon';

    return (
      <nav
        className={
          classNames({
            'spectrum-SplitButton': isButtonMode,
            'spectrum-SplitButton--left': isButtonMode,
            'spectrum-Pagination--explicit': isExplicitMode
          })
        }
        {...filterDOMProps(otherProps)}>
        <Button
          onClick={this.onPrevious}
          variant={buttonVariant}
          aria-label={formatMessage('previous')}
          className={
            classNames({
              'spectrum-SplitButton-trigger': isButtonMode
            })
          }>
          <ChevronLeftMedium />
        </Button>
        { isExplicitMode &&
          [
            <Textfield
              key={1}
              value={pageInput}
              onChange={this.onPageInputChange}
              onKeyDown={this.onKeyDown}
              className="spectrum-Pagination-input" />,
            <span
              key={2}
              className="spectrum-Body--secondary spectrum-Pagination-counter">
              {formatMessage('page_count', {n: totalPages})}
            </span>
          ]
        }
        <Button
          onClick={this.onNext}
          variant={buttonVariant}
          aria-label={formatMessage('next')}
          className={
            classNames({
              'spectrum-SplitButton-action': isButtonMode
            })
          }>
          <span className="spectrum-Button-label">{isButtonMode ? formatMessage('next') : ''}</span>
          <ChevronRightMedium />
        </Button>
      </nav>);
  }
}

Pagination.displayName = 'Pagination';
