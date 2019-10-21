import classNames from 'classnames';
import {Form, FormItem} from '../src/Form';
import {getLocale} from '../src/utils/intl';
import Provider from '../src/Provider';
import React from 'react';
import Select from '../src/Select';

export function VerticalCenter({children, className, style}) {
  return (
    <div
      className={ classNames('react-spectrum-story', className) }
      style={style}
    >
      { children }
    </div>
  );
}

export class StoryWrapper extends React.Component {
  state= {
    theme: 'light',
    scale: 'medium',
    toastPlacement: 'top'
  };

  componentDidMount() {
    // add lang attribute to html element
    document.documentElement.lang = getLocale();

  }

  render() {
    return (
      <Provider theme={this.state.theme} scale={this.state.scale} toastPlacement={this.state.toastPlacement}>
        <aside style={{position: 'fixed', top: 10, right: 20, zIndex: 1}}>
          <Form style={{borderSpacing: '0 5px', margin: 0}}>
            <FormItem label="Theme">
              <Select onChange={theme => this.setState({theme})} options={[{label: "Light", value: "light"}, {label: "Lightest", value: "lightest"}, {label: "Dark", value: "dark"}, {label: "Darkest", value: "darkest"}]} />
            </FormItem>
            <FormItem label="Scale">
              <Select onChange={scale => this.setState({scale})} options={[{label: "Medium", value: "medium"}, {label: "Large", value: "large"}]} />
            </FormItem>
            <FormItem label="Toast Placement">
              <Select onChange={toastPlacement => this.setState({toastPlacement})} options={[
                {label: 'top', value: 'top'},
                {label: 'top left', value: 'top left'},
                {label: 'top center', value: 'top center'},
                {label: 'top right', value: 'top right'},
                {label: 'bottom', value: 'bottom'},
                {label: 'bottom left', value: 'bottom left'},
                {label: 'bottom center', value: 'bottom center'},
                {label: 'bottom right', value: 'bottom right'}
              ]} />
            </FormItem>
          </Form>
        </aside>
        <main id="main">
          {this.props.children}
        </main>
      </Provider>
    );
  }
}
