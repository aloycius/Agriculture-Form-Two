import fs from 'node:fs';
import {chromium} from '../../../packages/pipeline/node_modules/playwright/index.mjs';
const base=(process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview')+'/agriculture-form-two/adt';
const output=process.env.AUDIT_DIR??'books/agriculture-form-two/audit/pilot';fs.mkdirSync(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1000,height:1250}});
 const result=[];
 for(const name of fs.readdirSync(base).filter(n=>n==='index.html'||/^pg\d+_sec001\.html$/.test(n)).sort()){
  await page.goto((process.env.CONVERSION_URL??'http://127.0.0.1:8766/pilot-preview/agriculture-form-two/adt/')+name);
  await page.evaluate(()=>document.fonts.ready);
  const data=await page.evaluate(()=>{const c=document.querySelector('#content');const b=c.getBoundingClientRect();return {width:b.width,height:b.height,entries:[...c.querySelectorAll('[data-id]')].map(e=>{const r=e.getBoundingClientRect();return {id:e.getAttribute('data-id'),tag:e.tagName,text:e.textContent,x:r.x-b.x,y:r.y-b.y,w:r.width,h:r.height,overflow:r.x<b.x-1||r.y<b.y-1||r.right>b.right+1||r.bottom>b.bottom+1}})}});
  await page.locator('#content').screenshot({path:output+'/'+name.replace('.html','.png')});
  result.push({file:name,...data});console.log(name,data.entries.filter(e=>e.overflow).map(e=>e.id));
 }
 fs.writeFileSync(output+'/geometry.json',JSON.stringify(result,null,2));
}finally{await browser.close()}
