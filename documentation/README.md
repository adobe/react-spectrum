# Contributing Documentation

The react-spectrum documentation website includes documentation about each component, along with guides about various topics. It uses [Gatsby](https://www.gatsbyjs.org/) as a framework, which allows us to do GraphQL queries for data about files on the filesystem, extract data from each component's source files, import markdown and more. The [code](https://github.com/adobe/react-spectrum/tree/master/documentation) lives in the same repo as the rest of react-spectrum, under the `documentation` folder.

There are two main sections of the site: guides, component documentation.

## Guides

Guides are general tutorials about react-spectrum. They live in `documentation/content/guides`, and are MDX files, which are markdown but allow allow inline React elements so you can include running examples. There is a table of contents in `guides.json` which lists the title and filename of each page. If you are adding a guide, make sure to add it there as well.

The guides generally shouldn't be about a specific component - that information should live in the component level overview. But information about setting up projects, migrating from other frameworks, how to use multiple components together, etc. should live in guides.

## Component Documentation

For each component in react-spectrum, we have API documentation, which lists the available props and methods for the component, along with an overview with some description about how the component works along with some examples.

### Adding API documentation

We would like for all props and public methods of the components to be documented. This is done using a combination of React PropTypes, and JSDoc-style comments before each prop and method. These will be automatically extracted when building the site. Here's an example.

```javascript
import PropTypes from 'prop-types';
import React from 'react';

class SomeComponent extends React.Component {
  static propTypes = {
    /** Here is a description for the className prop */
    className: PropTypes.string,

    /** Here is a description for the size prop */
    size: PropTypes.number
  };

  /**
   * Here is a description for the somePublicMethod method.
   * @param {string} foo
   * @return {number}
   */
  somePublicMethod(foo) {
    return 4;
  }

  render() {
    return <div>Hello world</div>;
  }
}
```

If you want to mark a method as private, but still document it for internal use, you can add the `@private` tag.

### Adding a component overview

In addition to API docs, we also have component level overviews, which provide more description about how to use each component, along with some code examples. These are MDX files which live in the `documentation/content/components` folder.

The content of each overview will depend on the component its documenting, but in general there should be a few sections:

1. A highlevel description about what the component does, and what you would use it for. These can be found on the main [spectrum design website](http://spectrum.corp.adobe.com) as well.
2. An example, showing some code that demonstrates clearly how to use that component, along with its output running inline.
3. Some description about each of the variants, states, and events that the component supports, along with how to provide data/content to the component. For components with datasources, some description about how to set up and use the datasources would also be helpful.
4. Information about internationalization and accessibility requirements that clients will need to worry about.
