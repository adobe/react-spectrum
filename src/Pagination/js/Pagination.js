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
import Button from '../../Button';
import ChevronLeftMedium from '../../Icon/core/ChevronLeftMedium';
import ChevronRightMedium from '../../Icon/core/ChevronRightMedium';
import classNames from 'classnames';
import createId from '../../utils/createId';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import LiveRegionAnnouncer from '../../utils/LiveRegionAnnouncer';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import Textfield from '../../Textfield';
import '../style/index.styl';

importSpectrumCSS('pagination');
importSpectrumCSS('splitbutton');

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class Pagination extends Component {
  static propTypes = {
    /**
     * Button will give two button controls, one for increment and one for decrement.
     * Explicit will give a text field input that accepts numbers between 1 and totalPages.
     * When a number is typed in explicit mode, an onChange is fired only when enter is pressed.
     * If the user tabs off without hitting enter and then uses the increment button, it will resume
     * from the number it was at before the user typed anything.
     */
    variant: PropTypes.oneOf(['button', 'explicit']),

    /**
     * The mode of pagination. This is purely cosmetic.
     */
    mode: PropTypes.oneOf(['cta', 'primary', 'secondary']),

    /**
     * The current page number.
     */
    currentPage: PropTypes.number,

    /**
     * The default page number.
     */
    defaultPage: PropTypes.number,

    /**
     * The total page number. If user hits the total number, the pagination will be capped and will not
     * progress any higher. It also can't go lower than 1.
     */
    totalPages: PropTypes.number,

    /**
     * The callback function when the pagination is changed. It sends the value of the new current page.
     */
    onChange: PropTypes.func,

    /**
     * The callback function when the pagination is changed to previous page.
     * It sends the value of the new current page.
     */
    onPrevious: PropTypes.func,

    /**
     * The callback function when the pagination is changed to next page.
     * It sends the value of the new current page.
     */
    onNext: PropTypes.func
  };

  static defaultProps = {
    variant: 'button',
    mode: 'primary',
    defaultPage: 1
  };

  defaultPage = this.props.currentPage || this.props.defaultPage;

  state = {
    currentPage: this.defaultPage,
    pageInput: this.defaultPage
  };

  constructor(props) {
    super(props);
    this.defaultId = createId();

    // ref for the Textfield element
    this.textfieldRef;
  }

  componentWillReceiveProps(nextProps) {
    const currentPage = nextProps.currentPage;
    if ('currentPage' in nextProps && !this.isInvalidPage(currentPage)) {
      this.setState({currentPage, pageInput: currentPage});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    let {currentPage, pageInput} = this.state;
    if (currentPage === pageInput && pageInput !== prevState.pageInput) {
      this.announcePageInputValue(pageInput);
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
      this.setState(
        {
          currentPage: pageNumber,
          pageInput: pageNumber
        }
      );
    }
    if (eventToFire) {
      eventToFire(pageNumber, event);
    }
  }

  announcePageInputValue(pageNumber) {
    if (this.props.variant === 'explicit' && pageNumber !== '') {
      // Announce new value using a live region
      LiveRegionAnnouncer.announceAssertive(pageNumber.toString());
    }
  }

  onPageInputBlur() {
    const {currentPage, pageInput} = this.state;
    if (currentPage !== pageInput) {
      this.setState({pageInput: currentPage});
    }
  }

  onPageInputChange(value) {
    if (value === '' || !this.isInvalidPage(parseInt(value, 10))) {
      this.setState({pageInput: value});
    }
  }

  onKeyDown(event) {
    let pageInput = parseInt(this.state.pageInput, 10);
    let currentPage = pageInput;
    let isArrowKey = false;
    switch (event.key) {
      case 'ArrowUp':
      case 'Up':
        currentPage += 1;
        isArrowKey = true;
        break;
      case 'ArrowDown':
      case 'Down':
        currentPage -= 1;
        isArrowKey = true;
        break;
      case 'Enter':
      case ' ':
        return this.changePage(currentPage, this.props.onChange, event);
    }

    if (currentPage !== pageInput) {
      if (isArrowKey) {
        this.changePage(currentPage, this.props.onChange, event);
      } else {
        this.onPageInputChange(currentPage);
      }
    }
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
      id = this.defaultId,
      'aria-label': ariaLabel = formatMessage('pagination'),
      'aria-labelledby': ariaLabelledby,
      ...otherProps
    } = this.props;

    delete otherProps.onChange;

    let {pageInput} = this.state;
    const isButtonMode = variant === 'button';
    const isExplicitMode = variant === 'explicit';
    const buttonVariant = isButtonMode ? mode : 'action';
    const isFirst = this.isInvalidPage(parseInt(pageInput, 10) - 1);
    const isLast = this.isInvalidPage(parseInt(pageInput, 10) + 1);
    const previousLabel = formatMessage('previous');
    const inputLabel = formatMessage('page');
    const nextLabel = formatMessage('next');
    const counterId = `${id}-counter`;

    return (
      <nav
        className={
          classNames({
            'spectrum-SplitButton': isButtonMode,
            'spectrum-SplitButton--left': isButtonMode,
            'spectrum-Pagination': !isButtonMode,
            'spectrum-Pagination--explicit': isExplicitMode
          },
          'react-spectrum-Pagination')
        }
        id={id}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        {...filterDOMProps(otherProps)}>
        <Button
          ref={b => this.prevButtonRef = b}
          onClick={this.onPrevious}
          variant={buttonVariant}
          quiet={!isButtonMode}
          aria-label={isExplicitMode ? `${previousLabel}, ${pageInput}` : previousLabel}
          aria-describedby={isExplicitMode ? counterId : null}
          disabled={(isExplicitMode && isFirst) || null}
          aria-disabled={(isButtonMode && isFirst) || null}
          tabIndex={isFirst ? -1 : null}
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
              ref={t => this.textfieldRef = t}
              key={1}
              value={pageInput}
              onBlur={this.onPageInputBlur}
              onChange={this.onPageInputChange}
              onKeyDown={this.onKeyDown}
              aria-label={inputLabel}
              aria-describedby={counterId}
              className="spectrum-Pagination-input" />,
            <span
              key={2}
              id={counterId}
              className="spectrum-Body--secondary spectrum-Pagination-counter">
              {formatMessage('page_count', {n: totalPages})}
            </span>
          ]
        }
        <Button
          ref={b => this.nextButtonRef = b}
          onClick={this.onNext}
          variant={buttonVariant}
          quiet={!isButtonMode}
          aria-label={isExplicitMode ? `${nextLabel}, ${pageInput}` : nextLabel}
          aria-describedby={isExplicitMode ? counterId : null}
          disabled={(isExplicitMode && isLast) || null}
          aria-disabled={(isButtonMode && isLast) || null}
          tabIndex={isLast ? -1 : null}
          className={
            classNames({
              'spectrum-SplitButton-action': isButtonMode
            })
          }>
          <span className="spectrum-Button-label">{isButtonMode ? nextLabel : ''}</span>
          <ChevronRightMedium />
        </Button>
      </nav>);
  }
}

Pagination.displayName = 'Pagination';
