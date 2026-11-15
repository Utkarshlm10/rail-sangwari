// 100% Free Web Audio & Haptic Utilities for Rail Sangwari (रेल संगवारी)
// Synthesizes authentic Indian Railways station chimes and haptic vibrations without external audio assets.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play authentic Indian Railways 3-Tone Announcement Chime
 * Tones: D5 (587.33Hz) -> A5 (880.00Hz) -> D6 (1174.66Hz)
 */
export function playRailwayChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 587.33, time: 0.00, dur: 0.28 }, // D5
      { freq: 880.00, time: 0.26, dur: 0.28 }, // A5
      { freq: 1174.66, time: 0.52, dur: 0.45 }, // D6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      // Warm bell attack and decay
      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.28, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });

    // Also trigger mobile device vibration if available
    triggerJobVibration();
  } catch (e) {
    console.warn("Could not synthesize railway chime:", e);
  }
}

/**
 * Play pleasant Job Completion / Cash Bell Ding
 */
export function playCompletionDing(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [
      { freq: 1318.51, time: 0.00, dur: 0.2 }, // E6
      { freq: 1567.98, time: 0.15, dur: 0.4 }, // G6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0.001, now + time);
      gain.gain.exponentialRampToValueAtTime(0.22, now + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.05);
    });
  } catch (e) {
    console.warn("Could not play completion ding:", e);
  }
}

/**
 * Web Vibration API pattern for incoming jobs
 * Pulsating pattern: [vibrate 300ms, pause 100ms, vibrate 300ms, pause 100ms, vibrate 500ms]
 */
export function triggerJobVibration(): void {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate([300, 100, 300, 100, 500]);
    } catch {
      // ignore
    }
  }
}

/**
 * Screen Wake Lock API
 * Prevents mobile screen from dimming/sleeping while porter is waiting for incoming jobs on the platform.
 */
let wakeLockSentinel: WakeLockSentinel | null = null;

export async function requestScreenWakeLock(): Promise<boolean> {
  if (typeof window === "undefined" || !("wakeLock" in navigator)) {
    return false;
  }
  try {
    wakeLockSentinel = await navigator.wakeLock.request("screen");
    wakeLockSentinel.addEventListener("release", () => {
      wakeLockSentinel = null;
    });
    return true;
  } catch (err) {
    console.warn("Wake Lock request error:", err);
    return false;
  }
}

export function releaseScreenWakeLock(): void {
  if (wakeLockSentinel) {
    wakeLockSentinel.release().catch(() => {});
    wakeLockSentinel = null;
  }
}
