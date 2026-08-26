import { GripVertical, ListX, X } from 'lucide-react';
import { useState } from 'react';
import { usePlayer } from '../player/PlayerContext';
import { TrackArtwork } from './TrackArtwork';

export function QueueDrawer() {
  const { clearQueue, queueOpen, removeFromQueue, reorderQueue, state, toggleQueue } = usePlayer();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  if (!queueOpen) return null;
  return <aside className="queue-drawer" aria-label="Queue">
    <header><div><span className="eyebrow">UP NEXT</span><h2>Queue</h2></div><button className="icon-button" onClick={toggleQueue} aria-label="Close queue"><X size={19} /></button></header>
    <div className="queue-list">{state.queue.length ? state.queue.map((track, index) => <div className={`queue-item ${index === state.queueIndex ? 'is-current' : ''}`} key={`${track.id}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null && dragIndex !== index) reorderQueue(dragIndex, index); setDragIndex(null); }}><GripVertical size={15} className="grab" /><TrackArtwork src={track.image} alt="" size="sm" /><div><strong>{track.title}</strong><span>{track.artists.map((artist) => artist.name).join(', ')}</span></div><button className="icon-button compact" onClick={() => removeFromQueue(index)} aria-label={`Remove ${track.title} from queue`}><X size={16} /></button></div>) : <div className="empty-copy"><ListX size={24} /><p>Your queue is clear.</p><span>Add songs from any track menu.</span></div>}</div>
    {state.queue.length > 1 && <button className="text-action" onClick={clearQueue}>Clear queue</button>}
  </aside>;
}
