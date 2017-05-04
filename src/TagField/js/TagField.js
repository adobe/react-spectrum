import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import classNames from 'classnames';
import React from 'react';
import {Tag} from '../../TagList';
import Textfield from '../../Textfield';
import '../style/index.styl';

@autobind
export default class TagField extends React.Component {
  state = {
    value: '',
    tags: this.props.value || []
  };

  componentWillReceiveProps(props) {
    if (props.value && props.value !== this.state.value) {
      this.setState({tags: props.value});
    }
  }

  onTextfieldChange(value) {
    this.setState({value});
  }

  onSelect(value) {
    if (!value || (!this.props.allowDuplicates && this.state.tags.includes(value))) {
      return;
    }

    this.setState({value: ''});

    let tags = [...this.state.tags, value];
    this.onChange(tags);
  }

  onRemove(value) {
    let tags = this.state.tags.filter(t => t !== value);
    this.onChange(tags);
  }

  onChange(tags) {
    if (this.props.value == null) {
      this.setState({tags});
    }

    if (this.props.onChange) {
      this.props.onChange(tags);
    }
  }

  render() {
    const {getCompletions, disabled, invalid, quiet, ...props} = this.props;
    const {value, tags} = this.state;

    delete props.onChange;

    return (
      <Autocomplete
        className={classNames('coral-TagField', {
          'coral-TagField--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid
        })}
        getCompletions={getCompletions}
        allowCreate
        onSelect={this.onSelect}
        value={value}
        onChange={this.onTextfieldChange}>
          {tags.map((tag, i) =>
            <Tag key={i} size="S" onClose={this.onRemove} closable disabled={disabled}>{tag}</Tag>)
          }
          <Textfield
            className="coral-TagField-input"
            autocompleteInput
            disabled={disabled}
            {...props} />
      </Autocomplete>
    );
  }
}
