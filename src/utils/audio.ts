/**
 * Web Audio API procedural sound engine for FocusFlow.
 * Zero external MP3 dependencies, 100% offline, zero latency.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a warm, soothing meditation bell chime when a focus session finishes.
 */
export function playChime(enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const baseFreqs = [528, 792, 1056]; // Solfeggio 528Hz harmonious chord
    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const initialGain = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(initialGain, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8 + idx * 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 3.2 + idx * 0.4);
    });
  } catch (e) {
    console.warn('Audio chime playback error:', e);
  }
}

/**
 * Ambient background noise generator using procedural Web Audio synthesis.
 */
class AmbientSoundEngine {
  private currentType: string = 'none';
  private sourceNodes: (AudioNode | number)[] = [];
  private gainNode: GainNode | null = null;
  private volume: number = 0.3;

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && audioCtx) {
      this.gainNode.gain.setValueAtTime(this.volume, audioCtx.currentTime);
    }
  }

  public stop() {
    this.sourceNodes.forEach((node) => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
            (node as AudioScheduledSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // Ignore disconnection errors on already stopped nodes
        }
      }
    });
    this.sourceNodes = [];
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // ignore
      }
      this.gainNode = null;
    }
    this.currentType = 'none';
  }

  public play(type: 'none' | 'rain' | 'whitenoise' | 'cafe' | 'waves', volume: number = 0.3) {
    if (this.currentType === type && this.sourceNodes.length > 0) {
      this.setVolume(volume);
      return;
    }

    this.stop();
    if (type === 'none' || typeof window === 'undefined') return;

    try {
      const ctx = getAudioContext();
      this.volume = volume;
      this.currentType = type;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.gainNode = masterGain;

      // 5 seconds looping noise buffer
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const output = noiseBuffer.getChannelData(channel);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'whitenoise') {
            output[i] = white * 0.15;
          } else {
            // Pink noise filtering for natural warm tones
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
            b6 = white * 0.115926;
          }
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      if (type === 'rain') {
        // Rain: low-pass filter with mild random drops
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, ctx.currentTime);
        filter.Q.setValueAtTime(0.7, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        this.sourceNodes.push(noiseSource, filter);
      } else if (type === 'whitenoise') {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        this.sourceNodes.push(noiseSource, filter);
      } else if (type === 'waves') {
        // Gentle rhythmic ocean swell with LFO
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime); // ~8 sec swell cycle

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.4, ctx.currentTime);

        lfo.connect(lfoGain.gain);
        noiseSource.connect(filter);
        filter.connect(lfoGain);
        lfoGain.connect(masterGain);

        lfo.start();
        noiseSource.start();
        this.sourceNodes.push(noiseSource, filter, lfo, lfoGain);
      } else if (type === 'cafe') {
        // Soft café background drone: warm low pass with gentle resonance
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);
        filter.Q.setValueAtTime(2.2, ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(masterGain);
        noiseSource.start();
        this.sourceNodes.push(noiseSource, filter);
      }
    } catch (e) {
      console.warn('Ambient sound engine error:', e);
    }
  }
}

export const ambientAudio = new AmbientSoundEngine();
