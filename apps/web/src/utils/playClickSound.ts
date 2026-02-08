let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Plays a short percussive "tick" with a subtle gamified pip. */
export default function playClickSound() {
  const ac = getAudioContext();
  const now = ac.currentTime;

  // Sharp tick — filtered noise burst (~15ms)
  const sampleCount = Math.ceil(ac.sampleRate * 0.015);
  const buffer = ac.createBuffer(1, sampleCount, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount) ** 10;
  }

  const noise = ac.createBufferSource();
  noise.buffer = buffer;

  const filter = ac.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3000;
  filter.Q.value = 1.5;

  const noiseGain = ac.createGain();
  noiseGain.gain.value = 0.35;

  noise.connect(filter).connect(noiseGain).connect(ac.destination);
  noise.start(now);

  // Subtle gamified pip — very short sine ping
  const pip = ac.createOscillator();
  pip.type = 'sine';
  pip.frequency.value = 1200;

  const pipGain = ac.createGain();
  pipGain.gain.setValueAtTime(0.06, now);
  pipGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

  pip.connect(pipGain).connect(ac.destination);
  pip.start(now);
  pip.stop(now + 0.035);
}
