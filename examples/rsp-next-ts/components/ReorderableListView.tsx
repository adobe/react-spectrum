import { Item, ListView, Text, useListData } from "@adobe/react-spectrum";
import { useDragAndDrop } from "@react-spectrum/dnd";
import Folder from "@spectrum-icons/illustrations/Folder";

export default function ReorderableListView() {
  let list = useListData({
    initialItems: [
      { id: "1", type: "file", name: "Adobe Photoshop" },
      { id: "2", type: "file", name: "Adobe XD" },
      { id: "3", type: "folder", name: "Documents", childNodes: [] },
      { id: "4", type: "file", name: "Adobe InDesign" },
      { id: "5", type: "folder", name: "Utilities", childNodes: [] },
      { id: "6", type: "file", name: "Adobe AfterEffects" },
    ],
  });

  // Append a generated key to the item type so they can only be reordered within this list and not dragged elsewhere.
  let { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        let item = list.getItem(key);
        // Setup the drag types and associated info for each dragged item.
        return {
          "custom-app-type-reorder": JSON.stringify(item),
          "text/plain": item?.name ?? '',
        };
      });
    },
    acceptedDragTypes: ["custom-app-type-reorder"],
    onReorder: async (e) => {
      let { keys, target, dropOperation } = e;

      if (target.dropPosition === "before") {
        list.moveBefore(target.key, [...keys]);
      } else if (target.dropPosition === "after") {
        list.moveAfter(target.key, [...keys]);
      }
    },
    getAllowedDropOperations: () => ["move"],
  });

  return (
    <ListView
      aria-label="Reorderable ListView"
      selectionMode="multiple"
      width="size-3600"
      height="size-3600"
      items={list.items}
      dragAndDropHooks={dragAndDropHooks}
    >
      {(item) => (
        <Item textValue={item.name}>
          {item.type === "folder" && <Folder />}
          <Text>{item.name}</Text>
        </Item>
      )}
    </ListView>
  );
}
