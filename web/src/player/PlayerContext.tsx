import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type PropsWithChildren } from 'react';
import { AudioEngine } from './AudioEngine';
import { libraryRepository } from '../repositories/library';
import type { LibraryState, PlaybackState, Playlist, Track } from '../types/music';

const INITIAL: PlaybackState = {
  currentTrack: null, queue: [], queueIndex: -1, isPlaying: false, currentTime: 0, duration: 0,
  volume: 0.8, muted: false, shuffle: false, repeatMode: 'off', loading: false, buffering: false, error: null, playerExpanded: false,
};

type PlayerContextValue = {
  state: PlaybackState;
  library: LibraryState;
  play: (track: Track, context?: Track[]) => Promise<void>;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track, next?: boolean) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  reorderQueue: (from: number, to: number) => void;
  toggleFavorite: (track: Track) => void;
  toggleFavoriteAlbum: (album: import('../types/music').Album) => void;
  toggleFavoriteArtist: (artist: import('../types/music').Artist) => void;
  toggleFavoritePlaylist: (playlist: import('../types/music').Playlist) => void;
  createPlaylist: (name: string, description?: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylist: (playlistId: string, from: number, to: number) => void;
  renamePlaylist: (playlistId: string, name: string, description: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setExpanded: (value: boolean) => void;
  toggleQueue: () => void;
  queueOpen: boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function reducer(state: PlaybackState, patch: Partial<PlaybackState>) { return { ...state, ...patch }; }

function getPersisted(): Partial<PlaybackState> {
  try { return JSON.parse(localStorage.getItem('sonora-playback-v1') || '{}'); } catch { return {}; }
}

export function PlayerProvider({ children }: PropsWithChildren) {
  const [state, patch] = useReducer(reducer, { ...INITIAL, ...getPersisted(), isPlaying: false, loading: false, buffering: false, error: null });
  const [library, setLibrary] = useReducer((_: LibraryState, next: LibraryState) => next, libraryRepository.get());
  const [queueOpen, setQueueOpen] = useReducer((value) => !value, false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const engine = useRef<AudioEngine | null>(null);

  const next = useCallback(async () => {
    const current = stateRef.current;
    if (!current.queue.length) return;
    let nextIndex = current.queueIndex + 1;
    if (current.repeatMode === 'one' && current.currentTrack) nextIndex = current.queueIndex;
    else if (current.shuffle && current.queue.length > 1) {
      do nextIndex = Math.floor(Math.random() * current.queue.length); while (nextIndex === current.queueIndex);
    } else if (nextIndex >= current.queue.length) {
      if (current.repeatMode !== 'all') { patch({ isPlaying: false, currentTime: 0 }); return; }
      nextIndex = 0;
    }
    const track = current.queue[nextIndex];
    patch({ currentTrack: track, queueIndex: nextIndex, currentTime: 0, duration: track.duration, loading: true, error: null });
    try { await engine.current?.load(track.streamUrl); await engine.current?.play(); patch({ isPlaying: true, loading: false }); }
    catch (error) { patch({ isPlaying: false, loading: false, error: error instanceof Error ? error.message : 'Playback failed.' }); }
  }, []);

  useEffect(() => {
    engine.current = new AudioEngine({
      time: (currentTime, duration) => patch({ currentTime, duration: duration || stateRef.current.currentTrack?.duration || 0 }),
      status: ({ loading, buffering }) => patch({ loading, buffering }),
      ended: () => { void next(); },
      error: (message) => patch({ isPlaying: false, loading: false, buffering: false, error: message }),
    });
    engine.current.setVolume(stateRef.current.volume);
    const saved = stateRef.current;
    if (saved.currentTrack?.streamUrl) {
      void engine.current.load(saved.currentTrack.streamUrl).then(() => engine.current?.seek(saved.currentTime)).catch(() => patch({ error: 'Your previous track is no longer available.' }));
    }
    return () => engine.current?.destroy();
  }, [next]);

  useEffect(() => {
    const saved = { ...state, isPlaying: false, loading: false, buffering: false, error: null };
    localStorage.setItem('sonora-playback-v1', JSON.stringify(saved));
  }, [state]);

  const play = useCallback(async (track: Track, context?: Track[]) => {
    const list = context?.length ? context : stateRef.current.queue.some((item) => item.id === track.id) ? stateRef.current.queue : [track];
    const index = list.findIndex((item) => item.id === track.id);
    patch({ currentTrack: track, queue: list, queueIndex: Math.max(index, 0), currentTime: 0, duration: track.duration, loading: true, error: null });
    const updated = libraryRepository.addHistory(track); setLibrary(updated);
    try { await engine.current?.load(track.streamUrl); await engine.current?.play(); patch({ isPlaying: true, loading: false }); }
    catch (error) { patch({ isPlaying: false, loading: false, error: error instanceof Error ? error.message : 'Playback failed.' }); }
  }, []);

  const toggle = useCallback(async () => {
    if (!stateRef.current.currentTrack) return;
    if (stateRef.current.isPlaying) { engine.current?.pause(); patch({ isPlaying: false }); return; }
    try { await engine.current?.play(); patch({ isPlaying: true, error: null }); }
    catch { await play(stateRef.current.currentTrack, stateRef.current.queue); }
  }, [play]);

  const previous = useCallback(async () => {
    if (stateRef.current.currentTime > 4) { engine.current?.seek(0); patch({ currentTime: 0 }); return; }
    const index = stateRef.current.queueIndex > 0 ? stateRef.current.queueIndex - 1 : stateRef.current.queue.length - 1;
    const track = stateRef.current.queue[index];
    if (track) await play(track, stateRef.current.queue);
  }, [play]);

  const value = useMemo<PlayerContextValue>(() => ({
    state, library,
    play, toggle, next, previous,
    seek: (value) => { engine.current?.seek(value); patch({ currentTime: value }); },
    setVolume: (value) => { engine.current?.setVolume(value); patch({ volume: value }); },
    toggleMute: () => { const muted = !stateRef.current.muted; engine.current?.setMuted(muted); patch({ muted }); },
    toggleShuffle: () => patch({ shuffle: !stateRef.current.shuffle }),
    cycleRepeat: () => patch({ repeatMode: stateRef.current.repeatMode === 'off' ? 'all' : stateRef.current.repeatMode === 'all' ? 'one' : 'off' }),
    addToQueue: (track, next = false) => { const queue = [...stateRef.current.queue]; queue.splice(next ? Math.max(0, stateRef.current.queueIndex + 1) : queue.length, 0, track); patch({ queue }); },
    removeFromQueue: (index) => { const queue = stateRef.current.queue.filter((_, position) => position !== index); patch({ queue, queueIndex: index < stateRef.current.queueIndex ? stateRef.current.queueIndex - 1 : stateRef.current.queueIndex }); },
    clearQueue: () => patch({ queue: stateRef.current.currentTrack ? [stateRef.current.currentTrack] : [], queueIndex: stateRef.current.currentTrack ? 0 : -1 }),
    reorderQueue: (from, to) => { const queue = [...stateRef.current.queue]; const [item] = queue.splice(from, 1); queue.splice(to, 0, item); patch({ queue }); },
    toggleFavorite: (track) => setLibrary(libraryRepository.toggleTrack(track)),
    toggleFavoriteAlbum: (album) => setLibrary(libraryRepository.toggleAlbum(album)),
    toggleFavoriteArtist: (artist) => setLibrary(libraryRepository.toggleArtist(artist)),
    toggleFavoritePlaylist: (playlist) => setLibrary(libraryRepository.togglePlaylist(playlist)),
    createPlaylist: (name, description) => setLibrary(libraryRepository.createPlaylist(name, description)),
    addToPlaylist: (playlistId, track) => setLibrary(libraryRepository.addToPlaylist(playlistId, track)),
    removeFromPlaylist: (playlistId, trackId) => setLibrary(libraryRepository.removeFromPlaylist(playlistId, trackId)),
    reorderPlaylist: (playlistId, from, to) => setLibrary(libraryRepository.reorderPlaylist(playlistId, from, to)),
    renamePlaylist: (playlistId, name, description) => setLibrary(libraryRepository.renamePlaylist(playlistId, name, description)),
    deletePlaylist: (playlistId) => setLibrary(libraryRepository.deletePlaylist(playlistId)),
    setExpanded: (playerExpanded) => patch({ playerExpanded }),
    toggleQueue: () => setQueueOpen(), queueOpen,
  }), [library, next, play, previous, queueOpen, state, toggle]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
      if (event.code === 'Space') { event.preventDefault(); void toggle(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); value.seek(Math.max(0, stateRef.current.currentTime - 10)); }
      if (event.key === 'ArrowRight') { event.preventDefault(); value.seek(stateRef.current.currentTime + 10); }
      if (event.key.toLowerCase() === 'n') void next();
      if (event.key.toLowerCase() === 'p') void previous();
      if (event.key.toLowerCase() === 'm') value.toggleMute();
      if (event.key.toLowerCase() === 'f' && stateRef.current.currentTrack) value.toggleFavorite(stateRef.current.currentTrack);
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [next, previous, toggle, value]);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
}
