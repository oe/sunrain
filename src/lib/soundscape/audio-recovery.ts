/** A browser may interrupt Web Audio while a phone is locked or backgrounded.
 * Resume only an existing listening session, never start or recreate a track.
 * A rejected foreground resume is retried on the next user gesture. */
export function createAudioRecovery(
  context: () => { state: string; resume: () => Promise<void> } | null,
  shouldResume: () => boolean,
  onResume: () => void,
) {
  let pending: Promise<void> | undefined;
  return function recover() {
    const audio = context();
    if (!shouldResume() || !audio || !['suspended', 'interrupted'].includes(audio.state))
      return Promise.resolve();
    if (pending) return pending;
    pending = Promise.resolve()
      .then(() => {
        if (shouldResume()) return audio.resume();
      })
      .then(() => {
        if (shouldResume() && audio.state === 'running') onResume();
      })
      .catch(() => { /* Autoplay policy can require the next user gesture. */ })
      .finally(() => { pending = undefined; });
    return pending;
  };
}
