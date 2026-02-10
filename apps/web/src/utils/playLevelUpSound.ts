let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Plays a celebratory level-up fanfare — grander than the task-completion chime. */
export default function playLevelUpSound() {
  const ac = getAudioContext();
  const now = ac.currentTime;

  // Ascending major arpeggio: C5 → E5 → G5 → C6 → E6, ending on a sustained high note
  const notes = [523, 659, 784, 1047, 1319];
  const spacing = 0.08;

  notes.forEach((freq, i) => {
    const t = now + i * spacing;
    const isLast = i === notes.length - 1;
    const duration = isLast ? 0.6 : 0.2;
    const volume = isLast ? 0.22 : 0.18;

    // Fundamental
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration);

    // Overtone for bell shimmer
    const overtone = ac.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = freq * 3;

    const overtoneGain = ac.createGain();
    overtoneGain.gain.setValueAtTime(0.04, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.5);

    overtone.connect(overtoneGain).connect(ac.destination);
    overtone.start(t);
    overtone.stop(t + duration);
  });
}
