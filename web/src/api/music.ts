import { apiGet, isOfflineAndroidBuild } from './client';
import { offlineDiscovery, offlineSearch, offlineTracks } from './offlineCatalog';
import { createId } from '../utils/id';
import type { Album, Artist, Playlist, SearchResults, Track } from '../types/music';

type RawArtist = { id?: string; name?: string; image?: { url?: string }[]; isVerified?: boolean; bio?: string | string[] };
type RawSong = { id?: string; name?: string; duration?: number; image?: { quality?: string; url?: string }[]; artists?: { primary?: RawArtist[]; all?: RawArtist[] }; album?: { id?: string; name?: string }; downloadUrl?: { quality?: string; url?: string }[]; explicitContent?: boolean; language?: string; hasLyrics?: boolean };
type RawAlbum = { id?: string; name?: string; image?: { url?: string }[]; year?: number; artists?: { primary?: RawArtist[]; all?: RawArtist[] }; songCount?: number; description?: string; songs?: RawSong[] };
type RawPlaylist = { id?: string; name?: string; image?: { url?: string }[]; description?: string; songs?: RawSong[]; songCount?: number };

const fallbackArtwork = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"%3E%3Crect width="800" height="800" fill="%23151515"/%3E%3Ccircle cx="400" cy="400" r="220" fill="%23212121"/%3E%3Ccircle cx="400" cy="400" r="65" fill="%23ff2d55"/%3E%3C/svg%3E';
const last = <T,>(items?: T[]) => items && items.length ? items[items.length - 1] : undefined;
function image(images?: { quality?: string; url?: string }[]) { return images?.find((item) => item.quality === '500x500')?.url || last(images)?.url || fallbackArtwork; }
function artist(raw?: RawArtist): Artist { return { id: raw?.id || createId('artist'), name: raw?.name || 'Unknown artist', image: image(raw?.image), bio: Array.isArray(raw?.bio) ? raw.bio.join(' ') : raw?.bio, verified: raw?.isVerified }; }

export function track(raw: RawSong): Track {
  const artists = raw.artists?.primary?.length ? raw.artists.primary : raw.artists?.all || [];
  const audio = raw.downloadUrl?.find((item) => item.quality === '160kbps')?.url || last(raw.downloadUrl)?.url;
  return { id: raw.id || createId('track'), title: raw.name || 'Untitled', duration: Number(raw.duration) || 0, image: image(raw.image), artists: artists.map(artist), album: raw.album ? { id: raw.album.id || '', name: raw.album.name || 'Single', image: image(raw.image) } : undefined, streamUrl: audio, explicit: Boolean(raw.explicitContent), language: raw.language, hasLyrics: Boolean(raw.hasLyrics) };
}
function album(raw: RawAlbum): Album { const artists = raw.artists?.primary?.length ? raw.artists.primary : raw.artists?.all || []; return { id: raw.id || createId('album'), name: raw.name || 'Untitled album', image: image(raw.image), year: raw.year, artists: artists.map(artist), songCount: raw.songCount, description: raw.description, songs: raw.songs?.map(track) }; }
function playlist(raw: RawPlaylist): Playlist { return { id: raw.id || createId('playlist'), name: raw.name || 'Untitled playlist', image: image(raw.image), description: raw.description, songs: raw.songs?.map(track) || [], songCount: raw.songCount }; }

export const musicService = {
  async searchSongs(query: string, signal?: AbortSignal) {
    if (isOfflineAndroidBuild) return offlineSearch(query).tracks;
    const data = await apiGet<{ results?: RawSong[] }>(`/api/search/songs?query=${encodeURIComponent(query)}&limit=20`, signal);
    return (data.results || []).map(track);
  },
  async search(query: string, signal?: AbortSignal): Promise<SearchResults> {
    if (isOfflineAndroidBuild) return offlineSearch(query);
    const [tracks, artistsData, albumsData, playlistsData] = await Promise.all([this.searchSongs(query, signal), apiGet<{ results?: RawArtist[] }>(`/api/search/artists?query=${encodeURIComponent(query)}&limit=8`, signal), apiGet<{ results?: RawAlbum[] }>(`/api/search/albums?query=${encodeURIComponent(query)}&limit=8`, signal), apiGet<{ results?: RawPlaylist[] }>(`/api/search/playlists?query=${encodeURIComponent(query)}&limit=8`, signal)]);
    return { tracks, artists: (artistsData.results || []).map(artist), albums: (albumsData.results || []).map(album), playlists: (playlistsData.results || []).map(playlist) };
  },
  async song(id: string) { if (isOfflineAndroidBuild) return offlineTracks.find((item) => item.id === id) || offlineTracks[0]; const data = await apiGet<RawSong[]>(`/api/songs/${encodeURIComponent(id)}`); if (!data[0]) throw new Error('This track is unavailable.'); return track(data[0]); },
  async suggestions(id: string) { if (isOfflineAndroidBuild) return offlineTracks.filter((item) => item.id !== id); return (await apiGet<RawSong[]>(`/api/songs/${encodeURIComponent(id)}/suggestions?limit=12`)).map(track); },
  async artist(id: string) { if (isOfflineAndroidBuild) return offlineSearch('').artists[0]; return artist(await apiGet<RawArtist>(`/api/artists/${encodeURIComponent(id)}?songCount=15&albumCount=12`)); },
  async artistDetails(id: string) { if (isOfflineAndroidBuild) { const results = offlineSearch(''); return { artist: results.artists[0], tracks: results.tracks, albums: results.albums }; } const data = await apiGet<{ name?: string; image?: { url?: string }[]; topSongs?: RawSong[]; topAlbums?: RawAlbum[]; bio?: string | string[]; isVerified?: boolean }>(`/api/artists/${encodeURIComponent(id)}?songCount=15&albumCount=12`); return { artist: artist(data), tracks: (data.topSongs || []).map(track), albums: (data.topAlbums || []).map(album) }; },
  async album(id: string) { if (isOfflineAndroidBuild) return offlineSearch('').albums[0]; return album(await apiGet<RawAlbum>(`/api/albums?id=${encodeURIComponent(id)}`)); },
  async playlist(id: string) { if (isOfflineAndroidBuild) return { id, name: 'Offline Preview', image: offlineTracks[0].image, description: 'Connect a catalog service for live playlists.', songs: offlineTracks }; return playlist(await apiGet<RawPlaylist>(`/api/playlists?id=${encodeURIComponent(id)}&limit=100`)); },
  async discover() { if (isOfflineAndroidBuild) return offlineDiscovery(); const terms = ['new music', 'indie', 'electronic', 'hip hop']; const sets = await Promise.all(terms.map((term) => this.searchSongs(term))); return { hero: sets[0][0], recently: sets[0].slice(1, 7), trending: sets[1].slice(0, 8), releases: sets[2].slice(0, 8), recommendations: sets[3].slice(0, 8) }; },
};
