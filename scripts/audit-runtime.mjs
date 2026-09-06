import fs from 'node:fs';
import {chromium} from '../../../packages/pipeline/node_modules/playwright/index.mjs';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview';
const url=process.env.CONVERSION_URL??'http://127.0.0.1:8766/pilot-preview/agriculture-form-two/adt/';
const output=process.env.AUDIT_DIR??'books/agriculture-form-two/audit/pilot';
const base=root+'/agriculture-form-two/adt';
const audios=JSON.parse(fs.readFileSync(base+'/content/i18n/en/audios.json'));
const browser=await chromium.launch({headless:true});const report=[];
try{
 const tab=await browser.newPage({viewport:{width:1000,height:1250}});
 for(const file of fs.readdirSync(base).filter(n=>n==='index.html'||/^pg\d+_sec001\.html$/.test(n)).sort()){
  await tab.goto(url+file);await tab.evaluate(()=>document.fonts.ready);
  const snapshot=()=>tab.evaluate(()=>{const root=document.querySelector('#content'),b=root.getBoundingClientRect(),scale=b.width/parseFloat(root.style.width);return [...root.querySelectorAll('[data-id]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.dataset.id,text:e.textContent,alt:e.getAttribute('alt'),left:(r.left-b.left)/scale,top:(r.top-b.top)/scale,width:r.width/scale,height:r.height/scale,overflow:r.left<b.left-1||r.right>b.right+1||r.top<b.top-1||r.bottom>b.bottom+1}})});
  const before=await snapshot();const queue=before.filter(e=>audios[e.id]);const checks=[];
  if(queue.length){
   await tab.getByRole('button',{name:'Activate text to speech',exact:true}).click();
   // Read every playable node through the actual next-audio control.
   for(let index=0;index<queue.length;index++){
    await tab.waitForTimeout(35);
    const after=await snapshot();
    const changed=after.filter(e=>{const old=before.find(b=>b.id===e.id);return e.overflow||Math.abs(e.width-old.width)>1||Math.abs(e.height-old.height)>1||Math.abs(e.left-old.left)>1||Math.abs(e.top-old.top)>1});
    if(changed.length)checks.push({index,expectedId:queue[index].id,changed});
    if(index<queue.length-1)await tab.getByRole('button',{name:'Go to next audio',exact:true}).click();
   }
   await tab.getByRole('button',{name:'Stop',exact:true}).click();
  }
  await tab.locator('#content').screenshot({path:output+'/'+file.replace('.html','.png')});
  report.push({file,queue:queue.map(e=>({id:e.id,text:e.text,alt:e.alt})),checks});
  fs.writeFileSync(output+'/dynamic-runtime.json',JSON.stringify(report,null,2));
  console.log(file,'playable',queue.length,'geometry changes',checks.length);
 }
 fs.writeFileSync(output+'/dynamic-runtime.json',JSON.stringify(report,null,2));
}finally{await browser.close()}
