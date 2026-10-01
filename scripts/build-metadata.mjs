import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { lstatSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** @typedef {{ schemaVersion: 1, commit: string | null, sourceState: 'clean' | 'dirty' | 'unknown', sourceHash: string | null }} BuildMetadata */

/**
 * Identify the checked-out source, not just HEAD. The fingerprint covers tracked
 * and non-ignored untracked files, including deletions, modes, and symlinks.
 * Ignored local files (including .env), installed dependencies, and output are
 * intentionally outside this identity; CI installs the committed lockfile.
 * @param {string} root
 * @returns {BuildMetadata}
 */
export function readBuildMetadata(root) {
  const git = (...args) => execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
  }).trimEnd();
  /** @type {BuildMetadata} */
  const metadata = { schemaVersion: 1, commit: null, sourceState: 'unknown', sourceHash: null };

  try {
    metadata.commit = git('rev-parse', '--verify', 'HEAD');
    const status = git('status', '--porcelain=v1', '--untracked-files=all');
    const paths = [...new Set(git('ls-files', '--cached', '--others', '--exclude-standard', '-z')
      .split('\0').filter(Boolean))].sort();
    const fingerprint = createHash('sha256');

    for (const path of paths) {
      const absolute = join(root, path);
      let record;
      try {
        const stat = lstatSync(absolute);
        if (stat.isSymbolicLink()) {
          record = [path, 'symlink', readlinkSync(absolute)];
        } else if (stat.isFile()) {
          const content = createHash('sha256').update(readFileSync(absolute)).digest('hex');
          record = [path, 'file', Boolean(stat.mode & 0o111), content];
        } else {
          // A submodule or other non-file input cannot be represented faithfully.
          throw new Error(`Unsupported source entry: ${path}`);
        }
      } catch (error) {
        if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'ENOENT') throw error;
        record = [path, 'deleted'];
      }
      fingerprint.update(`${JSON.stringify(record)}\n`);
    }

    metadata.sourceHash = fingerprint.digest('hex');
    metadata.sourceState = status ? 'dirty' : 'clean';
  } catch {
    // Never substitute a CI environment variable or claim unknown source is clean.
    metadata.sourceHash = null;
    metadata.sourceState = 'unknown';
  }
  return metadata;
}

/**
 * Emit one static identity after checking that the source stayed unchanged.
 * @param {string} root
 * @returns {import('astro').AstroIntegration}
 */
export function buildMetadata(root) {
  /** @type {BuildMetadata | undefined} */
  let source;
  return {
    name: 'sunrain-build-metadata',
    hooks: {
      'astro:build:start': ({ logger }) => {
        source = readBuildMetadata(root);
        if (source.sourceState === 'unknown') logger.warn('Build source identity could not be verified.');
      },
      'astro:build:done': ({ dir }) => {
        if (!source || JSON.stringify(source) !== JSON.stringify(readBuildMetadata(root))) {
          throw new Error('Source changed during the build. Rebuild before testing or deploying.');
        }
        writeFileSync(new URL('build-metadata.json', dir), `${JSON.stringify(source, null, 2)}\n`);
      },
    },
  };
}
