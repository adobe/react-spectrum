const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle}) {
    // Content hashing plant images messes up RSC parsing, and we don't expect these to ever change.
    let asset = bundle.getMainEntry();
    if (asset && asset.filePath.startsWith(path.join(__dirname, 'pages/react-aria/examples/plants/plants'))) {
      return 'assets/plants/' + path.basename(asset.filePath);
    }
  }
});
