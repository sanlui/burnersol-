/**
 * Web Audio API Sound Effects Synthesizer for BurnerSol
 * Creates rich, immersive soundscapes on-the-fly with zero physical bandwidth costs.
 */

class Web3SoundEngine {
  private ctx: AudioContext | null = null;
  private roaringOsc: OscillatorNode | null = null;
  private roaringFilter: BiquadFilterNode | null = null;
  private roaringGain: GainNode | null = null;
  private noiseNode: AudioWorkletNode | ScriptProcessorNode | null = null;

  // Lazily initialize standard AudioContext on first user interaction to satisfy browser policies
  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Subtle tick pluck for cursor hovers and simple button selection
   */
  public playHoverPluck() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      // Elegant, clean micro frequencies
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch (e) {
      // Graceful fallback if audio context blocked/unsupported
    }
  }

  /**
   * Rich multi-frequency furnace fire roar rumble loop
   */
  public startFurnaceRoar() {
    try {
      const ctx = this.getContext();
      if (this.roaringOsc) return; // Already running

      // 1. Create a base low-frequency oscillator
      this.roaringOsc = ctx.createOscillator();
      this.roaringOsc.type = "sawtooth";
      this.roaringOsc.frequency.setValueAtTime(55, ctx.currentTime);

      // Lowpass filter to convert aggressive sawtooth into a cozy, deep fiery rumbling
      this.roaringFilter = ctx.createBiquadFilter();
      this.roaringFilter.type = "lowpass";
      this.roaringFilter.Q.setValueAtTime(4.0, ctx.currentTime);
      this.roaringFilter.frequency.setValueAtTime(110, ctx.currentTime);

      // Gain controls
      this.roaringGain = ctx.createGain();
      this.roaringGain.gain.setValueAtTime(0.0, ctx.currentTime);
      this.roaringGain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.8);

      // Moderate frequency modulation (adds flickering fire heat vibes)
      const fmOsc = ctx.createOscillator();
      const fmGain = ctx.createGain();
      fmOsc.type = "sine";
      fmOsc.frequency.setValueAtTime(12, ctx.currentTime); // 12Hz flickering speed
      fmGain.gain.setValueAtTime(35, ctx.currentTime); // 35Hz modulation depth

      fmOsc.connect(fmGain);
      if (this.roaringFilter.frequency) {
        fmGain.connect(this.roaringFilter.frequency);
      }

      // Chain connections
      this.roaringOsc.connect(this.roaringFilter);
      this.roaringFilter.connect(this.roaringGain);
      this.roaringGain.connect(ctx.destination);

      // Play noise component if possible
      try {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2.0 - 1.0;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(330, ctx.currentTime);
        noiseFilter.Q.setValueAtTime(1.0, ctx.currentTime);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.015, ctx.currentTime);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        // Save reference to stop with main oscillator stop
        const originalStop = this.roaringOsc.stop.bind(this.roaringOsc);
        this.roaringOsc.stop = (time?: number) => {
          originalStop(time);
          try {
            whiteNoise.stop();
          } catch (err) {}
        };

        whiteNoise.start();
        fmOsc.start();
      } catch (noiseErr) {
        // Fallback if noise buffering isn't supported gracefully
      }

      this.roaringOsc.start();
    } catch (e) {
      // Fail silent
    }
  }

  /**
   * Fade out and terminate the furnace roar
   */
  public stopFurnaceRoar() {
    try {
      const ctx = this.getContext();
      if (!this.roaringOsc || !this.roaringGain) return;

      const currentGain = this.roaringGain;
      const currentOsc = this.roaringOsc;

      currentGain.gain.setValueAtTime(currentGain.gain.value, ctx.currentTime);
      currentGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      setTimeout(() => {
        try {
          currentOsc.stop();
        } catch (err) {}
      }, 550);

      this.roaringOsc = null;
      this.roaringGain = null;
      this.roaringFilter = null;
    } catch (e) {
      // Fail silent
    }
  }

  /**
   * Sparkling high-fidelity pentatonic upward success chord chime block
   */
  public playSuccessChime() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Pentatonic beautiful frequencies describing success (C major / G major roots)
      const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

      freqs.forEach((freq, index) => {
        const timeDelay = index * 0.08;
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual oscillators: sine paired with subtle triangle for extra crystal harmonics
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + timeDelay);

        subOsc.type = "triangle";
        subOsc.frequency.setValueAtTime(freq * 1.5, now + timeDelay);

        gain.gain.setValueAtTime(0.0, now);
        gain.gain.setValueAtTime(0.08, now + timeDelay);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeDelay + 1.2);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + timeDelay);
        subOsc.start(now + timeDelay);

        osc.stop(now + timeDelay + 1.4);
        subOsc.stop(now + timeDelay + 1.4);
      });
    } catch (e) {
      // Fail silent
    }
  }
}

export const sound = new Web3SoundEngine();
