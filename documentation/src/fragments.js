export const componentFieldsFragment = graphql`
  fragment componentFields on ComponentMetadata {
    displayName
    docblock
    description {
      text
      childMarkdownRemark {
        html
      }
    }
    methods {
      name
      description
      params {
        name
      }
      docblock
    }
    props {
      name
      type {
        name
        value
      }
      required
      description {
        text
        childMarkdownRemark {
          html
        }
      }
      defaultValue {
        value
      }
    }
  }
`;

export const docFieldsFragment = graphql`
  fragment docFields on DocumentationJs {
    id
    name
    description {
      childMarkdownRemark {
        html
      }
    }
    returns {
      title
    }
    memberof
    scope
    params {
      name
      type {
        name
      }
      description {
        childMarkdownRemark {
          html
        }
      }
    }
    members {
      instance {
        name
        abstract
        description {
          childMarkdownRemark {
            html
          }
        }
        params {
          name
          type {
            name
          }
        }
        tags {
          title
          description
        }
        returns {
          type {
            name
          }
        }
      }
    }
  }
`;
