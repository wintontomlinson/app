import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { AlbumPage, ArtistPage, PlaylistPage, SongPage } from './pages/DetailPages';
import { HistoryPage, LibraryPage, LikedPage, SettingsPage, SimpleCollection } from './pages/CollectionPages';
import { HomePage } from './pages/HomePage';
import { NowPlayingPage } from './pages/NowPlayingPage';
import { SearchPage } from './pages/SearchPage';

function TitleManager() { const location = useLocation(); useEffect(() => { const title = location.pathname === '/' ? 'Home' : location.pathname.slice(1).split('/')[0].replace(/\b\w/g, (letter) => letter.toUpperCase()); document.title = `${title} · Sonora Music`; }, [location.pathname]); return null; }
export function App() { return <><TitleManager /><Routes><Route path="/now-playing" element={<NowPlayingPage />} /><Route element={<AppShell />}><Route path="/" element={<HomePage />} /><Route path="/search" element={<SearchPage />} /><Route path="/artist/:id" element={<ArtistPage />} /><Route path="/album/:id" element={<AlbumPage />} /><Route path="/playlist/:id" element={<PlaylistPage />} /><Route path="/song/:id" element={<SongPage />} /><Route path="/library" element={<LibraryPage />} /><Route path="/liked" element={<LikedPage />} /><Route path="/history" element={<HistoryPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/albums" element={<SimpleCollection title="Albums" kind="albums" />} /><Route path="/artists" element={<SimpleCollection title="Artists" kind="artists" />} /><Route path="/playlists" element={<SimpleCollection title="Playlists" kind="playlists" />} /><Route path="/genres" element={<SimpleCollection title="Genres" kind="genres" />} /></Route><Route path="*" element={<Navigate to="/" replace />} /></Routes></>; }
