import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createAudioRecovery } from '../../src/lib/soundscape/audio-recovery.ts';

for (const state of ['suspended', 'interrupted']) {
  test(`recovers ${state} audio without creating playback`, async () => {
    let resumes = 0, synced = 0;
    const context = { state, async resume() { resumes++; this.state = 'running'; } };
    const recover = createAudioRecovery(() => context, () => true, () => synced++);
    await Promise.all([recover(), recover(), recover()]);
    assert.equal(resumes, 1);
    assert.equal(synced, 1);
    await recover();
    assert.equal(resumes, 1);
  });
}

test('does not revive stopped, hidden, running, closed, or missing audio', async () => {
  let resumes = 0;
  for (const state of ['running', 'closed']) {
    await createAudioRecovery(() => ({ state, async resume() { resumes++; } }), () => true, () => {})();
  }
  await createAudioRecovery(() => null, () => true, () => {})();
  await createAudioRecovery(() => ({ state: 'suspended', async resume() { resumes++; } }), () => false, () => {})();
  assert.equal(resumes, 0);
});

test('retries a blocked resume on the next gesture', async () => {
  let resumes = 0, synced = 0;
  const context = { state: 'interrupted', async resume() {
    if (++resumes === 1) throw new Error('User gesture required');
    this.state = 'running';
  } };
  const recover = createAudioRecovery(() => context, () => true, () => synced++);
  await recover();
  assert.equal(synced, 0);
  await recover();
  assert.equal(resumes, 2);
  assert.equal(synced, 1);
});

test('a stop before the pending attempt cancels recovery', async () => {
  let active = true, resumes = 0, synced = 0;
  const recover = createAudioRecovery(() => ({ state: 'suspended', async resume() { resumes++; } }), () => active, () => synced++);
  const pending = recover();
  active = false;
  await pending;
  assert.equal(resumes, 0);
  assert.equal(synced, 0);
});
