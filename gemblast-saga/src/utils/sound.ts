/**
 * Web Audio API Synthesized Sound Effects Engine
 * Pure browser-synthesized audio feedback with zero external dependencies.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public suspend() {
    if (this.ctx?.state === 'running') void this.ctx.suspend().catch(() => {});
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public playSelect(step = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const notes = [392, 440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
    const note = notes[Math.min(step, notes.length - 1)];
    osc.frequency.setValueAtTime(note, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(note * 1.06, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  public playSwap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.095);
  }

  public playInvalid() {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(140, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  public playMatch(comboLevel: number = 1) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Pentatonic ascending scale based on combo level
    const baseNotes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
    const index = Math.min(comboLevel - 1, baseNotes.length - 1);
    const freq = baseNotes[index];

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc2.type = 'triangle';

    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, now + 0.16);

    osc2.frequency.setValueAtTime(freq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.16);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.19);
    osc2.stop(now + 0.19);
  }

  public playSpecialCreation() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [587.33, 880, 1174.66];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.045);
      gain.gain.setValueAtTime(0.12, now + idx * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.045);
      osc.stop(now + idx * 0.045 + 0.23);
    });
  }

  /** Brief distinct charge cues; no persistent audio or timers. */
  public playCharge(rank: number) {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = rank === 10 ? [659.25, 783.99, 1046.5] : rank >= 9 ? [880, 1174.66, 1567.98] : rank >= 6 ? [659.25, 987.77] : rank === 5 ? [587.33, 880] : [523.25, 783.99];
    const now = ctx.currentTime;
    notes.forEach((frequency, i) => {
      const start = now + i * .04, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.055, start); gain.gain.exponentialRampToValueAtTime(.001, start + .17);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(start); osc.stop(start + .18);
    });
  }

  public playChainRelease(count: number, loop: boolean) {
    if (count < 4 && !loop) { this.playMatch(Math.max(1, count - 2)); return; }
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
    const startFrequency = loop ? 620 : count >= 9 ? 560 : count >= 6 ? 470 : 380;
    osc.type = 'triangle'; osc.frequency.setValueAtTime(startFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(loop ? 155 : 115, now + .23);
    gain.gain.setValueAtTime(.12, now); gain.gain.exponentialRampToValueAtTime(.001, now + .25);
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now + .26);
    if (loop || count >= 6) this.playCharge(loop ? 10 : count);
  }

  public playBoosterBlast() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(95, now + 0.26);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  }

  public playVictory() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.14, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.36);
    });
  }

  public playGameOver() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 329.63, 261.63];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      gain.gain.setValueAtTime(0.11, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.3);
    });
  }
}

export const sound = new SoundManager();
