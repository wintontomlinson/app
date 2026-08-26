# Sonora architecture

## Product and delivery model

Sonora is a client-rendered TypeScript application built with React and Vite. Flask remains the same-origin API boundary. The browser only talks to `/api/*`; upstream JioSaavn requests and any future provider credentials stay server-side.

The Vite production bundle is emitted to `../static`, which Flask serves. Flask also returns the client entry point for non-API routes, allowing direct loading of `/artist/:id`, `/album/:id`, and other app URLs.

## Internal models

`Track`, `Artist`, `Album`, and `Playlist` are the UI contracts. API mapping is isolated in `src/api/music.ts`. No page or component consumes a raw JioSaavn payload. `SearchResults` contains categorized normalized results. `Track` intentionally stores only the selected stream URL, not source provider payloads.

## State boundaries

- `PlayerProvider`: one `AudioEngine` and one persistent player state. It owns the current track, queue, history, timing, volume, shuffle, repeat, buffering, errors, and now-playing expansion.
- `LibraryRepository`: persistent likes, playlists, playback resume state, and preferences via local storage. Its interface can later be backed by a user database without changing UI callers.
- `SessionRepository`: guest-first authentication seam for future email, Google, or provider authentication.
- `MusicService`: cached, cancellable API client and normalizers.

## Routes

`/`, `/search`, `/artist/:id`, `/album/:id`, `/playlist/:id`, `/song/:id`, `/library`, `/liked`, `/history`, `/settings`, and `/now-playing` are defined in the router. The global player is mounted outside route content and never unmounts during navigation.

## Design tokens

The token set uses the requested neutral premium palette: `#080808` canvas, `#0F0F0F` secondary, `#151515` surface, `#1C1C1C` elevated surface, `#F5F5F5` primary text, `#A4A4A4` secondary text, `#707070` muted text, and restrained `#FF2D55` accents. The design intentionally uses a low radius, low shadow, editorial layout with fluid shelves rather than floating dashboard cards.

## Current API capabilities

The existing Flask API provides categorized search, song detail, song suggestions, album detail, artist detail, playlist detail, and artist catalog queries. It does not expose lyric text, authentication, follower statistics, or a user library. The app does not invent those fields. Lyrics show an explicit unavailable state until a licensed lyrics source is connected.

## Playback note

The player is an HTML5 Audio abstraction with loading, buffering, failure, seek, volume, shuffle, repeat, queue, and auto-next handling. Stream URLs come from the existing backend response. Confirm provider licensing, rights, and delivery terms before enabling production streaming at scale.
