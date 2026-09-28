// Structural/loop-boundary checks complement, but do not replace, visual review.
import { readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const root = new URL("../public/scenes/", import.meta.url);
const manifest = JSON.parse(readFileSync(new URL("motion-sources.json", root)));
const frameSize = 160 * 90;
function fastStart(data) {
  const boxes = [];
  for (let offset = 0; offset + 8 <= data.length; ) {
    let size = data.readUInt32BE(offset);
    boxes.push(data.toString("ascii", offset + 4, offset + 8));
    if (size === 1) size = Number(data.readBigUInt64BE(offset + 8));
    if (!size) break;
    assert.ok(size >= 8, "Invalid MP4 box");
    offset += size;
  }
  return (
    boxes.includes("moov") && boxes.indexOf("moov") < boxes.indexOf("mdat")
  );
}
function difference(frames, a, b) {
  let sum = 0;
  for (let i = 0; i < frameSize; i++)
    sum += Math.abs(frames[a * frameSize + i] - frames[b * frameSize + i]);
  return sum / frameSize;
}
function correlation(a, b) {
  const ma = a.reduce((s, v) => s + v, 0) / a.length;
  const mb = b.reduce((s, v) => s + v, 0) / b.length;
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] - ma,
      y = b[i] - mb;
    dot += x * y;
    aa += x * x;
    bb += y * y;
  }
  return dot / Math.max(1e-8, Math.sqrt(aa * bb));
}
function patch(frames, frame, x, y, w, h) {
  return Array.from(
    { length: w * h },
    (_, i) =>
      frames[frame * frameSize + (y + Math.floor(i / w)) * 160 + x + (i % w)],
  );
}
for (const scene of manifest.scenes) {
  for (const mobile of [false, true]) {
    const name = `${scene.id}-loop${mobile ? "-mobile" : ""}.mp4`;
    const path = new URL(name, root).pathname;
    const probe = JSON.parse(
      execFileSync("ffprobe", [
        "-v",
        "error",
        "-show_streams",
        "-show_format",
        "-of",
        "json",
        path,
      ]),
    );
    assert.equal(
      probe.streams.length,
      1,
      `${name}: must contain only silent video`,
    );
    const video = probe.streams[0];
    assert.equal(video.codec_name, "h264");
    assert.equal(video.pix_fmt, "yuv420p");
    assert.equal(video.width, mobile ? 1280 : 1920);
    assert.equal(video.height, mobile ? 720 : 1080);
    assert.equal(video.avg_frame_rate, "24/1");
    assert.ok(
      Math.abs(Number(video.duration) - (scene.length - scene.overlap)) < 0.05,
    );
    assert.ok(
      statSync(path).size < 12 * 1024 * 1024,
      `${name}: asset budget exceeded`,
    );
    assert.ok(fastStart(readFileSync(path)), `${name}: missing faststart`);
    const frames = execFileSync(
      "ffmpeg",
      [
        "-v",
        "error",
        "-i",
        path,
        "-vf",
        "scale=160:90",
        "-pix_fmt",
        "gray",
        "-f",
        "rawvideo",
        "-",
      ],
      { maxBuffer: 24 * 1024 * 1024 },
    );
    const count = frames.length / frameSize;
    if (scene.id === "stream") {
      const reference = patch(frames, 0, 4, 58, 18, 25);
      const drift = Math.max(
        ...Array.from({ length: count }, (_, f) => {
          const current = patch(frames, f, 4, 58, 18, 25);
          return (
            current.reduce((s, v, i) => s + Math.abs(v - reference[i]), 0) /
            current.length
          );
        }),
      );
      assert.ok(drift < 0.5, `${name}: fixed bank changes (${drift})`);
    }
    if (scene.id === "fire") {
      // Brightness-normalized mortar edge: test every frame, not just the seam.
      const reference = patch(frames, Math.floor(count / 2), 1, 72, 6, 12);
      let fixed = 0;
      for (let f = 0; f < count; f++) {
        const scores = [-2, -1, 0, 1, 2].map((dy) =>
          correlation(reference, patch(frames, f, 1, 72 + dy, 6, 12)),
        );
        if (scores[2] > 0.85 && scores[2] >= Math.max(...scores) - 0.015)
          fixed++;
      }
      assert.ok(
        fixed / count > 0.9,
        `${name}: mortar edge drifts (${fixed}/${count} stable frames)`,
      );
    }
    const differences = Array.from({ length: count - 1 }, (_, i) =>
      difference(frames, i, i + 1),
    ).sort((a, b) => a - b);
    const p99 = differences[Math.floor(differences.length * 0.99)];
    const seam = difference(frames, count - 1, 0);
    assert.ok(p99 > 0.02, `${name}: no motion detected`);
    assert.ok(
      seam <= p99 * 1.6,
      `${name}: boundary jump ${seam} > ${p99} * 1.6`,
    );
    console.log(
      `${name}: ${(statSync(path).size / 1048576).toFixed(2)} MiB, ${video.duration}s, boundary/P99 ${(seam / p99).toFixed(2)} — PASS`,
    );
  }
  assert.ok(statSync(new URL(`${scene.id}-poster.jpg`, root)).size > 0);
}
