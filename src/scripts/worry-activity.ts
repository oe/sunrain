// Uses the existing optional note fields and their explicit save/load/delete
// controls. Focus/part choices are page-only UI state, never new stored fields.
export function initWorryActivity(container:HTMLElement){
  const find=<T extends HTMLElement=HTMLElement>(selector:string)=>container.querySelector<T>(selector)!;
  const activity=find('#guided-activity'),reflection=find('#activity-reflection');
  const steps=[...activity.querySelectorAll<HTMLElement>('[data-guide-step]')];
  const progress=find('#guide-progress'),note=find<HTMLDetailsElement>('[data-activity-note]');
  const fields=[...note.querySelectorAll<HTMLTextAreaElement>('[data-note-field]')];
  const part=find<HTMLSelectElement>('#worry-part'),notice=find('[data-selection-notice]');
  const status=find('[data-worry-status]'),resetPanel=find<HTMLDetailsElement>('[data-worry-reset-panel]');
  const panels=[...container.querySelectorAll<HTMLElement>('[data-worry-summary]')];
  const examples=[...container.querySelectorAll<HTMLInputElement>('input[name="activity-example"]')];
  let current=0,reflected=false,lastExample='',lastNavigation=-Infinity;
  // Moving focus can scroll another link underneath a double-click's second
  // pointer event. Consume that repeat before it reaches its new target.
  const ignoreRepeat=(event:MouseEvent)=>{
    if(event.detail>1&&performance.now()-lastNavigation<500){event.preventDefault();event.stopImmediatePropagation();}
  };
  document.addEventListener('mousedown',ignoreRepeat,true);
  document.addEventListener('click',ignoreRepeat,true);

  function sync(){
    const focus=container.querySelector<HTMLInputElement>('input[name="worry-focus"]:checked');
    const values={focus:focus?.labels?.[0]?.textContent?.trim()||'',part:part.value?part.selectedOptions[0].textContent||'':'',action:fields[0].value,timing:fields[1].value,help:fields[2].value};
    const includePlan=reflected||current===3;
    for(const panel of panels){
      let visibleRows=0;
      for(const [key,value] of Object.entries(values)){
        const row=panel.querySelector<HTMLElement>(`[data-worry-summary-row="${key}"]`)!;
        row.querySelector<HTMLElement>('[data-worry-value]')!.textContent=value;
        row.hidden=!value.trim()||(!includePlan&&['action','timing','help'].includes(key));
        if(!row.hidden)visibleRows++;
      }
      panel.hidden=!visibleRows||(panel.dataset.worrySummary==='completion'?!reflected:reflected||current===0);
    }
    container.querySelectorAll<HTMLElement>('[data-worry-no-action]').forEach(el=>el.hidden=!!values.action.trim());
    find('[data-worry-outside]').hidden=!['outside','unsure'].includes(part.value);
    examples.forEach(input=>input.checked=input.value===values.action);
    // Existing contact preparation can include these two public choices in its
    // existing record field when the user explicitly asks to prepare support.
    find('[data-activity-context]').textContent=['focus','part'].flatMap(key=>{
      const value=values[key as 'focus'|'part'];
      const label=panels[0].querySelector(`[data-worry-summary-row="${key}"] dt`)!.textContent;
      return value?[`${label}\n${value}`]:[];
    }).join('\n');
  }
  function render(focus=false){
    activity.hidden=reflected;reflection.hidden=!reflected;
    steps.forEach((step,i)=>step.hidden=i!==current);
    progress.textContent=activity.dataset.stepLabel!.replace('{current}',String(current+1)).replace('{total}',String(steps.length));
    find('#guide-back').hidden=current===0;
    find('#guide-next').hidden=current===steps.length-1;
    find('#guide-finish').hidden=current!==steps.length-1;
    // Move one existing note, never clone inputs or create a second saved plan.
    find(reflected||current!==2?'[data-worry-note-home]':'[data-worry-note-slot]').append(note);
    note.hidden=!reflected&&current!==2;
    sync();
    if(focus){progress.focus({preventScroll:true});progress.scrollIntoView({block:'start',behavior:'instant'});}
  }
  function feedback(){
    const value=container.querySelector<HTMLInputElement>('input[name="feedback"]:checked')?.value;
    find('#feedback-intro').hidden=!!value;
    ['better','same','worse'].forEach(key=>find(`#feedback-${key}`).hidden=value!==key);
    find('#feedback-urgent').hidden=value!=='worse';
    find('#other-activities').hidden=value==='worse';
    find('[data-worry-edit]').hidden=value==='worse';
    resetPanel.hidden=value==='worse';
  }
  function reset(focus=false){
    if(focus)lastNavigation=performance.now();
    current=0;reflected=false;lastExample='';
    container.querySelectorAll<HTMLInputElement>('input[type="radio"]').forEach(input=>input.checked=false);
    part.value='';
    fields.forEach(field=>{field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));});
    note.open=false;resetPanel.open=false;
    find<HTMLDetailsElement>('.activity-examples').open=false;
    note.querySelector<HTMLElement>('[data-note-status]')!.textContent='';
    notice.hidden=true;status.textContent='';feedback();render(focus);
  }
  function reflect(){
    if(reflected)return;
    lastNavigation=performance.now();
    reflected=true;note.open=false;status.textContent='';render();
    const summary=find('[data-worry-summary="completion"]');
    const target=summary.hidden?find('[data-worry-feedback-title]'):summary;
    target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});
  }
  for(const [selector,delta] of [['#guide-back',-1],['#guide-next',1]] as const){
    find(selector).addEventListener('click',event=>{
      if(event.detail>1||reflected)return;
      lastNavigation=performance.now();
      current=Math.max(0,Math.min(steps.length-1,current+delta));status.textContent='';render(true);
    });
  }
  activity.querySelectorAll<HTMLButtonElement>('#guide-controls button').forEach(button=>button.addEventListener('keydown',event=>{
    if(event.repeat&&['Enter',' '].includes(event.key))event.preventDefault();
  }));
  find('#guide-finish').addEventListener('click',reflect);
  find('#guide-stop').addEventListener('click',reflect);
  container.addEventListener('change',event=>{
    const target=event.target as HTMLInputElement|HTMLSelectElement;
    if(target instanceof HTMLInputElement&&target.name==='activity-example'){
      if(fields[0].value&&fields[0].value!==lastExample){sync();notice.hidden=false;return;}
      fields[0].value=target.value;lastExample=target.value;
      fields[0].dispatchEvent(new Event('input',{bubbles:true}));
    }else if(target===part||(target instanceof HTMLInputElement&&target.name==='worry-focus')){
      sync();status.textContent=fields[0].value?container.dataset.contextChanged||'':'';
    }
  });
  fields.forEach(field=>field.addEventListener('input',()=>{notice.hidden=true;sync();}));
  note.addEventListener('click',event=>{
    const button=(event.target as Element).closest<HTMLButtonElement>('[data-note-action]');
    if(!button||!['load','clear'].includes(button.dataset.noteAction||''))return;
    queueMicrotask(()=>{if(button.dataset.noteAction==='clear')lastExample='';notice.hidden=true;sync();});
  });
  find('#activity-feedback').addEventListener('change',feedback);
  find('[data-worry-edit]').addEventListener('click',()=>{
    lastNavigation=performance.now();
    reflected=false;current=2;status.textContent='';render();note.open=true;
    fields[0].focus({preventScroll:true});fields[0].scrollIntoView({block:'center',behavior:'instant'});
  });
  find('[data-worry-reset]').addEventListener('click',()=>reset(true));
  window.addEventListener('pageshow',event=>{if(event.persisted)reset(true);});
  find('#guide-controls').hidden=false;progress.hidden=false;reset();
}
