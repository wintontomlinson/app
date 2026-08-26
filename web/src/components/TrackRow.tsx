import { Heart, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../player/PlayerContext';
import type { Track } from '../types/music';
import { TrackArtwork } from './TrackArtwork';
import { TrackMenu } from './TrackMenu';

type Props = { track: Track; index: number; tracks?: Track[]; showAlbum?: boolean; compact?: boolean };
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;

export function TrackRow({ track, index, tracks, showAlbum = true, compact = false }: Props) {
  const { library, play, state, toggle, toggleFavorite } = usePlayer();
  const active = state.currentTrack?.id === track.id;
  const liked = library.favoriteTrackIds.includes(track.id);
  const clickPlay = () => active ? void toggle() : void play(track, tracks);
  return <div className={`track-row ${active ? 'is-active' : ''} ${compact ? 'is-compact' : ''}`}>
    <button className="track-index" aria-label={`${active && state.isPlaying ? 'Pause' : 'Play'} ${track.title}`} onClick={clickPlay}>
      <span>{index + 1}</span><i>{active && state.isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</i>
    </button>
    <TrackArtwork src={track.image} alt={`${track.title} artwork`} size="sm" />
    <div className="track-details"><strong>{track.title}{track.explicit && <b className="explicit">E</b>}</strong><span>{track.artists.map((artist) => <Link key={artist.id} to={`/artist/${artist.id}`}>{artist.name}</Link>)}</span></div>
    {showAlbum && <Link className="track-album" to={track.album?.id ? `/album/${track.album.id}` : '#'}>{track.album?.name || 'Single'}</Link>}
    <button className={`favorite-button ${liked ? 'is-liked' : ''}`} aria-label="Toggle favorite" onClick={() => toggleFavorite(track)}><Heart size={16} fill={liked ? 'currentColor' : 'none'} /></button>
    <span className="track-duration">{time(track.duration)}</span><TrackMenu track={track} />
  </div>;
}
