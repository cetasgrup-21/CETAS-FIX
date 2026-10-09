// Audio Utility using Web Audio API for Browser-Safe Sound Effects (Zero External Audio Assets needed)

export function playVoteNotificationSound() {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Pleasant high-clarity notification chime: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.35, gain: 0.25 },
      { freq: 659.25, time: 0.1, dur: 0.35, gain: 0.3 },
      { freq: 783.99, time: 0.2, dur: 0.4, gain: 0.35 },
      { freq: 1046.5, time: 0.32, dur: 0.6, gain: 0.4 },
    ];

    notes.forEach(({ freq, time, dur, gain: targetGain }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Add a slight bell overtone
      gain.gain.setValueAtTime(0, ctx.currentTime + time);
      gain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + dur + 0.05);
    });

    // Sub-bass thump for satisfying tactile feel
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "triangle";
    subOsc.frequency.setValueAtTime(140, ctx.currentTime);
    subOsc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.18);
    subGain.gain.setValueAtTime(0.3, ctx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(ctx.currentTime);
    subOsc.stop(ctx.currentTime + 0.21);
  } catch (err) {
    console.warn("Audio notification playback failed:", err);
  }
}
