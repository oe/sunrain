import {makeScreeningReport} from '@/lib/screening.mjs';

// All responses stay in this document. No URL, storage, telemetry or server handoff.
export function initScreeningFlow() {
  const app=document.querySelector<HTMLElement>('#screening-flow');
  if(!app)return;
  const copy=JSON.parse(app.dataset.copy);
  const host=document.getElementById('check-in-app');
  const general=document.getElementById('check-in-form');
  const result=document.getElementById('check-in-result');
  const age=app.querySelector<HTMLSelectElement>('#screening-age');
  const chooseError=app.querySelector<HTMLElement>('#screening-selection-error');
  const begin=document.getElementById('start-screening');
  const stages=[...app.querySelectorAll<HTMLElement>('[data-screen-stage]')];
  const ids:string[]=JSON.parse(app.dataset.tools);
  let queue:string[]=[],position=-1;
  const groupSize=3;
  const groups=new Map<string,number>();
  const number=new Intl.NumberFormat(document.documentElement.lang);
  const format=(text:string,values:Record<string,number>)=>Object.entries(values).reduce((s,[key,value])=>s.replaceAll(`{${key}}`,number.format(value)),text);
  const skipped=new Set<string>();
  const focus=(el:HTMLElement)=>{el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:'instant'});};
  function show(id:string,moveFocus=true) {
    general.hidden=true;result.hidden=true;app.hidden=false;
    stages.forEach(stage=>stage.hidden=stage.dataset.screenStage!==id);
    app.querySelector<HTMLElement>('#screening-end').hidden=id==='choose';
    const stage=stages.find(stage=>stage.dataset.screenStage===id);
    const progress=stage.querySelector<HTMLElement>('[data-screening-progress]');
    if(progress)progress.textContent=format(copy.toolProgress,{current:position+1,total:queue.length});
    renderGroup(stage);
    if(moveFocus)focus(stage.querySelector<HTMLElement>('h2'));
  }
  function reset() {
    age.value='';queue=[];position=-1;skipped.clear();groups.clear();chooseError.textContent='';
    app.querySelectorAll<HTMLInputElement>('input').forEach(input=>input.checked=input.name==='screening-tool');
    app.querySelectorAll<HTMLElement>('[data-screening-error]').forEach(el=>el.textContent='');
    const safety=app.querySelector<HTMLElement>('#screening-live-safety');if(safety)safety.hidden=true;
    app.querySelector<HTMLElement>('#screening-age-alternative').hidden=true;
    app.querySelector<HTMLElement>('#screening-age-help').hidden=true;
    app.querySelector<HTMLElement>('#screening-tool-choices').hidden=false;
    app.querySelector<HTMLElement>('[data-screening-count]').hidden=false;
    app.querySelector<HTMLButtonElement>('#screening-start-tools').disabled=false;
    updateCount();
  }
  function questions(stage:HTMLElement){return [...stage.querySelectorAll<HTMLElement>('[data-screening-question]')];}
  function updateCount(){
    const count=[...app.querySelectorAll<HTMLInputElement>('input[name="screening-tool"]:checked')].reduce((sum,input)=>sum+questions(stages.find(stage=>stage.dataset.screenStage===input.value)).length,0);
    app.querySelector<HTMLElement>('[data-screening-count]').textContent=format(copy.selectionCount,{count});
  }
  function renderGroup(stage:HTMLElement){
    const items=questions(stage);if(!items.length)return;
    const group=groups.get(stage.dataset.screenStage)||0,first=group*groupSize,last=Math.min(first+groupSize,items.length);
    items.forEach((question,i)=>question.closest('li').hidden=i<first||i>=last);
    stage.querySelector<HTMLElement>('[data-answer-progress]').textContent=format(copy.answerProgress,{first:first+1,last,answered:items.filter(q=>q.querySelector('input:checked')).length,count:items.length});
  }
  function moveGroup(stage:HTMLElement,group:number){
    groups.set(stage.dataset.screenStage,group);renderGroup(stage);
    const progress=stage.querySelector<HTMLElement>('[data-answer-progress]');progress.tabIndex=-1;focus(progress);
  }
  begin.hidden=false;
  begin.addEventListener('click',()=>show('choose'));
  app.querySelectorAll('[data-screening-exit],#screening-end').forEach(button=>button.addEventListener('click',()=>{
    // Exit also forgets answers so returning cannot expose a previous record.
    reset();app.hidden=true;general.hidden=false;result.hidden=true;
    host.dispatchEvent(new CustomEvent('sunrain:general-support'));
  }));
  age.addEventListener('change',()=>{
    const alternative=['child','declined'].includes(age.value);
    app.querySelector<HTMLElement>('#screening-age-alternative').hidden=!alternative;
    app.querySelector<HTMLElement>('#screening-age-help').hidden=age.value===''||age.value==='adult';
    app.querySelector<HTMLElement>('#screening-tool-choices').hidden=alternative;
    app.querySelector<HTMLElement>('[data-screening-count]').hidden=alternative;
    app.querySelector<HTMLButtonElement>('#screening-start-tools').disabled=alternative;
    chooseError.textContent='';
  });
  app.querySelector('#screening-start-tools').addEventListener('click',()=>{
    queue=[...app.querySelectorAll<HTMLInputElement>('input[name="screening-tool"]:checked')].map(input=>input.value);
    if(!['youth','adult'].includes(age.value)||!queue.length){chooseError.textContent=copy.selectError;focus(chooseError);return;}
    chooseError.textContent='';position=0;
    for(const id of ids)if(!queue.includes(id)){
      stages.find(stage=>stage.dataset.screenStage===id)?.querySelectorAll<HTMLInputElement>('input').forEach(input=>input.checked=false);
      skipped.delete(id);
    }
    queue.forEach(id=>groups.set(id,0));updateSafety();show(queue[0]);
  });
  function updateSafety() {
    const checked=app.querySelector<HTMLInputElement>('input[name="screening-phq-9-8"]:checked');
    const safety=app.querySelector<HTMLElement>('#screening-live-safety');if(safety)safety.hidden=!(checked&&Number(checked.value)>0);
  }
  app.addEventListener('change',event=>{
    const input=event.target as HTMLInputElement;
    if(input.name==='screening-phq-9-8')updateSafety();
    input.closest('[data-screening-question]')?.removeAttribute('aria-invalid');
    if(input.name==='screening-tool')updateCount();
    const stage=input.closest<HTMLElement>('[data-screen-stage]');if(stage)renderGroup(stage);
  });
  function advance(){position++;show(position<queue.length?queue[position]:'context');}
  app.querySelectorAll('[data-screening-next]').forEach(button=>button.addEventListener('click',()=>{
    const stage=button.closest<HTMLElement>('[data-screen-stage]');
    const items=questions(stage),group=groups.get(stage.dataset.screenStage)||0;
    const end=Math.min((group+1)*groupSize,items.length);
    const error=stage.querySelector<HTMLElement>('[data-screening-error]');
    // Groups are presentation only. A person may read later questions without
    // answering earlier ones; only a complete instrument can advance to scoring.
    if(end<items.length){error.textContent='';moveGroup(stage,group+1);return;}
    const unanswered=items.filter(q=>!q.querySelector('input:checked'));
    stage.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    if(unanswered.length){
      error.textContent=copy.answerError;
      unanswered.forEach(q=>q.setAttribute('aria-invalid','true'));
      groups.set(stage.dataset.screenStage,Math.floor(items.indexOf(unanswered[0])/groupSize));renderGroup(stage);
      // An inline alert explains the error; focus locates the first missing item.
      unanswered[0].querySelector<HTMLInputElement>('input').focus({preventScroll:true});
      unanswered[0].scrollIntoView({block:'start',behavior:'instant'});return;
    }
    error.textContent='';
    skipped.delete(stage.dataset.screenStage);advance();
  }));
  app.querySelectorAll('[data-screening-skip]').forEach(button=>button.addEventListener('click',()=>{
    const stage=button.closest<HTMLElement>('[data-screen-stage]');
    skipped.add(stage.dataset.screenStage);
    stage.querySelector<HTMLElement>('[data-screening-error]').textContent='';
    // Keep answers on screen for revisiting, but never score a skipped form.
    advance();
  }));
  app.querySelectorAll('[data-screening-back]').forEach(button=>button.addEventListener('click',()=>{
    const stage=button.closest<HTMLElement>('[data-screen-stage]'),group=groups.get(stage.dataset.screenStage)||0;
    if(questions(stage).length&&group>0){moveGroup(stage,group-1);return;}
    position--;
    if(position>=0){const previous=stages.find(stage=>stage.dataset.screenStage===queue[position]);groups.set(queue[position],Math.ceil(questions(previous).length/groupSize)-1);}
    show(position<0?'choose':queue[position]);
  }));
  app.querySelector('#screening-finish').addEventListener('click',()=>{
    if(!['adult','youth'].includes(age.value))return;
    const reports=ids.map(id=>{
      const stage=stages.find(stage=>stage.dataset.screenStage===id);
      const status=!stage?'unavailable':!queue.includes(id)?'notSelected':skipped.has(id)?'skipped':'complete';
      const answers=stage?[...stage.querySelectorAll<HTMLElement>('[data-screening-question]')].map(q=>{
        const checked=q.querySelector<HTMLInputElement>('input:checked');return checked?Number(checked.value):null;
      }):[];
      const report=makeScreeningReport(id,answers,age.value,status);
      // An endorsed item remains a support signal even if the form was skipped.
      report.safety=id==='phq-9'&&queue.includes(id)&&Number(answers[8])>0;
      return {...report,answers,title:stage?.dataset.toolTitle,version:stage?.dataset.version,source:stage?.dataset.source,recall:stage?.dataset.recall};
    });
    const template=document.getElementById('screening-result-template') as HTMLTemplateElement;
    document.querySelectorAll('#screening-results,[data-screening-record-panel]').forEach(el=>el.remove());
    const fragment=template.content.cloneNode(true) as DocumentFragment;
    // Functional impact is volunteered context, not part of the score. Keep
    // that answer and its care invitation even if the scored form is skipped.
    const impact=queue.includes('phq-9')?app.querySelector<HTMLInputElement>('input[name="screening-impact"]:checked'):null;
    const summaries=[copy.notes];
    const recommendations:string[]=[];
    for(const report of reports){
      const card=fragment.querySelector<HTMLElement>(`[data-screening-report="${report.id}"]`);
      const score=card.querySelector<HTMLElement>('[data-report-score]');
      const band=card.querySelector<HTMLElement>('[data-report-band]');
      const next=card.querySelector<HTMLElement>('[data-report-next]');
      if(report.status!=='complete'){
        score.textContent=report.status==='unavailable'?copy.availability:report.status==='notSelected'?copy.notSelected:copy.unanswered;
      }else{
        score.textContent=`${report.score} / ${report.max}`;
        card.querySelector<HTMLElement>('[data-report-meaning]').hidden=report.score===0;
        if(report.id==='k6'){
          // K6 is a broad distress record, never an anxiety/depression diagnosis.
          // Do not reuse the PHQ/GAD bands or their thresholds for this tool.
          next.textContent=age.value==='youth'?copy.youthResult:report.score===0?copy.low:card.dataset.guidance;
        }else if(age.value==='adult'){
          band.hidden=false;band.textContent=`${copy.adultBand} · ${copy.bands[report.band]}`;
          next.textContent=Number(impact?.value)>=2?copy.care:report.score<5?copy.low:report.score<10?copy.mild:copy.care;
        }else next.textContent=copy.youthResult;
      }
      if(report.status==='complete')recommendations.push(next.textContent);
      // Only a compact, labelled record is carried into the editable care note.
      summaries.push(`${card.querySelector('h3').textContent}${report.version?` · ${report.version}`:''}${report.recall?`\n${report.recall}`:''}\n${score.textContent}${band.hidden?'':`\n${band.textContent}`}${age.value==='youth'&&report.status==='complete'?`\n${copy.ageOptions[1]}`:''}${report.source?`\n${report.source}`:''}${report.safety?`\n${copy.safety}`:''}`);
    }
    fragment.querySelector<HTMLElement>('#screening-result-safety').hidden=!reports.some(report=>report.safety);
    fragment.querySelector<HTMLElement>('#screening-functional-care').hidden=!(impact&&Number(impact.value)>=2);
    fragment.querySelector('#screening-revise').addEventListener('click',()=>{position=-1;show('choose');});
    const energy=app.querySelector<HTMLInputElement>('#screening-energy').checked;
    const basicNeeds=app.querySelector<HTMLInputElement>('#screening-basic-needs').checked;
    // Surface the guidance already used in the individual reports. This adds
    // no clinical threshold, combined score or diagnosis across instruments.
    const careFirst=energy||basicNeeds||reports.some(report=>report.safety)||Number(impact?.value)>=2||recommendations.includes(copy.care);
    fragment.querySelector<HTMLElement>('[data-next-step-guidance]').textContent=careFirst?copy.care:recommendations.find(text=>text!==copy.low)||recommendations[0]||copy.actionHelp;
    const careAction=fragment.querySelector<HTMLAnchorElement>('#screening-care-action');
    const activityAction=fragment.querySelector<HTMLAnchorElement>('#screening-activity-action');
    careAction.classList.toggle('primary',careFirst);activityAction.classList.toggle('primary',!careFirst);
    if(!careFirst)activityAction.before(careAction);
    const context=[impact?.dataset.label,energy?host.dataset.energyLabel:'',basicNeeds?host.dataset.functionLabel:''].filter(Boolean).join(' · ');
    const fullRecord=[...summaries,`${new Date().toISOString()} · ${document.documentElement.lang}`,copy.ageOptions[age.value==='adult'?2:1],context,copy.resultScope,copy.coverage,copy.reference,copy.attribution];
    // A complete, explicitly downloadable response record, including missing
    // entries on skipped forms. It is never saved or copied automatically.
    for(const report of reports){
      const stage=stages.find(stage=>stage.dataset.screenStage===report.id);
      if(!stage||!queue.includes(report.id))continue;
      fullRecord.push(stage.dataset.toolTitle);
      const scope=fragment.querySelector<HTMLElement>(`[data-screening-report="${report.id}"] [data-report-scope]`);
      if(scope)fullRecord.push(scope.textContent);
      for(const question of stage.querySelectorAll<HTMLElement>('[data-screening-question]')){
        const answer=question.querySelector<HTMLInputElement>('input:checked');
        fullRecord.push(`${question.querySelector('[data-question-text]').textContent}\n${answer?answer.labels[0].textContent:copy.unanswered}`);
      }
      if(report.id==='phq-9'&&impact)fullRecord.push(`${stage.querySelector('.screening-impact legend').textContent}\n${impact.dataset.label}`);
    }
    const record=fullRecord.filter(Boolean).join('\n\n');
    fragment.querySelector<HTMLElement>('[data-screening-record]').textContent=record;
    fragment.querySelector('#screening-export').addEventListener('click',()=>{
      const url=URL.createObjectURL(new Blob([record],{type:'text/plain;charset=utf-8'}));
      const link=document.createElement('a');link.href=url;link.download='sunrain-screening-record.txt';link.click();
      setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    // Full reports follow the primary actions, before the alternative activities.
    // Move the existing nodes so export/revision listeners keep their state.
    const recordPanel=fragment.querySelector<HTMLElement>('[data-screening-record-panel]');
    recordPanel.remove();result.querySelector('#result-options').before(recordPanel);
    result.querySelector('h2').after(fragment);
    const concerns=[...new Set(reports.filter(r=>r.status==='complete'&&r.score>0).flatMap(r=>{
      if(r.id!=='k6')return [r.id==='phq-9'?'mood':'worry'];
      // Match optional everyday support to reported items, not to a disease or total.
      return [r.answers.some((value,i)=>[1,3,4,5].includes(i)&&value>0)?'mood':null,
        r.answers.some((value,i)=>[0,2].includes(i)&&value>0)?'worry':null].filter(Boolean);
    }))];
    app.hidden=true;
    host.dispatchEvent(new CustomEvent('sunrain:screening-complete',{detail:{
      // A questionnaire recall window is not the person's symptom onset.
      concerns,energy,basicNeeds,summary:summaries.join('\n\n'),duration:'',
      impact:context,title:copy.results,
    }}));
    const activity=result.querySelector<HTMLAnchorElement>('#result-options [data-action]:not([hidden]) a');
    activityAction.hidden=energy||basicNeeds;
    if(activity){
      activityAction.textContent=activity.textContent;activityAction.href=activity.href;
      activityAction.addEventListener('click',event=>{event.preventDefault();activity.click();});
    }
  });
  reset();show('choose',false);
  window.addEventListener('pageshow',event=>{if(event.persisted){reset();app.hidden=true;document.querySelectorAll('#screening-results,[data-screening-record-panel]').forEach(el=>el.remove());}});
}
