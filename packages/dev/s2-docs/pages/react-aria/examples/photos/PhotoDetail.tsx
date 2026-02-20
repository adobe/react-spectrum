import './PhotoDetail.css';
import {Button} from 'react-aria-components';
import {ChevronLeft} from 'lucide-react';
import photos from './photos.json';
import {flushSync} from 'react-dom';
import {useEffect, useState} from 'react';

type Photo = typeof photos[0];
interface PhotoDetailProps {
  photo: Photo,
  onBack: () => void
}

export function PhotoDetail({photo, onBack}: PhotoDetailProps) {
  let [src, setSrc] = useState(photo.urls.small);
  useEffect(() => {
    // Start with already loaded thumbnail and swap to larger size image when loaded
    let img = new Image();
    img.onload = () => setSrc(photo.urls.regular);
    img.src = photo.urls.regular;
  }, [photo.urls.regular]);

  return (
    <div className="layout">
      <div className="toolbar">
        <Button
          className="toolbar-Button"
          onPress={() => {
            // Transition back to the grid view
            document.startViewTransition(async () => {
              flushSync(() => onBack());

              // Find corresponding photo in grid and mark it as transitioning.
              let el = document.querySelector('[data-photo-id="' + photo.id + '"]');
              el?.classList.add('photo-transition');
            }).ready.then(() => {
              let el = document.querySelector('[data-photo-id="' + photo.id + '"]');
              el?.classList.remove('photo-transition');
            });
          }}>
          <ChevronLeft size={18} style={{display: 'block'}} />
        </Button>
        <div className="photo-info">
          <span>{photo.username}</span>
          {photo.description && <span>{photo.description}</span>}
        </div>
      </div>
      <div className="photo-detail">
        <img src={src} alt={photo.description || ''} style={{'--width': photo.width, '--height': photo.height} as any} />
      </div>
    </div>
  );
}
