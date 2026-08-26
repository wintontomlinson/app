import { Ellipsis, Heart, ListPlus, Play, PlayCircle, Plus, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Track } from '../types/music';
import { usePlayer } from '../player/PlayerContext';
import { shareMusic } from '../utils/share';
import { notify } from './ToastRegion';

type Props = { track: Track; className?: string };

export function TrackMenu({ track, className = '' }: Props) {
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const { addToPlaylist, addToQueue, library, play, toggleFavorite } = usePlayer();
  const liked = library.favoriteTrackIds.includes(track.id);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (menu.current && !menu.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close); return () => document.removeEventListener('mousedown', close);
  }, []);

  const action = (callback: () => void) => { callback(); setOpen(false); };
  return <div className={`track-menu ${className}`} ref={menu}>
    <button className="icon-button compact" aria-label={`More options for ${track.title}`} onClick={() => setOpen(!open)}><Ellipsis size={18} /></button>
    {open && <div className="context-menu" role="menu">
      <button onClick={() => action(() => void play(track))}><Play size={15} />Play</button>
      <button onClick={() => action(() => addToQueue(track, true))}><PlayCircle size={15} />Play next</button>
      <button onClick={() => action(() => addToQueue(track))}><ListPlus size={15} />Add to queue</button>
      <button onClick={() => action(() => toggleFavorite(track))}><Heart size={15} fill={liked ? 'currentColor' : 'none'} />{liked ? 'Remove from liked' : 'Like track'}</button>
      {library.customPlaylists.length > 0 && <div className="playlist-submenu"><span>Add to playlist</span>{library.customPlaylists.slice(0, 4).map((playlist) => <button key={playlist.id} onClick={() => action(() => addToPlaylist(playlist.id, track))}><Plus size={15} />{playlist.name}</button>)}</div>}
      <button onClick={() => { void shareMusic(`/song/${track.id}`, track.title).then(notify).catch(() => notify('Unable to share this track.')); setOpen(false); }}><Share2 size={15} />Share</button>
    </div>}
  </div>;
}
