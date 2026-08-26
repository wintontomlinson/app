import { Album, Clock3, Disc3, Heart, House, Library, ListMusic, Search, Settings, UserRound } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState, type PropsWithChildren } from 'react';
import { GlobalPlayer } from './GlobalPlayer';
import { QueueDrawer } from './QueueDrawer';
import { ToastRegion } from './ToastRegion';

const nav = [{ to: '/', label: 'Home', icon: House }, { to: '/search', label: 'Search', icon: Search }, { to: '/library', label: 'Library', icon: Library }, { to: '/liked', label: 'Liked Songs', icon: Heart }, { to: '/history', label: 'Recently Played', icon: Clock3 }, { to: '/albums', label: 'Albums', icon: Album }, { to: '/artists', label: 'Artists', icon: UserRound }, { to: '/playlists', label: 'Playlists', icon: ListMusic }, { to: '/genres', label: 'Genres', icon: Disc3 }];

export function AppShell({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false); const navigate = useNavigate();
  return <div className="app-frame"><aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}><NavLink to="/" className="brand" onClick={() => setMobileOpen(false)}><span className="brand-mark"><i /><i /><i /></span><span>SONORA</span></NavLink><nav>{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}</nav><div className="sidebar-bottom"><NavLink to="/settings"><Settings size={18} /><span>Settings</span></NavLink><div className="profile-chip"><div>MN</div><span><strong>Marina N.</strong><small>Guest listener</small></span></div></div></aside><div className="mobile-topbar"><button onClick={() => setMobileOpen(!mobileOpen)} className="icon-button" aria-label="Toggle navigation"><span className="menu-lines">☰</span></button><span className="brand-mobile">SONORA</span><button onClick={() => navigate('/search')} className="icon-button" aria-label="Search"><Search size={18} /></button></div><main className="main-content">{children || <Outlet />}</main><nav className="mobile-nav">{nav.slice(0, 4).map(({ to, label, icon: Icon }) => <NavLink key={to} to={to}><Icon size={19} /><span>{label === 'Library' ? 'Library' : label}</span></NavLink>)}</nav><QueueDrawer /><GlobalPlayer /><ToastRegion /></div>;
}
