// Mute-aware sound effects. Audio starts muted like the original
// (audio_enable_on_startup: false).
import { Assets, SoundName } from "./assets";

export class Sound {
  muted = true;
  /**
   * Which screen family is showing: "bgm" (menu), "bet" (BGM + announcer),
   * or "race" (crowd bed only). Honored by resume().
   */
  musicMode: "bgm" | "bet" | "race" = "bgm";

  constructor(private assets: Assets) {}

  private el(name: SoundName): HTMLAudioElement | undefined {
    return this.assets.sounds.get(name);
  }

  play(name: SoundName): void {
    if (this.muted) return;
    const a = this.el(name);
    if (!a) return;
    try {
      a.muted = false;
      a.currentTime = 0;
      void a.play();
    } catch {
      /* autoplay policy */
    }
  }

  click(): void {
    this.play("click.mp3");
  }

  chip(): void {
    this.play("chip.mp3");
  }

  private hornAt = 0;
  private hornPlayed = false;
  private hornBusy = false;

  /**
   * Race audio is only the starting-gate clip, played once.
   * No looping noise bed under the run.
   */
  beginRace(): void {
    this.musicMode = "race";
    this.hornAt = performance.now();
    this.hornPlayed = false;
    this.playHorn();
  }

  endRace(): void {
    this.stopHorn();
    this.hornPlayed = true;
  }

  /** Gate / start effect. Once per race, and only in the opening moment. */
  private playHorn(): void {
    if (this.hornPlayed || this.hornBusy || this.muted) return;
    if (performance.now() - this.hornAt > 2500) {
      this.hornPlayed = true;
      return;
    }
    const a = this.el("start_race.mp3");
    if (!a) return;
    this.hornBusy = true;
    try {
      a.loop = false;
      a.volume = 1;
      a.muted = false;
      a.currentTime = 0;
      void a.play().then(() => {
        this.hornPlayed = true;
        this.hornBusy = false;
      }).catch(() => {
        this.hornBusy = false;
      });
    } catch {
      this.hornBusy = false;
    }
  }

  private stopHorn(): void {
    const a = this.el("start_race.mp3");
    if (!a) return;
    try {
      a.loop = false;
      if (!a.paused) a.pause();
    } catch {
      /* ignore */
    }
  }

  /** One-shot announcer voice-over for the race intro. */
  announcer(): void {
    if (this.muted) return;
    const a = this.el("race_intro.mp3");
    if (!a) return;
    try {
      a.loop = false;
      a.volume = 1;
      a.muted = false;
      a.currentTime = 0;
      void a.play();
    } catch {
      /* autoplay policy */
    }
  }

  stopAnnouncer(): void {
    const a = this.el("race_intro.mp3");
    if (a && !a.paused) {
      try {
        a.pause();
      } catch {
        /* ignore */
      }
    }
  }

  /** Single entry point for the mute button: silences everything when
   *  muting, and restarts only what belongs to the current screen when
   *  unmuting (so unmuting mid-race brings back the crowd bed, never BGM). */
  setMuted(m: boolean): void {
    this.muted = m;
    if (m) {
      this.soundtrack(false);
      this.stopHorn();
      this.stopAnnouncer();
    } else {
      this.resume();
    }
  }

  /** Re-assert whatever should be audible now (call on user taps). */
  resume(): void {
    if (this.muted) return;
    if (this.musicMode === "race") {
      this.playHorn();
      return;
    }
    this.soundtrack(true);
    if (this.musicMode !== "bet") return;
    // Heal a never-started betting announcer (its enter() play may have
    // predated the first user gesture). Never restarts mid/late playback.
    const a = this.el("race_intro.mp3");
    if (a && a.paused && !a.ended && a.currentTime < 1) {
      try {
        a.loop = false;
        a.volume = 1;
        a.muted = false;
        void a.play();
      } catch {
        /* autoplay policy */
      }
    }
  }

  /** Hard guarantee: BGM can never overlap the race bed. Cheap; the race
   *  screen calls it every frame. */
  enforceRaceSilence(): void {
    const a = this.el("soundtrack.mp3");
    if (a && !a.paused) {
      try {
        a.pause();
      } catch {
        /* ignore */
      }
    }
  }

  photo(): void {
    this.play("photo.mp3");
  }

  soundtrack(on: boolean): void {
    const a = this.el("soundtrack.mp3");
    if (!a) return;
    try {
      a.loop = true;
      a.muted = this.muted || !on;
      if (on && !this.muted && a.paused) void a.play();
      if (!on && !a.paused) a.pause();
    } catch {
      /* ignore */
    }
  }
}
