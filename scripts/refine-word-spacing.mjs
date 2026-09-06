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
  const prior=storage.getLatestNodeData('source-word-alignment',page.pageId);if(prior&&!prior.data.skipped.length)continue;
  const node=storage.getLatestNodeData('fixed-layout-sectioning',page.pageId).data;
  const raw=storage.getLatestNodeData('positioned-text',page.pageId).data.drawItems;
  const chars=measured.find(m=>m.physical_page===page.pageNumber).chars;
  const changes=[],skipped=[];
  await tab.goto(url+(page.pageNumber===1?'index.html':page.pageId+'_sec001.html'));await tab.evaluate(()=>document.fonts.ready);
  for(const [id,p]of Object.entries(node.sections[0].placement)){
   if(prior&&!prior.data.skipped.includes(id))continue;
   if(!p.segments||p.segments.length<2||page.pageNumber>=3&&page.pageNumber<=5)continue;
   const line=raw.find(r=>r.textId===id);if(!line)continue;
   const baseSize=Math.max(...p.segments.map(s=>parseFloat(s.style['font-size'])));
   const visible=chars.filter(c=>Math.abs(c.baseline-(p.position.top+p.position.lineHeight))<6&&c.x0>=line.left-.5&&c.text.trim()).sort((a,b)=>a.x0-b.x0);
   const text=p.segments.map(s=>s.text).join(''),key=text.replace(/\s/g,'');
   if(!visible.map(c=>c.text).join('').startsWith(key)){skipped.push(id);continue;}
   let count=0;const glyphs=[];for(const c of visible){for(const ch of c.text){glyphs.push({...c,text:ch});if(++count>=key.length)break;}if(count>=key.length)break;}
   const baselines=new Map();for(const c of glyphs){const key=c.baseline.toFixed(2);baselines.set(key,(baselines.get(key)??0)+1);}const base=Number([...baselines].sort((a,b)=>b[1]-a[1])[0]?.[0]);if(!Number.isFinite(base))continue;
   const parts=[];let offset=0;
   for(const segment of p.segments){
    const words=segment.text.match(/\s*\S+\s*|\s+/g)??[];
    for(const word of words){const length=word.replace(/\s/g,'').length;if(!length){if(parts.length)parts.at(-1).text+=word;continue;}
     const selected=glyphs.slice(offset,offset+length);offset+=length;
     const style={...segment.style};for(const key of ['transform','transform-origin','letter-spacing','width','top','position','text-align','text-align-last'])delete style[key];
     parts.push({text:word,style,start:selected[0].x0,end:selected.at(-1).x1,baseline:selected[0].baseline});
    }
   }
   const widths=await tab.evaluate(parts=>{const ctx=document.createElement('canvas').getContext('2d');return parts.map(p=>{ctx.font=`${p.style['font-style']??'normal'} ${p.style['font-weight']??'normal'} ${p.style['font-size']} Tinos`;return ctx.measureText(p.text).width;})},parts);
   p.position.left=parts[0].start;
   p.segments=parts.map((part,i)=>{
    const target=(i<parts.length-1?parts[i+1].start:part.end)-part.start;
    part.style.display='inline-block';part.style.width=`${target}px`;part.style['white-space']='pre';
    // Each word begins at its source coordinate. Small fallback-metric
    // differences may tighten glyph spacing but never alter the source font size.
    if(widths[i]>target+.25)part.style['letter-spacing']=`${(target-widths[i])/part.text.length}px`;
    const rise=part.baseline-base;if(Math.abs(rise)>.25){part.style.position='relative';part.style.top=`${rise}px`;}
    return {text:part.text,style:part.style};
   });
   if(p.segments.map(s=>s.text).join('')!==text)throw new Error('Text changed: '+id);
   changes.push({id,words:parts.length,raised:parts.filter(p=>Math.abs(p.baseline-base)>.25).length});
  }
  storage.putNodeData('fixed-layout-sectioning',page.pageId,node);
  storage.putNodeData('source-word-alignment',page.pageId,{method:'Source word start coordinates and source relative baselines; unchanged text and font sizes',changes,skipped});
  console.log(page.pageId,JSON.stringify({changes:changes.length,raised:changes.reduce((n,c)=>n+c.raised,0),skipped}));
 }
}finally{await browser.close();storage.close()}
