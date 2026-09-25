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
