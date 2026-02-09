let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Plays a bright ascending chime — Zelda TotK–inspired completion jingle. */
export default function playSuccessSound() {
  const ac = getAudioContext();
  const now = ac.currentTime;

  const notes = [523, 659, 784, 1047]; // C5 → E5 → G5 → C6
  const spacing = 0.09;

  notes.forEach((freq, i) => {
    const t = now + i * spacing;
    const isLast = i === notes.length - 1;
    const duration = isLast ? 0.45 : 0.18;

    // Fundamental
    const osc = ac.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain).connect(ac.destination);
    osc.start(t);
    osc.stop(t + duration);

    // Soft overtone for bell-like shimmer
    const overtone = ac.createOscillator();
    overtone.type = 'sine';
    overtone.frequency.value = freq * 3;

    const overtoneGain = ac.createGain();
    overtoneGain.gain.setValueAtTime(0.03, t);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, t + duration * 0.6);

    overtone.connect(overtoneGain).connect(ac.destination);
    overtone.start(t);
    overtone.stop(t + duration);
  });
}
