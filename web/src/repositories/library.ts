import { createId } from '../utils/id';
import type { Album, Artist, LibraryState, Playlist, Track } from '../types/music';

const KEY = 'sonora-library-v1';
const INITIAL: LibraryState = { favoriteTrackIds: [], favoriteTracks: [], favoriteArtistIds: [], favoriteArtists: [], favoriteAlbumIds: [], favoriteAlbums: [], favoritePlaylistIds: [], favoritePlaylists: [], history: [], customPlaylists: [] };

function read(): LibraryState {
  try { return { ...INITIAL, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return INITIAL; }
}
function write(value: LibraryState) { localStorage.setItem(KEY, JSON.stringify(value)); }
function toggle(items: string[], id: string) { return items.includes(id) ? items.filter((item) => item !== id) : [id, ...items]; }

export const libraryRepository = {
  get: read,
  save: write,
  toggleTrack(track: Track) { const state = read(); state.favoriteTrackIds = toggle(state.favoriteTrackIds, track.id); state.favoriteTracks = state.favoriteTrackIds.includes(track.id) ? [track, ...state.favoriteTracks.filter((item) => item.id !== track.id)] : state.favoriteTracks.filter((item) => item.id !== track.id); write(state); return state; },
  toggleArtist(artist: Artist) { const state = read(); state.favoriteArtistIds = toggle(state.favoriteArtistIds, artist.id); state.favoriteArtists = state.favoriteArtistIds.includes(artist.id) ? [artist, ...state.favoriteArtists.filter((item) => item.id !== artist.id)] : state.favoriteArtists.filter((item) => item.id !== artist.id); write(state); return state; },
  toggleAlbum(album: Album) { const state = read(); state.favoriteAlbumIds = toggle(state.favoriteAlbumIds, album.id); state.favoriteAlbums = state.favoriteAlbumIds.includes(album.id) ? [album, ...state.favoriteAlbums.filter((item) => item.id !== album.id)] : state.favoriteAlbums.filter((item) => item.id !== album.id); write(state); return state; },
  togglePlaylist(playlist: Playlist) { const state = read(); state.favoritePlaylistIds = toggle(state.favoritePlaylistIds, playlist.id); state.favoritePlaylists = state.favoritePlaylistIds.includes(playlist.id) ? [playlist, ...state.favoritePlaylists.filter((item) => item.id !== playlist.id)] : state.favoritePlaylists.filter((item) => item.id !== playlist.id); write(state); return state; },
  addHistory(track: Track) { const state = read(); state.history = [track, ...state.history.filter((item) => item.id !== track.id)].slice(0, 50); write(state); return state; },
  createPlaylist(name: string, description = '') { const state = read(); const playlist: Playlist = { id: createId('playlist'), name, description, songs: [] }; state.customPlaylists = [playlist, ...state.customPlaylists]; write(state); return state; },
  addToPlaylist(playlistId: string, track: Track) { const state = read(); state.customPlaylists = state.customPlaylists.map((playlist) => playlist.id === playlistId && !playlist.songs.some((song) => song.id === track.id) ? { ...playlist, songs: [...playlist.songs, track] } : playlist); write(state); return state; },
  removeFromPlaylist(playlistId: string, trackId: string) { const state = read(); state.customPlaylists = state.customPlaylists.map((playlist) => playlist.id === playlistId ? { ...playlist, songs: playlist.songs.filter((song) => song.id !== trackId) } : playlist); write(state); return state; },
  reorderPlaylist(playlistId: string, from: number, to: number) { const state = read(); state.customPlaylists = state.customPlaylists.map((playlist) => { if (playlist.id !== playlistId) return playlist; const songs = [...playlist.songs]; const [song] = songs.splice(from, 1); songs.splice(to, 0, song); return { ...playlist, songs }; }); write(state); return state; },
  renamePlaylist(playlistId: string, name: string, description: string) { const state = read(); state.customPlaylists = state.customPlaylists.map((playlist) => playlist.id === playlistId ? { ...playlist, name, description } : playlist); write(state); return state; },
  deletePlaylist(playlistId: string) { const state = read(); state.customPlaylists = state.customPlaylists.filter((playlist) => playlist.id !== playlistId); write(state); return state; },
};
