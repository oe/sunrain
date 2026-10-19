// No network or storage access occurs at module import or while typing.
export const NOTE_VERSION = 1;
export const MAX_NOTE_LENGTH = 2000;
export function parseNote(raw, kind, language, count) {
  try {
    if (typeof raw !== 'string' || raw.length > 60000) return null;
    const note = JSON.parse(raw);
    if (note?.version !== NOTE_VERSION || note.kind !== kind || note.language !== language ||
        !Array.isArray(note.fields) || note.fields.length !== count ||
        !note.fields.every(v => typeof v === 'string' && v.length <= MAX_NOTE_LENGTH)) return null;
    return note.fields;
  } catch { return null; }
}
export function makeNote(fields, kind, language) {
  if (!Array.isArray(fields) || !fields.every(v => typeof v === 'string' && v.length <= MAX_NOTE_LENGTH)) throw new Error('Invalid note');
  return { version: NOTE_VERSION, kind, language, fields, savedAt: new Date().toISOString() };
}
