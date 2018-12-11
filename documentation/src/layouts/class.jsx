import 'babel-polyfill';
import React from 'react';
import Heading from '@react/react-spectrum/Heading';
import mdxComponents from '../mdx_components';
import ClassAPI from '../components/ClassAPI';
import DocsPage from '../components/DocsPage';
import '../fragments';
import './css/index.css';
import './css/prism-okaidia.css';

export default class ClassLayout extends React.Component {
  render() {
    let { children } = this.props;
    let classDoc = this.props.data.classDoc;
    let relatedClasses = this.props.data.relatedClasses && this.props.data.relatedClasses.edges.sort((a, b) => 
      a.node.name < b.node.name ? -1 : 1
    );

    let overview = children({
      ...this.props,
      components: mdxComponents
    });

    return (
      <DocsPage overview={overview} data={this.props.data} selectedItem={classDoc.name}>
        <ClassAPI node={classDoc} />
        {relatedClasses && relatedClasses.map(edge =>
          <section key={edge.node.id}>
            <Heading size={1}>{edge.node.name}</Heading>
            <ClassAPI node={edge.node} />
          </section>
        )}
      </DocsPage>
    );
  }
}

export const pageQuery = graphql`
  query ClassLayoutQuery($className: String, $relatedClasses: String) {
    allComponents:allComponentMetadata(sort:{fields:[displayName]}) {
      edges {
        node {
          id
          displayName
        }
      }
    }
    allClasses:allDocumentationJs {
      edges {
        node {
          id
          name
        }
      }
    }
    classDoc:documentationJs(name:{eq:$className}) {
      ...docFields
    }
    relatedClasses:allDocumentationJs(filter:{name:{regex:$relatedClasses}}) {
      edges {
        node {
          ...docFields
        }
      }
    }
  }
`;
