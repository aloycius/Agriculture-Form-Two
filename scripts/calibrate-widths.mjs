import fs from 'node:fs';
import {chromium} from '../../../packages/pipeline/node_modules/playwright/index.mjs';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview';
const url=process.env.CONVERSION_URL??'http://127.0.0.1:8766/pilot-preview/agriculture-form-two/adt/';
const storage=createBookStorage('agriculture-form-two',root);
const measured=JSON.parse(fs.readFileSync('books/agriculture-form-two/source-line-measurements.json'));
const browser=await chromium.launch({headless:true});
try{
 const tab=await browser.newPage();
 for(const page of storage.getPages()){
  await tab.goto(url+(page.pageNumber===1?'index.html':page.pageId+'_sec001.html'));await tab.evaluate(()=>document.fonts.ready);
  const raw=storage.getLatestNodeData('positioned-text',page.pageId).data.drawItems;
  const node=storage.getLatestNodeData('fixed-layout-sectioning',page.pageId).data;
  const chars=measured.find(m=>m.physical_page===page.pageNumber).chars;const changes=[];
  for(const [id,p] of Object.entries(node.sections[0].placement)){
   if(!p.segments?.length||page.pageNumber>=3&&page.pageNumber<=5)continue;
   const line=raw.find(l=>l.textId===id);if(!line)continue;
   const s=p.segments[0],size=parseFloat(s.style['font-size']);
   const visible=chars.filter(c=>Math.abs(c.top-line.top-size*.333)<.8&&c.x0>=line.left-.5&&c.text.trim()).sort((a,b)=>a.x0-b.x0);
   const key=p.segments.map(s=>s.text).join('').replace(/\s/g,'');if(!visible.map(c=>c.text).join('').startsWith(key))continue;
   let count=0,end;for(const c of visible){count+=c.text.length;if(count>=key.length){end=c.x1;break}}
   if(!end)continue;const left=visible[0].x0;p.position.left=left;
   let used=0;
   for(let index=0;index<p.segments.length;index++){
    const s=p.segments[index],length=s.text.replace(/\s/g,'').length;
    let offset=0;const selected=visible.filter(c=>{const from=offset;offset+=c.text.length;return from>=used&&from<used+length});used+=length;
    if(!selected.length)continue;
    const start=selected[0].x0,last=selected.at(-1).x1;
    let nextOffset=0;const next=visible.find(c=>{const from=nextOffset;nextOffset+=c.text.length;return from>=used});
    const target=(index<p.segments.length-1&&next?next.x0:last)-start;
    s.text=line.segments[index].text.trim();
    if(index<p.segments.length-1&&(/\s$/.test(line.segments[index].text)||/^\s/.test(line.segments[index+1].text)))s.text+=' ';
    const natural=await tab.evaluate(({id,index,text})=>{const span=document.querySelector(`[data-id="${id}"]`).querySelectorAll(':scope > span')[index],style=getComputedStyle(span);const ctx=document.createElement('canvas').getContext('2d');ctx.font=style.font;return ctx.measureText(text).width},{id,index,text:s.text});
    s.style.display='inline-block';s.style.width=`${target}px`;s.style['white-space']='pre';
    delete s.style.transform;delete s.style['transform-origin'];delete s.style['letter-spacing'];
    if(natural>target+.3){s.style['letter-spacing']=`${(target-natural)/s.text.length}px`;changes.push({id,index,natural,target});}
   }
  }
  storage.putNodeData('fixed-layout-sectioning',page.pageId,node);
  storage.putNodeData('source-width-alignment',page.pageId,{method:'Source first/last visible glyph bounds; scale fallback glyphs only when wider than source',changes});
  console.log(page.pageId,changes.length);
 }
}finally{await browser.close();storage.close()}
