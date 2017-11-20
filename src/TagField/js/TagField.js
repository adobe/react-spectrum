import autobind from 'autobind-decorator';
import Autocomplete from '../../Autocomplete';
import classNames from 'classnames';
import React from 'react';
import {TagList} from '../../TagList';
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
    const {getCompletions, disabled, invalid, quiet, className, ...props} = this.props;
    const {value, tags} = this.state;

    delete props.onChange;

    return (
      <Autocomplete
        className={classNames('react-spectrum-TagField', 'spectrum-Textfield', {
          'spectrum-Textfield--quiet': quiet,
          'react-spectrum-TagField--quiet': quiet,
          'is-disabled': disabled,
          'is-invalid': invalid
        }, className)}
        getCompletions={getCompletions}
        allowCreate
        onSelect={this.onSelect}
        value={value}
        onChange={this.onTextfieldChange}>
        <TagList disabled={disabled} onClose={this.onRemove} values={tags} />
        <Textfield
          className="react-spectrum-TagField-input"
          autocompleteInput
          disabled={disabled}
          {...props} />
      </Autocomplete>
    );
  }
}
