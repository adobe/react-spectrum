"use client";
import './App.css';
import photos from './photos.json';
import {useLayoutEffect, useMemo, useState} from 'react';
import {Sidebar} from './Sidebar';
import {PhotoGrid} from './PhotoGrid';
import {PhotoDetail} from './PhotoDetail';

type Photo = typeof photos[0];

export default function App() {
  let [album, setAlbum] = useState('library');
  let [library, setLibrary] = useState(photos);
  let [isMobile, setMobile] = useState(false);
  let [sidebarVisible, setSidebarVisible] = useState(false);
  let [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  let visiblePhotos = useMemo(() => album === 'library' ? library : library.filter(p => p.album === album), [album, library]);

  useLayoutEffect(() => {
    let media = matchMedia('(width >= 500px)');
    setMobile(media.matches);
    media.onchange = () => {
      setMobile(media.matches);
    };
  }, []);

  return (
    <div className="app">
      <Sidebar
        // Sidebar is hidden by default on mobile
        isVisible={isMobile ? true : sidebarVisible}
        selectedAlbum={album}
        onSelectionChange={album => {
          setAlbum(album);
          setSidebarVisible(false);
        }}
        onDrop={(album, photoIds) => {
          setLibrary(library.map(photo => photoIds.includes(photo.id) ? { ...photo, album } : photo));
          setAlbum(album);
        }} />
      <div style={{flex: 1, minWidth: 0}} inert={sidebarVisible}>
        <PhotoGrid
          key={album}
          photos={visiblePhotos}
          onAction={setSelectedPhoto}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          hidden={!!selectedPhoto} />
        {selectedPhoto && <PhotoDetail photo={selectedPhoto} onBack={() => setSelectedPhoto(null)} />}
      </div>
    </div>
  );
}
