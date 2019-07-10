import graphql from 'graphql';
import Header from '../components/Header';
import mdxComponents from '../mdx_components';
import path from 'path';
import Provider from '@react/react-spectrum/Provider';
import React from 'react';
import {SideNav, SideNavItem} from '@react/react-spectrum/SideNav';
import updateDocumentLang from '../utils/updateDocumentLang';
import updateDocumentTitle from '../utils/updateDocumentTitle';
import './css/index.css';
import './css/prism-okaidia.css';

export default class Guide extends React.Component {
  componentDidMount() {
    updateDocumentLang();
    updateDocumentTitle(this.getTitleFromValue(this.getValueFromLocation()));
  }

  getValueFromLocation() {
    return /(?:\/)(?:(\w+)$)/g.exec(window.location.href)[1];
  }

  getTitleFromValue(value) {
    let guides = this.props.data.guides.edges;
    let guide = guides.filter(guide => value === this.getValueFromGuide(guide))[0];
    return guide ? guide.node.title : null;
  }

  getValueFromGuide(guide) {
    const {name, slug} = guide.node;
    return `${slug || path.basename(name, path.extname(name)).toLowerCase()}`;
  }

  render() {
    let guides = this.props.data.guides.edges;

    return (
      <Provider className="page" theme="dark">
        <Header />
        <div className="page-main">
          <SideNav value={this.props.location.pathname} manageTabIndex typeToSelect autoFocus className="sidebar">
            {guides.map(guide => {
              let href = `/guides/${guide.node.slug || path.basename(guide.node.name, path.extname(guide.node.name)).toLowerCase()}`;
              return (
                <SideNavItem
                  key={guide.node.title}
                  value={href}
                  href={href}>
                  {guide.node.title}
                </SideNavItem>
              );
            })}
          </SideNav>
          <main id="main" className="page-content">
            <div className="documentation">
              {this.props.children({
                ...this.props,
                components: mdxComponents
              })}
            </div>
          </main>
        </div>
      </Provider>
    );
  }
}

export const pageQuery = graphql`
  query GuideQuery {
    guides: allGuidesJson {
      edges {
        node {
          title
          name
          slug
        }
      }
    }
  }
`;
