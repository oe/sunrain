import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readBuildMetadata } from './build-metadata.mjs';

/** Reject stale, dirty or mismatched builds, including after artifact transfer. */
export function verifyBuildIdentity(root, expectedCommit) {
  const built = JSON.parse(readFileSync(join(root, 'dist/build-metadata.json'), 'utf8'));
  assert.deepEqual(built, readBuildMetadata(root), 'Build identity differs from the checked-out source');
  assert.equal(built.sourceState, 'clean', 'Production builds require clean source');
  assert.match(built.sourceHash, /^[a-f0-9]{64}$/);
  if (expectedCommit) assert.equal(built.commit, expectedCommit, 'Build is from a different CI commit');
  return built;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const built = verifyBuildIdentity(process.cwd(), process.env.GITHUB_SHA);
  console.log(`Verified clean build ${built.commit} (${built.sourceHash}).`);
}
