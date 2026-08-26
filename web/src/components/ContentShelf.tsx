import { MoreHorizontal, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../player/PlayerContext';
import type { Artist, Track } from '../types/music';
import { TrackArtwork } from './TrackArtwork';

type TrackShelfProps = { title: string; eyebrow?: string; tracks: Track[]; linkTo?: string };
export function TrackShelf({ title, eyebrow, tracks, linkTo }: TrackShelfProps) {
  const { play } = usePlayer();
  return <section className="shelf"><header className="section-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{linkTo && <Link to={linkTo}>Show all</Link>}</header><div className="media-grid">{tracks.map((track) => <article className="media-card" key={track.id}><button className="media-art" onClick={() => void play(track, tracks)}><TrackArtwork src={track.image} alt={`${track.title} artwork`} size="lg" /><span className="media-play"><Play size={17} fill="currentColor" /></span></button><div><Link to={`/song/${track.id}`}>{track.title}</Link><span>{track.artists.map((artist) => artist.name).join(', ')}</span></div><button className="card-more" aria-label={`More actions for ${track.title}`}><MoreHorizontal size={17} /></button></article>)}</div></section>;
}

export function ArtistShelf({ artists }: { artists: Artist[] }) {
  return <section className="shelf"><header className="section-header"><div><span className="eyebrow">PEOPLE TO FOLLOW</span><h2>Popular artists</h2></div></header><div className="artist-grid">{artists.map((artist) => <Link className="artist-card" to={`/artist/${artist.id}`} key={artist.id}><TrackArtwork src={artist.image} alt={`${artist.name} portrait`} size="lg" className="round-art" /><strong>{artist.name}</strong><span>Artist</span></Link>)}</div></section>;
}
