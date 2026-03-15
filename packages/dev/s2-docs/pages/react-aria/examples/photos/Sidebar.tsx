import {Button, Collection, isTextDropItem, Tree, TreeItem, TreeItemContent, useDragAndDrop} from 'react-aria-components';
import {ChevronRight} from 'lucide-react';
import albums from './albums.json';
import './Sidebar.css';

interface Album {
  id: string,
  name: string,
  children?: Album[]
}

interface SidebarProps {
  selectedAlbum: string,
  onSelectionChange: (albumId: string) => void,
  isVisible: boolean,
  onDrop: (albumId: string, photoIds: string[]) => void
}

export function Sidebar({selectedAlbum, onSelectionChange, isVisible, onDrop}: SidebarProps) {
  // Accept drag and drop to move photos between albums
  let {dragAndDropHooks} = useDragAndDrop({
    acceptedDragTypes: ['photo'],
    shouldAcceptItemDrop: (target) => target.key !== 'library' && target.key !== selectedAlbum,
    onItemDrop: async (e) => {
      let items = await Promise.all(e.items.filter(isTextDropItem).map(async item => JSON.parse(await item.getText('photo')).id));
      onDrop(e.target.key as string, items);
    }
  });

  let renderAlbum = (album: Album) => (
    <TreeItem textValue={album.name} className="sidebar-TreeItem">
      <TreeItemContent>
        {album.children &&
          <Button slot="chevron" className="chevron">
            <ChevronRight size={16} />
          </Button>
        }
        <span>{album.name}</span>
      </TreeItemContent>
      {album.children && <Collection items={album.children}>{renderAlbum}</Collection>}
    </TreeItem>
  );

  return (
    <div className="sidebar" inert={!isVisible}>
      <h1>React Aria Photos</h1>
      <Tree
        aria-label="Folders"
        selectionMode="single"
        disallowEmptySelection
        selectionBehavior="replace"
        selectedKeys={[selectedAlbum]}
        onSelectionChange={keys => onSelectionChange([...keys][0] as string)}
        dragAndDropHooks={dragAndDropHooks}
        className="sidebar-Tree">
        <TreeItem id="library" textValue="All Photos" className="sidebar-TreeItem">
          <TreeItemContent>All Photos</TreeItemContent>
        </TreeItem>
        <Collection items={albums}>{renderAlbum}</Collection>
      </Tree>
    </div>
  );
}
