let audioCtx: AudioContext | null = null;
let muted = false;
let lastSpeech = 0;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

export function setMatchAudioMuted(value: boolean): void {
  muted = value;
}

export function isMatchAudioMuted(): boolean {
  return muted;
}

function noiseBuffer(duration: number): AudioBuffer | null {
  const c = ctx();
  if (!c) return null;
  const len = Math.floor(c.sampleRate * duration);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

export function playWhistle(long = false): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2000, c.currentTime);
  osc.frequency.linearRampToValueAtTime(2300, c.currentTime + 0.05);
  const dur = long ? 0.7 : 0.25;
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, c.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + dur);
}

export function playKick(): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  const buf = noiseBuffer(0.08);
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  gain.gain.setValueAtTime(0.3, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.08);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

export function playGoalCheer(): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  const buf = noiseBuffer(1.6);
  if (!buf) return;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 900;
  filter.Q.value = 0.6;
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, c.currentTime);
  gain.gain.linearRampToValueAtTime(0.5, c.currentTime + 0.15);
  gain.gain.linearRampToValueAtTime(0.32, c.currentTime + 0.9);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.6);
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();

  const osc = c.createOscillator();
  const og = c.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(330, c.currentTime);
  osc.frequency.linearRampToValueAtTime(523, c.currentTime + 0.3);
  og.gain.setValueAtTime(0.0001, c.currentTime);
  og.gain.exponentialRampToValueAtTime(0.18, c.currentTime + 0.1);
  og.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.8);
  osc.connect(og).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.8);
}

export function playCard(): void {
  if (muted) return;
  const c = ctx();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, c.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.15);
  gain.gain.setValueAtTime(0.2, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.15);
  osc.connect(gain).connect(c.destination);
  osc.start();
  osc.stop(c.currentTime + 0.15);
}

export function speak(text: string, force = false): void {
  if (muted) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const now = Date.now();
  if (!force && now - lastSpeech < 2500) return;
  lastSpeech = now;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  u.pitch = 1.0;
  u.volume = 0.9;
  window.speechSynthesis.speak(u);
}
