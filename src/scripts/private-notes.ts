
import { makeNote, parseNote, formatContact } from '@/lib/private-notes.mjs';
const initialized=new WeakSet<HTMLElement>();
export function initPrivateNotes(root:ParentNode=document){
  for (const container of root.querySelectorAll<HTMLElement>('.private-notes')) {
    if(initialized.has(container))continue;
    initialized.add(container);
    const {kind,language} = container.dataset;
    const key = `sunrain_note_v1:${kind}:${language}`;
    const fields = [...container.querySelectorAll<HTMLTextAreaElement>('[data-note-field]')];
    const status = container.querySelector<HTMLElement>('[data-note-status]');
    const preview = container.querySelector<HTMLElement>('[data-contact-preview]');
    function updatePreview() {
      if (!preview) return;
      preview.textContent = formatContact(container.dataset.template,JSON.parse(container.dataset.labels),fields.map(field=>field.value));
    }
    fields.forEach(field => field.addEventListener('input',updatePreview));
    updatePreview();
    window.addEventListener('pageshow', event => {
      if (event.persisted) { fields.forEach(field => field.value=''); updatePreview(); status.textContent=''; }
    });
    container.querySelector<HTMLElement>('[data-note-controls]').hidden = false;
    container.querySelectorAll<HTMLButtonElement>('[data-note-action]').forEach(button => button.addEventListener('click', async () => {
      try {
        const action = button.dataset.noteAction;
        if(action === 'copy') {
          try { await navigator.clipboard.writeText(preview.textContent); status.textContent=container.dataset.copied; }
          catch { status.textContent=container.dataset.copyFailed; }
        } else if(action === 'download') {
          const body = preview ? preview.textContent : fields.map(field => `${field.labels?.[0]?.firstChild?.textContent || ''}\n${field.value}`).join('\n\n');
          const url = URL.createObjectURL(new Blob([body], {type:'text/plain;charset=utf-8'}));
          const a = document.createElement('a'); a.href = url; a.download = 'sunrain-private-note.txt'; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        } else if(action === 'save') {
          localStorage.setItem(key, JSON.stringify(makeNote(fields.map(f => f.value),kind,language)));
          status.textContent = container.dataset.saved;
        } else if(action === 'load') {
          const raw = localStorage.getItem(key);
          if(raw === null) { status.textContent = container.dataset.empty; return; }
          const note = parseNote(raw,kind,language,fields.length);
          if(!note) throw new Error('Invalid saved note');
          fields.forEach((f,i) => f.value = note[i]);
          updatePreview();
          status.textContent = container.dataset.saved;
        } else if(action === 'clear') {
          localStorage.removeItem(key); fields.forEach(f => f.value = '');
          updatePreview();
          status.textContent = container.dataset.deleted;
        }
      } catch { status.textContent = container.dataset.failed; }
    }));
  }
}
