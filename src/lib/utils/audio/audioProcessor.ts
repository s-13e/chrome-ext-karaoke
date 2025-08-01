class OnsetRMSProcessor extends AudioWorkletProcessor {
  threshold: number = 0.07;
  detected: boolean = false;
  continuousCount: number = 0;
  requiredContinuousFrames: number = 6;

  constructor() {
    super();
    this.port.onmessage = (event) => {
      if (event.data.type === 'setOptions') {
        const opts = event.data.options;
        if (typeof opts.threshold === 'number') this.threshold = opts.threshold;
        if (typeof opts.requiredContinuousFrames === 'number')
          this.requiredContinuousFrames = opts.requiredContinuousFrames;
      }
    };
  }

  calculateRMS(input: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
      sum += input[i]! * input[i]!;
    }
    return Math.sqrt(sum / input.length);
  }

  process(inputs: Float32Array[][], _outputs: Float32Array[][], _parameters: Record<string, Float32Array>): boolean {
    if (!inputs || inputs.length === 0 || !inputs[0] || inputs[0].length === 0) return true;
    const input = inputs[0][0];
    if (!input) return true;

    const rms = this.calculateRMS(input);

    if (rms > this.threshold) {
      this.continuousCount++;
      if (!this.detected && this.continuousCount >= this.requiredContinuousFrames) {
        this.detected = true;
        this.port.postMessage({ type: 'musicStart', timestamp: currentTime });
      }
    } else {
      this.continuousCount = 0;
      this.detected = false;
    }
    return true;
  }
}

registerProcessor('onset-rms-processor', OnsetRMSProcessor);
