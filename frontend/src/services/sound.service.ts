/*
  sound.service.ts
  Web Audio API micro-sounds synthesized in-browser.
  Handles browser autoplay policy: AudioContext is created and
  resumed lazily on the first real user interaction.
*/

export interface SoundService {
  playHover(): void;
  playClick(): void;
  playBootBeep(): void;
  isMuted(): boolean;
  setMuted(muted: boolean): void;
  /** Call once after any user gesture to unlock the AudioContext */
  unlock(): void;
}

class WebAudioSoundService implements SoundService {
  private ctx: AudioContext | null = null;
  private muted = false;
  private unlocked = false;
  private masterGain: GainNode | null = null;

  // Lazily create the AudioContext — must be called inside a user gesture
  private ensureCtx(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.4;
        this.masterGain.connect(this.ctx.destination);
      } catch {
        return null;
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    this.ensureCtx();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.12,
    freqEnd?: number,
    startDelay = 0
  ) {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();

      osc.connect(env);
      env.connect(this.masterGain);

      osc.type = type;
      const t = ctx.currentTime + startDelay;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(freqEnd, 1),
          t + dur
        );
      }

      // Attack → sustain → release envelope
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(gainPeak, t + 0.008);
      env.gain.setValueAtTime(gainPeak, t + dur * 0.3);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.start(t);
      osc.stop(t + dur + 0.01);
    } catch {
      // Never crash UI over a sound
    }
  }

  playHover(): void {
    // Soft neon blip: short sine sweep up
    this.tone(900, 0.07, 'sine', 0.06, 1200);
  }

  playClick(): void {
    // Crisp cyberpunk snap: square → sine
    this.tone(600, 0.04, 'square', 0.08, 120);
    this.tone(1400, 0.06, 'sine', 0.04, 1800);
  }

  playBootBeep(): void {
    // Ascending 4-note chord for boot complete
    const notes = [
      { f: 220, fe: 440 },
      { f: 330, fe: 660 },
      { f: 440, fe: 880 },
      { f: 660, fe: 1320 },
    ];
    notes.forEach(({ f, fe }, i) => {
      this.tone(f, 0.3, 'sine', 0.1, fe, i * 0.09);
    });
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 0.4,
        this.ctx?.currentTime ?? 0,
        0.05
      );
    }
    if (!muted && this.ctx?.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }
}

export const soundService: SoundService = new WebAudioSoundService();

// ── Auto-unlock on first user gesture ──────────────────────────────────────
// This runs once globally. After the user's first click/keydown/touch,
// the AudioContext is created and resumed, satisfying browser autoplay rules.
if (typeof window !== 'undefined') {
  const unlock = () => {
    soundService.unlock();
    window.removeEventListener('click', unlock, true);
    window.removeEventListener('keydown', unlock, true);
    window.removeEventListener('touchstart', unlock, true);
    window.removeEventListener('pointerdown', unlock, true);
  };
  window.addEventListener('click', unlock, { capture: true, once: true });
  window.addEventListener('keydown', unlock, { capture: true, once: true });
  window.addEventListener('touchstart', unlock, { capture: true, once: true });
  window.addEventListener('pointerdown', unlock, { capture: true, once: true });
}
