// recorder-worklet.js — runs on the audio render thread.
//
// Its only job is to ferry raw mono PCM off the render thread to the main
// thread, where audio.ts resamples it to Whisper's 16 kHz and computes loudness.
// We coalesce the tiny 128-sample render quanta into ~1024-sample posts to keep
// the message rate sane. The node outputs silence: STATIC monitors the input
// but never plays it back (a path to the destination only exists to keep the
// graph pulling this node every quantum).
class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = new Float32Array(1024);
    this._n = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const ch = input[0]; // mono / first channel
      for (let i = 0; i < ch.length; i++) {
        this._buf[this._n++] = ch[i];
        if (this._n === this._buf.length) {
          // transfer a copy so the worklet can keep filling its buffer
          const out = this._buf.slice(0);
          this.port.postMessage(out, [out.buffer]);
          this._n = 0;
        }
      }
    }
    // keep this node alive in the graph; emit nothing audible
    return true;
  }
}

registerProcessor("recorder", RecorderProcessor);
