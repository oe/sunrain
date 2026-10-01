import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { buildMetadata, readBuildMetadata } from '../../scripts/build-metadata.mjs';

function fixture(t, withGit = true) {
  const root = mkdtempSync(join(tmpdir(), 'sunrain-metadata-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' }).trim();
  if (withGit) {
    git('init');
    git('config', 'user.email', 'metadata-test@example.invalid');
    git('config', 'user.name', 'Metadata test');
    writeFileSync(join(root, '.gitignore'), 'dist/\nignored.txt\n');
    writeFileSync(join(root, 'source.txt'), 'initial source\n');
    git('add', '.');
    git('commit', '-m', 'Fixture');
  }
  return { root, git };
}

test('clean source has a deterministic fingerprint and the actual full commit', (t) => {
  const { root, git } = fixture(t);
  const metadata = readBuildMetadata(root);
  assert.equal(metadata.commit, git('rev-parse', 'HEAD'));
  assert.equal(metadata.sourceState, 'clean');
  assert.match(metadata.sourceHash, /^[a-f0-9]{64}$/);
  assert.deepEqual(readBuildMetadata(root), metadata);
  writeFileSync(join(root, 'ignored.txt'), 'local output');
  assert.deepEqual(readBuildMetadata(root), metadata);
});

test('modified, staged, untracked, and deleted files cannot masquerade as HEAD', (t) => {
  const { root, git } = fixture(t);
  const clean = readBuildMetadata(root);
  writeFileSync(join(root, 'source.txt'), 'changed source\n');
  const modified = readBuildMetadata(root);
  assert.equal(modified.sourceState, 'dirty');
  assert.equal(modified.commit, clean.commit);
  assert.notEqual(modified.sourceHash, clean.sourceHash);
  git('add', 'source.txt');
  assert.deepEqual(readBuildMetadata(root), modified);
  writeFileSync(join(root, 'new file.txt'), 'untracked input');
  const untracked = readBuildMetadata(root);
  assert.equal(untracked.sourceState, 'dirty');
  assert.notEqual(untracked.sourceHash, modified.sourceHash);
  unlinkSync(join(root, 'source.txt'));
  const deleted = readBuildMetadata(root);
  assert.equal(deleted.sourceState, 'dirty');
  assert.notEqual(deleted.sourceHash, untracked.sourceHash);
});

test('file mode and symlink target changes affect the source fingerprint', (t) => {
  const { root } = fixture(t);
  const initial = readBuildMetadata(root);
  chmodSync(join(root, 'source.txt'), 0o755);
  const executable = readBuildMetadata(root);
  assert.notEqual(executable.sourceHash, initial.sourceHash);
  symlinkSync('source.txt', join(root, 'link.txt'));
  const linked = readBuildMetadata(root);
  assert.notEqual(linked.sourceHash, executable.sourceHash);
  unlinkSync(join(root, 'link.txt'));
  symlinkSync('different.txt', join(root, 'link.txt'));
  assert.notEqual(readBuildMetadata(root).sourceHash, linked.sourceHash);
});

test('Git-less source is explicitly unknown instead of adopting a CI SHA', (t) => {
  const { root } = fixture(t, false);
  assert.deepEqual(readBuildMetadata(root), {
    schemaVersion: 1, commit: null, sourceState: 'unknown', sourceHash: null,
  });
});

test('production hook emits the identity into the configured output directory', (t) => {
  const { root } = fixture(t);
  const dir = pathToFileURL(`${join(root, 'dist')}/`);
  mkdirSync(dir);
  const integration = buildMetadata(root);
  integration.hooks['astro:build:start']({ logger: { warn() {} } });
  integration.hooks['astro:build:done']({ dir });
  const metadata = JSON.parse(readFileSync(new URL('build-metadata.json', dir), 'utf8'));
  assert.deepEqual(metadata, readBuildMetadata(root));
  assert.equal(metadata.sourceState, 'clean');
});

test('production hook rejects source edits during a build', (t) => {
  const { root } = fixture(t);
  const integration = buildMetadata(root);
  integration.hooks['astro:build:start']({ logger: { warn() {} } });
  writeFileSync(join(root, 'source.txt'), 'changed while building');
  assert.throws(() => integration.hooks['astro:build:done']({ dir: pathToFileURL(`${root}/`) }),
    /Source changed during the build/);
});
