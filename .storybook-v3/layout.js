import classNames from 'classnames';
import {getLocale} from '../src/utils/intl';
import {Provider} from '../packages/@react-spectrum/provider';
import ProviderV2 from '../src/Provider';
import React from 'react';

import themeLight from '@adobe/spectrum-css-temp/vars/spectrum-light-unique.css';
import themeLightest from '@adobe/spectrum-css-temp/vars/spectrum-lightest-unique.css';
import themeDark from '@adobe/spectrum-css-temp/vars/spectrum-dark-unique.css';
import themeDarkest from '@adobe/spectrum-css-temp/vars/spectrum-darkest-unique.css';
import scaleMedium from '@adobe/spectrum-css-temp/vars/spectrum-medium-unique.css';
import scaleLarge from '@adobe/spectrum-css-temp/vars/spectrum-large-unique.css';
import {Form, FormItem} from "@react/react-spectrum/Form";
import Select from "@react/react-spectrum/Select";

const THEME = {
  light: themeLight,
  lightest: themeLightest,
  dark: themeDark,
  darkest: themeDarkest
};

const SCALE = {
  medium: scaleMedium,
  large: scaleLarge
};

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

  componentWillMount() {
    // add lang attribute to html element
    document.documentElement.lang = getLocale();

  }

  render() {
    return (
      <Provider theme={THEME[this.state.theme]} scale={SCALE[this.state.scale]} toastPlacement={this.state.toastPlacement}>
        <aside style={{position: 'fixed', top: 10, right: 20, zIndex: 1}}>
          <ProviderV2 theme={this.state.theme} scale={this.state.scale} toastPlacement={this.state.toastPlacement}>
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
          </ProviderV2>
        </aside>
        <main>
          {this.props.children}
        </main>
      </Provider>
    );
  }
}
