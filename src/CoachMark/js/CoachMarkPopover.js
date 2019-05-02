import autobind from 'autobind-decorator';
import Button from '../../Button';
import filterDOMProps from '../../utils/filterDOMProps';
import intlMessages from '../intl/*.json';
import {messageFormatter} from '../../utils/intl';
import PropTypes from 'prop-types';
import React from 'react';

const formatMessage = messageFormatter(intlMessages);

@autobind
export default class CoachMarkPopover extends React.Component {
  static propTypes = {
    /** Title */
    title: PropTypes.string.isRequired,

    /**
     * Text of the primary button.
     * Required if using Coachmarks on their own. Can't use `.required`
     * though because Tour can provide a default.
     **/
    confirmLabel: PropTypes.string,

    /** Event Handler for the confirm button */
    onConfirm: PropTypes.func,

    /** Text of the secondary button */
    cancelLabel: PropTypes.string,

    /** Event Handler for the cancel button */
    onCancel: PropTypes.func,

    /** Hide progress */
    disableProgress: PropTypes.bool,

    /** Url to an image to display */
    image: PropTypes.string,

    /** Current step */
    currentStep: PropTypes.number,

    /** Total amount of steps */
    totalSteps: PropTypes.number
  };

  render() {
    let {
      title,
      confirmLabel,
      onConfirm,
      cancelLabel,
      onCancel,
      disableProgress,
      currentStep,
      totalSteps,
      image,
      children,
      ...otherProps
    } = this.props;

    disableProgress = disableProgress || typeof currentStep !== 'number' || typeof totalSteps !== 'number';

    return (<div {...filterDOMProps(otherProps)} className="spectrum-CoachMarkPopover">
      {image && <img src={image} className="spectrum-CoachMarkPopover-image" />}
      <div className="spectrum-CoachMarkPopover-header">
        <div className="spectrum-CoachMarkPopover-title">{title}</div>
        {!disableProgress && <div className="spectrum-CoachMarkPopover-step">{formatMessage('steps', {currentStep, totalSteps})}</div>}
      </div>
      <div className="spectrum-CoachMarkPopover-content">
        {children}
      </div>
      <div className="spectrum-CoachMarkPopover-footer">
        {cancelLabel && <Button quiet onClick={onCancel}>{cancelLabel}</Button>}
        {confirmLabel && <Button variant="primary" onClick={onConfirm}>{confirmLabel}</Button>}
      </div>
    </div>);
  }
}
