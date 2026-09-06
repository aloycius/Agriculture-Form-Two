import fs from 'node:fs';
import {chromium} from '../../../packages/pipeline/node_modules/playwright/index.mjs';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
const storage=createBookStorage('agriculture-form-two',process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview');
const measures=JSON.parse(fs.readFileSync('books/agriculture-form-two/source-line-measurements.json'));
const browser=await chromium.launch({headless:true});const result=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:1250}});
 for(const p of storage.getPages()){
  const name=p.pageNumber===1?'index.html':p.pageId+'_sec001.html';
  await page.goto((process.env.CONVERSION_URL??'http://127.0.0.1:8766/pilot-preview/agriculture-form-two/adt/')+name);await page.evaluate(()=>document.fonts.ready);
  const baselines=await page.evaluate(()=>{const root=document.querySelector('#content'),box=root.getBoundingClientRect(),scale=box.width/parseFloat(root.style.width);return [...root.querySelectorAll('[data-id][data-segments]')].map(p=>{const probe=document.createElement('span');probe.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0;vertical-align:baseline';p.appendChild(probe);const baseline=(probe.getBoundingClientRect().top-box.top)/scale;probe.remove();return {id:p.dataset.id,baseline};})});
  const chars=measures.find(m=>m.physical_page===p.pageNumber).chars;
  const lines=storage.getLatestNodeData('positioned-text',p.pageId).data.drawItems.filter(x=>x.kind==='paragraph');
  const found=[];
  for(const rendered of baselines){const line=lines.find(l=>l.textId===rendered.id);if(!line)continue;const fs=parseFloat(line.segments[0].style['font-size']);const c=chars.find(c=>Math.abs(c.x0-line.left)<1&&Math.abs(c.top-line.top-fs*.333)<1);if(!c)continue;found.push({...rendered,text:line.text,sourceBaseline:c.baseline,delta:c.baseline-rendered.baseline});}
  result.push({pageId:p.pageId,lines:found});console.log(p.pageId,found.filter(l=>Math.abs(l.delta)>1).map(l=>[l.id,Number(l.delta.toFixed(2))]));
 }
 fs.writeFileSync((process.env.AUDIT_DIR??'books/agriculture-form-two/audit/pilot')+'/baselines.json',JSON.stringify(result,null,2));
}finally{await browser.close();storage.close()}
