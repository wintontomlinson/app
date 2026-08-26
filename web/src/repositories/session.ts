export type Session = { mode: 'guest' | 'authenticated'; user?: { id: string; name: string; email?: string } };

export interface SessionRepository {
  get(): Session;
  set(session: Session): void;
  clear(): void;
}

const KEY = 'sonora-session-v1';
export const sessionRepository: SessionRepository = {
  get() { try { return JSON.parse(localStorage.getItem(KEY) || '{"mode":"guest"}') as Session; } catch { return { mode: 'guest' }; } },
  set(session) { localStorage.setItem(KEY, JSON.stringify(session)); },
  clear() { localStorage.removeItem(KEY); },
};
