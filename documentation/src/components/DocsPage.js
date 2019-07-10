import Header from './Header';
import Heading from '@react/react-spectrum/Heading';
import Provider from '@react/react-spectrum/Provider';
import React from 'react';
import {SideNav, SideNavItem} from '@react/react-spectrum/SideNav';
import {Tab, TabView} from '@react/react-spectrum/TabView';

export default class DocsPage extends React.Component {
  render() {
    let components = this.props.data.allComponents.edges.filter(c => c.node.id.includes(`src/${c.node.displayName}/`));
    let componentSet = new Set(components.map(c => c.node.displayName));
    let classes = this.props.data.allClasses.edges.filter(c => c.node.id.includes(`src/${c.node.name}/`) && !componentSet.has(c.node.name));

    return (
      <Provider className="page component-page" theme="dark">
        <Header className="page-header" />
        <div className="page-main">
          <SideNav variant="multiLevel" value={this.props.selectedItem} autoFocus className="sidebar">
            <SideNavItem label="Components">
              {components.map(edge => (
                <SideNavItem
                  key={edge.node.displayName}
                  href={`/components/${edge.node.displayName}`}
                  value={edge.node.displayName}>
                  {edge.node.displayName}
                </SideNavItem>
              ))}
            </SideNavItem>
            <SideNavItem label="Data Sources">
              {classes.map(edge => (
                <SideNavItem
                  key={edge.node.name}
                  href={`/classes/${edge.node.name}`}
                  value={edge.node.name}>
                  {edge.node.name}
                </SideNavItem>
              ))}
            </SideNavItem>
          </SideNav>
          <main id="main" className="page-content">
            <div className="documentation">
              <Heading variant="display">{this.props.selectedItem}</Heading>
              <TabView>
                <Tab label="Overview">
                  {this.props.overview}
                </Tab>
                <Tab label="API">
                  {this.props.children}
                </Tab>
              </TabView>
            </div>
          </main>
        </div>
      </Provider>
    );
  }
}
