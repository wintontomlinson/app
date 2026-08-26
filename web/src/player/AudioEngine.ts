export type AudioEvents = {
  time: (currentTime: number, duration: number) => void;
  status: (status: { loading: boolean; buffering: boolean }) => void;
  ended: () => void;
  error: (message: string) => void;
};

export class AudioEngine {
  private audio = new Audio();
  constructor(private events: AudioEvents) {
    this.audio.preload = 'metadata';
    this.audio.addEventListener('timeupdate', () => events.time(this.audio.currentTime, this.audio.duration || 0));
    this.audio.addEventListener('loadedmetadata', () => events.time(this.audio.currentTime, this.audio.duration || 0));
    this.audio.addEventListener('waiting', () => events.status({ loading: false, buffering: true }));
    this.audio.addEventListener('canplay', () => events.status({ loading: false, buffering: false }));
    this.audio.addEventListener('ended', events.ended);
    this.audio.addEventListener('error', () => events.error('This track cannot be played right now.'));
  }
  async load(source?: string) {
    if (!source) throw new Error('No playable source is available for this track.');
    this.events.status({ loading: true, buffering: false });
    this.audio.src = source;
    this.audio.load();
  }
  async play() { await this.audio.play(); }
  pause() { this.audio.pause(); }
  seek(time: number) { this.audio.currentTime = Math.max(0, time); }
  setVolume(value: number) { this.audio.volume = Math.min(1, Math.max(0, value)); }
  setMuted(value: boolean) { this.audio.muted = value; }
  destroy() { this.audio.pause(); this.audio.src = ''; }
}
