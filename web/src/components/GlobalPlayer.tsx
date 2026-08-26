import { ChevronUp, Heart, ListMusic, Pause, Play, Repeat, Repeat1, Shuffle, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../player/PlayerContext';
import { TrackArtwork } from './TrackArtwork';

const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function GlobalPlayer() {
  const navigate = useNavigate();
  const { library, next, previous, seek, setExpanded, setVolume, state, toggle, toggleFavorite, toggleMute, toggleQueue, toggleShuffle, cycleRepeat } = usePlayer();
  const openNowPlaying = () => { setExpanded(true); navigate('/now-playing'); };
  const track = state.currentTrack;
  if (!track) return null;
  const liked = library.favoriteTrackIds.includes(track.id);
  return <footer className="global-player">
    <div className="player-track"><button className="artwork-button" onClick={openNowPlaying} aria-label="Open now playing"><TrackArtwork src={track.image} alt={`${track.title} artwork`} size="sm" /></button><div><strong>{track.title}</strong><span>{track.artists.map((artist) => artist.name).join(', ')}</span></div><button className={`favorite-button ${liked ? 'is-liked' : ''}`} onClick={() => toggleFavorite(track)} aria-label="Toggle favorite"><Heart size={17} fill={liked ? 'currentColor' : 'none'} /></button></div>
    <div className="player-center"><div className="player-actions"><button className={state.shuffle ? 'is-active' : ''} onClick={toggleShuffle} aria-label="Toggle shuffle"><Shuffle size={16} /></button><button onClick={() => void previous()} aria-label="Previous"><SkipBack size={18} fill="currentColor" /></button><button className="play-button" onClick={() => void toggle()} aria-label={state.isPlaying ? 'Pause' : 'Play'}>{state.loading || state.buffering ? <span className="spinner" /> : state.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button><button onClick={() => void next()} aria-label="Next"><SkipForward size={18} fill="currentColor" /></button><button className={state.repeatMode !== 'off' ? 'is-active' : ''} onClick={cycleRepeat} aria-label="Cycle repeat mode">{state.repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}</button></div><div className="progress"><span>{time(state.currentTime)}</span><input aria-label="Playback progress" type="range" min="0" max={Math.max(state.duration, 1)} step="0.5" value={Math.min(state.currentTime, state.duration || 0)} onChange={(event) => seek(Number(event.target.value))} /><span>{time(state.duration || track.duration)}</span></div></div>
    <div className="player-tools"><button onClick={openNowPlaying} aria-label="Expand player"><ChevronUp size={18} /></button><button className="queue-toggle" onClick={toggleQueue} aria-label="Open queue"><ListMusic size={18} /><em>{state.queue.length}</em></button><button onClick={toggleMute} aria-label="Mute">{state.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button><input aria-label="Volume" type="range" min="0" max="1" step="0.01" value={state.muted ? 0 : state.volume} onChange={(event) => setVolume(Number(event.target.value))} /></div>
    {state.error && <div className="player-error" role="status">{state.error}</div>}
  </footer>
}
