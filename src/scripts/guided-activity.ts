import { initPrivateNotes } from './private-notes';
import { initWorryActivity } from './worry-activity';

const initialized=new WeakSet<HTMLElement>();
export function initGuidedActivities(root:ParentNode=document){
  initPrivateNotes(root);
  for(const container of root.querySelectorAll<HTMLElement>('[data-guided-activity]')){
  if(initialized.has(container))continue;initialized.add(container);
  if(container.hasAttribute('data-worry-activity')){initWorryActivity(container);continue;}
  const byId=(id:string)=>container.querySelector<HTMLElement>(`#${id}`);
  const activity=byId('guided-activity');
  const steps=[...activity.querySelectorAll<HTMLElement>('[data-guide-step]')];
  const progress=byId('guide-progress');
  const reflection=byId('activity-reflection');
  const note=container.querySelector<HTMLDetailsElement>('[data-activity-note]');
  const selectionPanels=[...container.querySelectorAll<HTMLElement>('[data-activity-selection]')];
  const actionField=note.querySelector<HTMLTextAreaElement>('[data-note-field]');
  const selectionNotice=container.querySelector<HTMLElement>('[data-selection-notice]');
  // Progressive enhancement: the complete guide remains available without JS.
  reflection.hidden=true;note.hidden=true;
  let current=0;
  let lastExample='';
  function syncSelection(){
    if(!selectionPanels.length)return;
    const value=actionField.value;
    selectionPanels.forEach(panel=>{
      panel.querySelector<HTMLElement>('[data-selected-action]').textContent=value;
      panel.hidden=!value.trim()||(panel.dataset.activitySelection==='current'&&current===0);
    });
    // The existing optional note is the source of truth, including manual edits
    // and explicit load/clear actions. A radio must not suggest a different plan.
    activity.querySelectorAll<HTMLInputElement>('input[name="activity-example"]').forEach(input=>input.checked=input.value===value);
  }
  function render(focus=false){
    steps.forEach((step,i)=>step.hidden=i!==current);
    progress.textContent=activity.dataset.stepLabel.replace('{current}',String(current+1)).replace('{total}',String(steps.length));
    byId('guide-back').hidden=current===0;
    byId('guide-next').hidden=current===steps.length-1;
    byId('guide-finish').hidden=current!==steps.length-1;
    syncSelection();
    if(focus){progress.focus({preventScroll:true});progress.scrollIntoView({block:'start',behavior:'instant'});}
  }
  byId('guide-controls').hidden=false;progress.hidden=false;render();
  byId('guide-back').addEventListener('click',()=>{current=Math.max(0,current-1);render(true);});
  byId('guide-next').addEventListener('click',()=>{current=Math.min(steps.length-1,current+1);render(true);});
  function reflect(){
    reflection.hidden=false;note.hidden=false;
    syncSelection();
    const completion=container.querySelector<HTMLElement>('[data-activity-selection="completion"]');
    const title=completion&&!completion.hidden?completion:container.querySelector<HTMLElement>('#activity-reflection h2');
    title.focus({preventScroll:true});title.scrollIntoView({block:'start',behavior:'instant'});
  }
  byId('guide-finish').addEventListener('click',reflect);
  byId('guide-stop').addEventListener('click',reflect);
  activity.addEventListener('change',event=>{
    const input=event.target as HTMLInputElement;
    if(input.name!=='activity-example')return;
    if(actionField.value && actionField.value!==lastExample){
      syncSelection();if(selectionNotice)selectionNotice.hidden=false;return;
    }
    actionField.value=input.value;lastExample=input.value;actionField.dispatchEvent(new Event('input',{bubbles:true}));
  });
  if(selectionPanels.length){
    actionField.addEventListener('input',()=>{syncSelection();selectionNotice.hidden=true;});
    note.addEventListener('click',event=>{
      const button=(event.target as Element).closest<HTMLButtonElement>('[data-note-action]');
      if(!button||!['load','clear'].includes(button.dataset.noteAction))return;
      // PrivateNotes handles these existing controls first; observe its result
      // without adding storage, changing the note schema or loading on our own.
      queueMicrotask(()=>{if(button.dataset.noteAction==='clear')lastExample='';syncSelection();selectionNotice.hidden=true;});
    });
  }
  byId('activity-feedback')?.addEventListener('change',event=>{
    const value=(event.target as HTMLInputElement).value;
    byId('feedback-intro').hidden=true;
    byId('feedback-better').hidden=value!=='better';
    byId('feedback-same').hidden=value!=='same';
    byId('feedback-worse').hidden=value!=='worse';
    byId('feedback-urgent').hidden=value!=='worse';
    byId('other-activities').hidden=value==='worse';
  });
  window.addEventListener('pageshow',event=>{
    if(!event.persisted)return;
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input=>input.checked=false);
    ['better','same','worse'].forEach(value=>byId(`feedback-${value}`).hidden=true);
    byId('feedback-intro').hidden=false;
    byId('feedback-urgent').hidden=true;byId('other-activities').hidden=false;
    current=0;lastExample='';if(selectionNotice)selectionNotice.hidden=true;render();
    reflection.hidden=true;note.hidden=true;note.open=false;
  });

  }
}
