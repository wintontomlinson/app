export type ImageLink = { quality: string; url: string };

export type Artist = {
  id: string;
  name: string;
  image?: string;
  bio?: string;
  verified?: boolean;
};

export type Album = {
  id: string;
  name: string;
  image?: string;
  year?: number;
  artists: Artist[];
  songCount?: number;
  description?: string;
  songs?: Track[];
};

export type Track = {
  id: string;
  title: string;
  duration: number;
  image?: string;
  artists: Artist[];
  album?: Pick<Album, 'id' | 'name' | 'image'>;
  streamUrl?: string;
  explicit: boolean;
  language?: string;
  hasLyrics: boolean;
};

export type Playlist = {
  id: string;
  name: string;
  image?: string;
  description?: string;
  songs: Track[];
  songCount?: number;
};

export type SearchResults = {
  tracks: Track[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
};

export type PlaybackState = {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  loading: boolean;
  buffering: boolean;
  error: string | null;
  playerExpanded: boolean;
};

export type LibraryState = {
  favoriteTrackIds: string[];
  favoriteTracks: Track[];
  favoriteArtistIds: string[];
  favoriteArtists: Artist[];
  favoriteAlbumIds: string[];
  favoriteAlbums: Album[];
  favoritePlaylistIds: string[];
  favoritePlaylists: Playlist[];
  history: Track[];
  customPlaylists: Playlist[];
};
