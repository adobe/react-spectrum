# Generating icon packages

A4U creates React components of icon sets. These are useful to use standalone, however, they cannot automatically pick up things like the color or scale from a React Spectrum application.

To use your custom icon sets from A4U the same way that you can use our core set of icons, we have this build tool which will take all the icons in a package you point to and wrap them in our `<Icon>` component.
1. declare a dependency on and link to our `@spectrum-icons/build-tools` module
1. create a script in your project that
  - defines a template for wrapping the icons
  - defines an export name regex so the correct component name is used
  - specifies the package directory where the icons are coming from
  - specifies a directory where the wrapped icons will go
1. run this script post-install so that your assets are ready along with everything else after you run `npm/yarn install`

For an example, look at `@spectrum-icons/workflow/scripts`.
