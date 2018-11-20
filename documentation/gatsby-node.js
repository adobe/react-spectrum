const path = require("path");
const _ = require("lodash");

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage, createLayout, createRedirect } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const lessonPage = path.resolve("src/templates/lesson.jsx");
    resolve(
      graphql(
        `
          {
            guides: allGuidesJson {
              edges {
                node {
                  title
                  name
                  slug
                }
              }
            }
            allComponentMetadata {
              edges {
                node {
                  displayName
                  id
                }
              }
            }
            componentOverviews: allFile(filter:{relativeDirectory:{eq:"components"},extension:{eq:"mdx"}}) {
              edges {
                node {
                  absolutePath
                  name
                }
              }
            }
            allDocumentationJs(filter:{kind:{eq:"class"}}) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        result.data.guides.edges.forEach(edge => {
          createPage({
            path: `/guides/${edge.node.slug || path.basename(edge.node.name, path.extname(edge.node.name)).toLowerCase()}`,
            component: path.resolve('content/guides', edge.node.name),
            layout: 'guide'
          });
        });

        createRedirect({
          fromPath: '/guides',
          toPath: `/guides/${result.data.guides.edges[0].node.slug || path.basename(result.data.guides.edges[0].node.name, path.extname(result.data.guides.edges[0].node.name)).toLowerCase()}`,
          redirectInBrowser: true
        });

        let groups = _.groupBy(result.data.allComponentMetadata.edges, (edge) => {
          let p = edge.node.id.split(' ')[0].split('/');
          let i = p.lastIndexOf('src');
          return p[i + 1];
        });

        let relatedClasses = {};
        for (let edge of result.data.allDocumentationJs.edges) {
          let p = edge.node.id.split(' ')[1].split('/');
          let i = p.lastIndexOf('src');
          let group = p[i + 1];

          if (!groups[group] || groups[group].find(e => e.node.displayName === edge.node.name)) {
            continue;
          }

          if (!relatedClasses[group]) {
            relatedClasses[group] = [];
          }

          relatedClasses[group].push(edge.node.name);
        }

        Object.keys(groups).forEach(name => {
          let group = groups[name];
          let edge = group.find(e => e.node.displayName === name);
          if (!edge) {
            return;
          }

          let overview = result.data.componentOverviews.edges.find(e => e.node.name === edge.node.displayName);

          createLayout({
            component: path.resolve(`./src/layouts/component.jsx`),
            id: edge.node.displayName,
            context: {
              componentName: edge.node.displayName,
              relatedComponents: new RegExp('^(' + group.map(edge => edge.node.displayName).filter(n => n !== name).join('|') + ')$'),
              relatedClasses: new RegExp('^(' + (relatedClasses[name] || []).join('|') + ')$')
            }
          })
          createPage({
            path: `/components/${edge.node.displayName}`,
            layout: edge.node.displayName,
            component: overview ? overview.node.absolutePath : path.resolve('./content/components/missing.mdx'),
            context: {
              componentName: edge.node.displayName
            }
          })
        });

        createRedirect({
          fromPath: '/components',
          toPath: `/components/${Object.keys(groups).sort()[0]}`,
          redirectInBrowser: true
        });
      })
    );
  });
};

exports.modifyWebpackConfig = ({ config, stage }) => {
  config.loader(`mdx`, {
    test: /\.mdx?$/,
    loaders: ['babel-loader?babelrc=false,presets[]=env,presets[]=react,plugins[]=transform-object-rest-spread', require.resolve('./mdx-loader')],
  });

  config.merge({
    postcss() {}
  });
};
