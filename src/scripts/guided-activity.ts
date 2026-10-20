import { initPrivateNotes } from './private-notes';

const initialized=new WeakSet<HTMLElement>();
export function initGuidedActivities(root:ParentNode=document){
  initPrivateNotes(root);
  for(const container of root.querySelectorAll<HTMLElement>('[data-guided-activity]')){
  if(initialized.has(container))continue;initialized.add(container);
  const byId=(id:string)=>container.querySelector<HTMLElement>(`#${id}`);
  const activity=byId('guided-activity');
  const steps=[...activity.querySelectorAll<HTMLElement>('[data-guide-step]')];
  const progress=byId('guide-progress');
  const reflection=byId('activity-reflection');
  const note=container.querySelector<HTMLDetailsElement>('[data-activity-note]');
  // Progressive enhancement: the complete guide remains available without JS.
  reflection.hidden=true;note.hidden=true;
  let current=0;
  function render(focus=false){
    steps.forEach((step,i)=>step.hidden=i!==current);
    progress.textContent=activity.dataset.stepLabel.replace('{current}',String(current+1)).replace('{total}',String(steps.length));
    byId('guide-back').hidden=current===0;
    byId('guide-next').hidden=current===steps.length-1;
    byId('guide-finish').hidden=current!==steps.length-1;
    if(focus){progress.focus({preventScroll:true});progress.scrollIntoView({block:'start',behavior:'instant'});}
  }
  byId('guide-controls').hidden=false;progress.hidden=false;render();
  byId('guide-back').addEventListener('click',()=>{current=Math.max(0,current-1);render(true);});
  byId('guide-next').addEventListener('click',()=>{current=Math.min(steps.length-1,current+1);render(true);});
  function reflect(){
    reflection.hidden=false;note.hidden=false;
    const title=container.querySelector<HTMLElement>('#activity-reflection h2');
    title.focus({preventScroll:true});title.scrollIntoView({block:'start',behavior:'instant'});
  }
  byId('guide-finish').addEventListener('click',reflect);
  byId('guide-stop').addEventListener('click',reflect);
  let lastExample='';
  activity.addEventListener('change',event=>{
    const input=event.target as HTMLInputElement;
    if(input.name!=='activity-example')return;
    const note=container.querySelector<HTMLTextAreaElement>('[data-activity-note] [data-note-field]');
    if(note.value && note.value!==lastExample)return;
    note.value=input.value;lastExample=input.value;note.dispatchEvent(new Event('input',{bubbles:true}));
  });
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
    current=0;render();
    reflection.hidden=true;note.hidden=true;note.open=false;
  });

  }
}
