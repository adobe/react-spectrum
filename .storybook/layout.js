import classNames from 'classnames';
import {Form, FormItem} from '../src/Form';
import {getLocale} from '../src/utils/intl';
import Provider from '../src/Provider';
import React from 'react';
import reactAxe from 'react-axe';
import ReactDOM from 'react-dom';
import Select from '../src/Select';

export function VerticalCenter({children, className, style}) {
  return (
    <div
      className={ classNames('react-spectrum-story', className) }
      style={
        {
          position: 'absolute',
          transform: 'translate(0px, -50%)',
          top: '50%',
          left: 0,
          right: 0,
          textAlign: 'center',
          ...style
        }
      }
    >
      { children }
    </div>
  );
}

export function VerticalTop({children, className, style}) {
  return (
    <div
      className={ classNames('react-spectrum-story', className) }
      style={
        {
          position: 'relative',
          top: 0,
          left: 0,
          right: 0,
          ...style
        }
      }
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
  }

  componentWillMount() {
    // add lang attribute to html element
    document.documentElement.lang = getLocale();

    // load react-axe to log Accessibility issues to console
    reactAxe(React, ReactDOM, 500);
  }

  render() {
    return (
      <Provider theme={this.state.theme} scale={this.state.scale} toastPlacement={this.state.toastPlacement}>
        <aside style={{position: 'absolute', right: 100}}>
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
        <main>
          {this.props.children}
        </main>
      </Provider>
    );
  }
}
