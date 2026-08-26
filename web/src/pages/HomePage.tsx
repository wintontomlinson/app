import { Heart, Play, Plus } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { isOfflineAndroidBuild } from '../api/client';
import { musicService } from '../api/music';
import { ArtistShelf, TrackShelf } from '../components/ContentShelf';
import { TrackArtwork } from '../components/TrackArtwork';
import { usePlayer } from '../player/PlayerContext';
import type { Track } from '../types/music';

type Discovery = { hero?: Track; recently: Track[]; trending: Track[]; releases: Track[]; recommendations: Track[] };

export function HomePage() {
  const [data, setData] = useState<Discovery | null>(null); const [error, setError] = useState(false); const { library, play, toggleFavorite } = usePlayer();
  useEffect(() => { let active = true; musicService.discover().then((value) => active && setData(value)).catch(() => active && setError(true)); return () => { active = false; }; }, []);
  if (!data && !error) return <HomeSkeleton />;
  if (error || !data) return <section className="page-state"><h1>Connection problem</h1><p>We could not load your discovery feed. Check your connection and try again.</p><button className="primary-button" onClick={() => location.reload()}>Retry</button></section>;
  const hero = data.hero; const artists = [...data.trending, ...data.releases].flatMap((track) => track.artists).filter((artist, index, all) => all.findIndex((item) => item.id === artist.id) === index).slice(0, 6);
  return <div className="page home-page">{isOfflineAndroidBuild && <div className="offline-notice" role="status"><strong>Offline preview</strong><span>The app shell is ready. Connect a deployed Sonora API URL to browse and stream the live catalog.</span></div>}<header className="content-topbar"><div><span className="eyebrow">HOME</span><h1>Good evening, Marina.</h1></div><div className="top-actions"><Link to="/search" className="search-link">Search music</Link><button className="avatar-button" aria-label="Profile">MN</button></div></header>
    {hero && <section className="editorial-hero" style={{ '--hero-art': `url(${hero.image})` } as CSSProperties}><div className="hero-art-blur" /><div className="hero-copy"><span className="eyebrow">SPOTLIGHT</span><p>{hero.album?.name || 'Fresh from the catalog'}</p><h2>{hero.title}</h2><span className="hero-artist">{hero.artists.map((artist) => artist.name).join(', ')}</span><div className="hero-actions"><button className="primary-button" onClick={() => void play(hero, [hero, ...data.recently])}><Play size={17} fill="currentColor" />Play</button><button className="secondary-button" onClick={() => toggleFavorite(hero)}><Heart size={17} fill={library.favoriteTrackIds.includes(hero.id) ? 'currentColor' : 'none'} />{library.favoriteTrackIds.includes(hero.id) ? 'Liked' : 'Like'}</button><button className="icon-button" aria-label="Add to queue"><Plus size={18} /></button></div></div><TrackArtwork src={hero.image} alt={`${hero.title} artwork`} size="hero" /></section>}
    <section className="quick-access"><header className="section-header"><div><span className="eyebrow">YOUR SPACE</span><h2>Quick access</h2></div></header><div className="quick-grid"><Link to="/history"><span>Recently played</span><small>{library.history.length ? `${library.history.length} tracks` : 'Nothing played yet'}</small></Link><Link to="/liked"><span>Liked Songs</span><small>{library.favoriteTrackIds.length} saved tracks</small></Link><Link to="/library"><span>Your playlists</span><small>{library.customPlaylists.length} playlists</small></Link><Link to="/search"><span>Explore music</span><small>Find something new</small></Link></div></section>
    <TrackShelf eyebrow="PICKED FOR YOU" title="Recently discovered" tracks={data.recently} />
    <TrackShelf eyebrow="RIGHT NOW" title="Trending" tracks={data.trending} />
    <TrackShelf eyebrow="NEW TO YOU" title="Fresh releases" tracks={data.releases} />
    <ArtistShelf artists={artists} />
    <TrackShelf eyebrow="BASED ON YOUR LISTENING" title="Recommended for you" tracks={data.recommendations} />
  </div>;
}

function HomeSkeleton() { return <div className="page home-page skeleton-page"><div className="skeleton-line wide" /><div className="skeleton hero-skeleton" /><div className="skeleton-line medium" /><div className="skeleton-grid">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton square" key={index} />)}</div></div>; }
