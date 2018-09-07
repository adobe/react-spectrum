module.exports = {
  siteMetadata: {
    siteUrl: 'http://react-spectrum.corp.adobe.com'
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "posts",
        path: `${__dirname}/content/`
      }
    },
    "gatsby-transformer-remark",
    {
      resolve: "gatsby-plugin-nprogress",
      options: {
        color: 'rgb(205, 205, 205)'
      }
    },
    "gatsby-plugin-catch-links",
    "gatsby-plugin-meta-redirect",
    "gatsby-plugin-sitemap",
    "gatsby-transformer-json",
    `gatsby-transformer-documentationjs`,
    `gatsby-transformer-react-docgen`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `source`,
        path: `${__dirname}/../src/`,
      },
    }
  ]
};
