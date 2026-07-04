// Mikro-Rohdaten (Float32) in ein sauberes 16-bit-PCM-WAV (mono, 16 kHz) packen.
// Von Whisper in jedem Browser zuverlässig dekodierbar. Gemeinsam genutzt von
// Sprach-Interview und Direkt-Aufnahme.

export function downsample(buf: Float32Array, inRate: number, outRate: number): Float32Array {
  if (outRate >= inRate) return buf;
  const ratio = inRate / outRate;
  const newLen = Math.round(buf.length / ratio);
  const res = new Float32Array(newLen);
  let o = 0;
  let i = 0;
  while (o < newLen) {
    const next = Math.round((o + 1) * ratio);
    let sum = 0;
    let cnt = 0;
    for (; i < next && i < buf.length; i++) {
      sum += buf[i];
      cnt++;
    }
    res[o] = cnt ? sum / cnt : 0;
    o++;
  }
  return res;
}

export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const rate = 16000;
  const out = downsample(samples, sampleRate, rate);
  const buffer = new ArrayBuffer(44 + out.length * 2);
  const view = new DataView(buffer);
  const wr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  wr(0, "RIFF");
  view.setUint32(4, 36 + out.length * 2, true);
  wr(8, "WAVE");
  wr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  wr(36, "data");
  view.setUint32(40, out.length * 2, true);
  let off = 44;
  for (let i = 0; i < out.length; i++) {
    const s = Math.max(-1, Math.min(1, out[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    off += 2;
  }
  return new Blob([view], { type: "audio/wav" });
}
