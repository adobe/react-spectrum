import './PhotoGrid.css';
import {Autocomplete, Button, GridList, GridListItem, Input, SearchField, Size, Slider, SliderThumb, SliderTrack, useDragAndDrop, useFilter, Virtualizer, WaterfallLayout} from 'react-aria-components';
import {MenuIcon, Move} from 'lucide-react';
import photos from './photos.json';
import {useLayoutEffect, useRef, useState} from 'react';
import {flushSync} from 'react-dom';

type Photo = typeof photos[0];

interface PhotoGridProps {
  photos: typeof photos,
  onAction: (photo: Photo) => void,
  toggleSidebar: () => void,
  hidden: boolean
}

export function PhotoGrid({photos, onAction, hidden, toggleSidebar}: PhotoGridProps) {
  let {contains} = useFilter({sensitivity: 'base'});
  let [size, setSize] = useState(200);

  useLayoutEffect(() => {
    let media = matchMedia('(width < 500px)');
    setSize(media.matches ? 150 : 200);
    media.onchange = () => {
      setSize(media.matches ? 150 : 200);
    };
  }, []);

  // Photos can be dragged to move between albums.
  let {dragAndDropHooks} = useDragAndDrop({
    getItems: (keys, items) => items.map(item => ({ photo: JSON.stringify(item) })),
    renderDragPreview: (items) => {
      let photos = items.map(item => JSON.parse(item.photo));
      return (
        // Render a stack of photos with the total count of dragged items
        <div className="drag-preview">
          {photos.slice(0, 3).map(photo => {
            const isLandscape = photo.width > photo.height;
            return <img src={photo.urls.small} key={photo.id} style={isLandscape ? {width: 100, aspectRatio: `${photo.width}/${photo.height}`} : {height: 100, aspectRatio: `${photo.width}/${photo.height}`}} />
          })}
          {photos.length > 0 && <span>{photos.length}</span>}
        </div>
      );
    }
  });

  return (
    <div className="layout" style={hidden ? {visibility: 'hidden', position: 'absolute'} : undefined}>
      <Autocomplete filter={contains} disableVirtualFocus>
        <div className="toolbar">
          <Button
            id="toggle-sidebar"
            onPress={toggleSidebar}
            className="toolbar-Button">
            <MenuIcon size={18} />
          </Button>
          <Slider
            aria-label="Photo size"
            className="toolbar-Slider"
            minValue={100}
            maxValue={400}
            step={40}
            value={size}
            onChange={setSize}>
            <SliderTrack>
              <SliderThumb />
            </SliderTrack>
          </Slider>
          <SearchField
            aria-label="Search"
            className="toolbar-SearchField">
            <Input placeholder="Search" />
          </SearchField>
        </div>
        <Virtualizer layout={WaterfallLayout} layoutOptions={{minItemSize: new Size(size, size)}}>
          <GridList
            aria-label="Photos"
            items={photos}
            selectionMode="multiple"
            selectionBehavior="replace"
            layout="grid"
            dragAndDropHooks={dragAndDropHooks}
            className="photo-grid">
            {photo => <PhotoItem photo={photo} onAction={onAction} />}
          </GridList>
        </Virtualizer>
      </Autocomplete>
    </div>
  );
}

interface PhotoItemProps {
  photo: Photo,
  onAction: (key: Photo) => void
}

function PhotoItem({photo, onAction}: PhotoItemProps) {
  let imgRef = useRef<HTMLImageElement | null>(null);
  return (
    <GridListItem
      id={photo.id}
      value={photo}
      textValue={photo.description || photo.username}
      className="photo-item"
      onAction={() => {
        // Transition to the detail view
        imgRef.current!.classList.add('photo-transition');
        document.startViewTransition(() => {
          imgRef.current!.classList.remove('photo-transition');
          flushSync(() => onAction(photo));
        })
      }}>
      <div className="photo-container" style={{aspectRatio: `${photo.width}/${photo.height}`}}>
        <img ref={imgRef} alt={photo.description || ''} src={photo.urls.small} data-photo-id={photo.id} draggable={false} />
      </div>
      <Button slot="drag" className="drag-button">
        <Move size={16} />
      </Button>
    </GridListItem>
  );
}
