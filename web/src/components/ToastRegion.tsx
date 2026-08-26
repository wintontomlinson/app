import { useEffect, useState } from 'react';

type ToastDetail = { message: string };
export function notify(message: string) { window.dispatchEvent(new CustomEvent<ToastDetail>('sonora-toast', { detail: { message } })); }
export function ToastRegion() { const [message, setMessage] = useState(''); useEffect(() => { const handler = (event: Event) => { const detail = (event as CustomEvent<ToastDetail>).detail; setMessage(detail.message); window.setTimeout(() => setMessage(''), 2500); }; window.addEventListener('sonora-toast', handler); return () => window.removeEventListener('sonora-toast', handler); }, []); return message ? <div className="toast-region" role="status">{message}</div> : null; }
