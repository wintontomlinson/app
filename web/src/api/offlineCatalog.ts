import type { SearchResults, Track } from '../types/music';

const artwork = (color: string, accent: string, mark: string) => `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Crect width='800' height='800' fill='${encodeURIComponent(color)}'/%3E%3Cpath d='M0 580 C180 460 320 710 800 390 L800 800 L0 800Z' fill='${encodeURIComponent(accent)}' opacity='.9'/%3E%3Ctext x='65' y='110' fill='white' font-family='Arial' font-size='58' font-weight='700' letter-spacing='6'%3ESONORA%3C/text%3E%3Ctext x='65' y='705' fill='white' font-family='Arial' font-size='100' font-weight='700'%3E${encodeURIComponent(mark)}%3C/text%3E%3C/svg%3E`;

export const offlineTracks: Track[] = [
  { id: 'offline-night-drive', title: 'Night Drive', duration: 224, image: artwork('#25212a', '#ff2d55', '01'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#25212a', '#ff2d55', '01') }, explicit: false, hasLyrics: false },
  { id: 'offline-signal', title: 'Signal', duration: 197, image: artwork('#1e2526', '#5f8690', '02'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#1e2526', '#5f8690', '02') }, explicit: false, hasLyrics: false },
  { id: 'offline-afterimage', title: 'Afterimage', duration: 239, image: artwork('#29211c', '#dc8a4d', '03'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#29211c', '#dc8a4d', '03') }, explicit: false, hasLyrics: false },
  { id: 'offline-midnight', title: 'Midnight Motion', duration: 211, image: artwork('#1e1f32', '#6371c5', '04'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#1e1f32', '#6371c5', '04') }, explicit: false, hasLyrics: false },
  { id: 'offline-quiet', title: 'Quiet Hours', duration: 252, image: artwork('#222222', '#858585', '05'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#222222', '#858585', '05') }, explicit: false, hasLyrics: false },
  { id: 'offline-flare', title: 'Soft Flare', duration: 205, image: artwork('#301c2a', '#c65688', '06'), artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], album: { id: 'offline-preview', name: 'Offline Preview', image: artwork('#301c2a', '#c65688', '06') }, explicit: false, hasLyrics: false },
];

export function offlineSearch(query: string): SearchResults {
  const normalized = query.trim().toLowerCase();
  const tracks = normalized ? offlineTracks.filter((track) => `${track.title} ${track.album?.name}`.toLowerCase().includes(normalized)).concat(offlineTracks).filter((track, index, list) => list.findIndex((item) => item.id === track.id) === index) : offlineTracks;
  return { tracks, artists: [{ id: 'offline-sonora', name: 'Sonora Preview', image: offlineTracks[0].image }], albums: [{ id: 'offline-preview', name: 'Offline Preview', image: offlineTracks[0].image, artists: [{ id: 'offline-sonora', name: 'Sonora Preview' }], songCount: offlineTracks.length, songs: offlineTracks }], playlists: [] };
}

export function offlineDiscovery() {
  return { hero: offlineTracks[0], recently: offlineTracks.slice(1), trending: offlineTracks.slice(0, 5), releases: offlineTracks.slice(1), recommendations: offlineTracks.slice().reverse() };
}
