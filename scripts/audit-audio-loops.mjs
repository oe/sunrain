import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const soundsDir = new URL('../public/sounds/', import.meta.url);
const files = readdirSync(soundsDir)
  .filter((file) => /\.(mp3|webm)$/.test(file))
  .sort();

function decode(file) {
  const result = spawnSync(
    'ffmpeg',
    [
      '-v', 'error', '-i', new URL(file, soundsDir).pathname,
      '-f', 'f32le', '-acodec', 'pcm_f32le', '-ac', '2', '-ar', '48000', 'pipe:1'
    ],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  assert.equal(result.status, 0, result.stderr.toString() || `Could not decode ${file}`);
  return result.stdout;
}

function sample(buffer, index) {
  return buffer.readFloatLE(index * 4);
}

function rmsDb(buffer, startFrame, frameCount) {
  let sum = 0;
  for (let frame = startFrame; frame < startFrame + frameCount; frame += 1) {
    const left = sample(buffer, frame * 2);
    const right = sample(buffer, frame * 2 + 1);
    sum += left * left + right * right;
  }
  return 20 * Math.log10(Math.sqrt(sum / (frameCount * 2)) || Number.EPSILON);
}

for (const file of files) {
  const pcm = decode(file);
  const frameCount = pcm.length / 8;
  assert.ok(frameCount > 48_000 * 10, `${file} is unexpectedly short`);

  const seamJump = Math.max(
    Math.abs(sample(pcm, 0) - sample(pcm, (frameCount - 1) * 2)),
    Math.abs(sample(pcm, 1) - sample(pcm, (frameCount - 1) * 2 + 1))
  );
  const internalJumps = [];
  for (let frame = 24; frame < frameCount; frame += 24) {
    internalJumps.push(Math.max(
      Math.abs(sample(pcm, frame * 2) - sample(pcm, (frame - 1) * 2)),
      Math.abs(sample(pcm, frame * 2 + 1) - sample(pcm, (frame - 1) * 2 + 1))
    ));
  }
  internalJumps.sort((a, b) => a - b);
  const p99Jump = internalJumps[Math.floor(internalJumps.length * 0.99)];
  const seamRatio = seamJump / Math.max(p99Jump, Number.EPSILON);

  const windowFrames = 24_000;
  const levelDelta = Math.abs(
    rmsDb(pcm, 0, windowFrames) - rmsDb(pcm, frameCount - windowFrames, windowFrames)
  );

  assert.ok(seamRatio <= 1.5, `${file} has a sharp loop-boundary jump (${seamRatio.toFixed(2)}× p99)`);
  assert.ok(levelDelta <= 8.5, `${file} changes level by ${levelDelta.toFixed(2)} dB at the loop boundary`);
  console.log(`${file}: seam ${seamRatio.toFixed(2)}× p99, level delta ${levelDelta.toFixed(2)} dB`);
}

console.log('Audio loop audit passed.');
