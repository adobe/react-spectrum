import classNames from 'classnames';
import {getLocale} from '../src/utils/intl';
import {Provider, useProvider} from '../packages/@react-spectrum/provider';
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

let defaultTheme = {
  light: THEME.light,
  dark: THEME.dark,
  medium: SCALE.medium,
  large: SCALE.large
};

let altTheme = {
  light: THEME.lightest,
  dark: THEME.darkest,
  medium: SCALE.medium,
  large: SCALE.large
};

let themes = {
  light: defaultTheme,
  dark: defaultTheme,
  lightest: altTheme,
  darkest: altTheme
};

export class StoryWrapper extends React.Component {
  state = {
    theme: undefined,
    scale: undefined,
    toastPlacement: 'top'
  };

  componentWillMount() {
    // add lang attribute to html element
    document.documentElement.lang = getLocale();

  }

  render() {
    // Typically themes are provided with both light + dark, and both scales.
    // To build our selector to see all themes, we need to hack it a bit.
    let theme = themes[this.state.theme] || defaultTheme;
    let colorScheme = this.state.theme && this.state.theme.replace(/est$/, '');
    
    return (
      <Provider theme={theme} colorScheme={colorScheme} scale={this.state.scale} toastPlacement={this.state.toastPlacement} locale={this.state.locale}>
        <StoryControls
          theme={this.state.theme}
          onThemeChange={theme => this.setState({theme})}
          onScaleChange={scale => this.setState({scale})}
          onToastPlacementChange={toastPlacement => this.setState({toastPlacement})} />
        <main>
          {this.props.children}
        </main>
      </Provider>
    );
  }
}

function StoryControls({theme, onThemeChange, onScaleChange, onToastPlacementChange}) {
  let {colorScheme, scale, toastPlacement} = useProvider();
  return (
    <aside style={{position: 'absolute', top: 10, right: 20, zIndex: 1}}>
      <ProviderV2 theme={theme || colorScheme} scale={scale} toastPlacement={toastPlacement}>
        <Form style={{borderSpacing: '0 5px', margin: 0}}>
          <FormItem label="Theme">
            <Select onChange={onThemeChange} options={[
              {label: 'Auto', value: undefined},
              {label: "Light", value: "light"},
              {label: "Lightest", value: "lightest"},
              {label: "Dark", value: "dark"},
              {label: "Darkest", value: "darkest"}
            ]} />
          </FormItem>
          <FormItem label="Scale">
            <Select onChange={onScaleChange} options={[
              {label: 'Auto', value: undefined},
              {label: "Medium", value: "medium"},
              {label: "Large", value: "large"}
            ]} />
          </FormItem>
          <FormItem label="Toast Placement">
            <Select onChange={onToastPlacementChange} options={[
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
  );
}