# @react-aria/parcel-resolver-optimize-locales

A Parcel resolver plugin to optimize React Aria to only include translated strings for locales that your app supports.

## Configuration

Add the following to your `.parcelrc`:

```json
{
  "extends": "@parcel/config-default",
  "resolvers": ["@react-aria/parcel-resolver-optimize-locales", "..."]
}
```

Then, in your `package.json`, add a `"locales"` field:

```json
{
  "locales": ["en-US", "fr-FR"]
}
```

Any strings for locales other than the ones listed here will be removed from your bundle. See the [documentation](https://react-spectrum.adobe.com/react-aria/internationalization.html#supported-locales) for a full list of supported locales.
