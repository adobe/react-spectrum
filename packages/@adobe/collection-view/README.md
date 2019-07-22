# collection-view

`CollectionView` renders a scrollable collection of data using customizable layouts,
and manages animated updates to the data over time. It supports very large collections by
only rendering visible views to the DOM, reusing them as you scroll. Collection views can
present any type of view, including non-item views such as section headers and footers.
Optionally, the `EditableCollectionView` subclass can be used to enable user interaction
with the collection, including drag and drop, multiple selection, and keyboard interacton.

## Example

`CollectionView` has a complex API supporting many features, with many collaborating objects
involved. The following example shows how to setup a basic collection view. See the more
in-depth [class documentation](https://git.corp.adobe.com/pages/React/collection-view/docs/)
for more details.

```javascript
import {EditableCollectionView, ArrayDataSource, StackLayout, Size} from '@react/collection-view';

class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.layout = new StackLayout({
      showHeaders: false
    });
  }

  render() {
    return (
      <EditableCollectionView
        dataSource={new ArrayDataSource([['one', 'two', 'three']])}
        layout={this.layout}
        delegate={this} />
    );
  }

  // This delegate method is called by the StackLayout to estimate the size of items
  // in the collection-view before they become visible. The real size will be
  // used once they scroll into view.
  estimateSize(content) {
    return new Size(100, 100);
  }

  // This delegate method renders the content of an item
  renderItemView(type, content) {
    return <div>{content}</div>;
  }
}
```

This example can be found in the `example/` folder as well. To run it:

```shell
make run-example
```
