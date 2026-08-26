import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { musicService } from '../api/music';
import { TrackRow } from '../components/TrackRow';
import { TrackArtwork } from '../components/TrackArtwork';
import type { SearchResults } from '../types/music';

export function SearchPage() {
  const [params, setParams] = useSearchParams(); const initial = params.get('q') || ''; const [query, setQuery] = useState(initial); const [results, setResults] = useState<SearchResults | null>(null); const [loading, setLoading] = useState(Boolean(initial)); const [selected, setSelected] = useState(-1); const input = useRef<HTMLInputElement>(null);
  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => { const value = query.trim(); if (!value) { setResults(null); setLoading(false); return; } const controller = new AbortController(); const timeout = window.setTimeout(() => { setLoading(true); musicService.search(value, controller.signal).then(setResults).catch(() => setResults({ tracks: [], artists: [], albums: [], playlists: [] })).finally(() => setLoading(false)); }, 280); return () => { controller.abort(); clearTimeout(timeout); }; }, [query]);
  const trackCount = results?.tracks.length || 0;
  return <div className="page search-page"><header className="content-topbar"><div><span className="eyebrow">SEARCH</span><h1>Find your next favorite.</h1></div></header><div className="search-field"><Search size={20} /><input ref={input} value={query} onChange={(event) => { setQuery(event.target.value); setParams(event.target.value ? { q: event.target.value } : {}); }} onKeyDown={(event) => { if (!trackCount) return; if (event.key === 'ArrowDown') { event.preventDefault(); setSelected((value) => Math.min(value + 1, trackCount - 1)); } if (event.key === 'ArrowUp') { event.preventDefault(); setSelected((value) => Math.max(value - 1, 0)); } if (event.key === 'Escape') setQuery(''); if (event.key === 'Enter' && selected >= 0) document.getElementById(`track-${selected}`)?.querySelector<HTMLButtonElement>('.track-index')?.click(); }} placeholder="Search songs, artists, albums, or playlists" aria-label="Search music" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={18} /></button>}</div>
    {!query && <SearchEmpty onPick={setQuery} />}
    {loading && <SearchSkeleton />}
    {!loading && query && results && <div className="search-results">{results.tracks.length ? <section><header className="section-header"><h2>Songs</h2><span>{results.tracks.length} matches</span></header><div className="track-table">{results.tracks.map((track, index) => <div id={`track-${index}`} className={selected === index ? 'keyboard-selected' : ''} key={track.id}><TrackRow track={track} index={index} tracks={results.tracks} /></div>)}</div></section> : <div className="empty-search"><h2>No songs found</h2><p>Try an artist, album, or a different spelling.</p></div>}
      <ResultShelf title="Artists" items={results.artists} kind="artist" /> <ResultShelf title="Albums" items={results.albums} kind="album" /> <ResultShelf title="Playlists" items={results.playlists} kind="playlist" /></div>}
  </div>;
}

function ResultShelf({ title, items, kind }: { title: string; items: { id: string; name: string; image?: string; description?: string; artists?: { name: string }[] }[]; kind: string }) { if (!items.length) return null; return <section className="result-shelf"><header className="section-header"><h2>{title}</h2></header><div className="result-grid">{items.slice(0, 6).map((item) => <Link to={`/${kind}/${item.id}`} className="result-card" key={item.id}><TrackArtwork src={item.image} alt={`${item.name} artwork`} size="md" className={kind === 'artist' ? 'round-art' : ''} /><strong>{item.name}</strong><span>{item.artists?.map((artist) => artist.name).join(', ') || item.description || kind}</span></Link>)}</div></section>; }
function SearchEmpty({ onPick }: { onPick: (value: string) => void }) { return <section className="search-empty"><span className="eyebrow">START EXPLORING</span><h2>Search across the catalog</h2><p>Find a song, artist, album, or playlist. Results update as you type.</p><div>{['Fresh releases', 'Bollywood hits', 'Electronic', 'Indie'].map((value) => <button key={value} onClick={() => onPick(value)}>{value}</button>)}</div></section>; }
function SearchSkeleton() { return <div className="track-table search-skeleton">{Array.from({ length: 6 }).map((_, index) => <div className="skeleton-row" key={index}><span className="skeleton square" /><span className="skeleton-line medium" /></div>)}</div>; }
