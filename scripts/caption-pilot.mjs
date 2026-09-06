import fs from 'node:fs';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
import {createLLMModel,createPromptEngine} from '../../../packages/llm/src/index.ts';
import {captionPageImages,buildCaptionConfig} from '../../../packages/pipeline/src/image-captioning.ts';
import {loadBookConfig} from '../../../packages/pipeline/src/config.ts';
import {processWithConcurrency} from '../../../packages/pipeline/src/concurrency.ts';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview',label='agriculture-form-two';
const storage=createBookStorage(label,root);
const config=loadBookConfig(label,root);
const model=createLLMModel({modelId:buildCaptionConfig(config).modelId,cacheDir:'books/agriculture-form-two/.cache',promptEngine:createPromptEngine(['prompts']),credentials:{openaiApiKey:process.env.OPENAI_API_KEY},onLog:entry=>storage.appendLlmLog(entry)});
try{
 const failures=[];
 await processWithConcurrency(storage.getPages(),config.concurrency??8,async page=>{
  try{
  if(process.env.ONLY_NEW&&storage.getLatestNodeData('image-captioning',page.pageId))return;
  if(process.argv[2]&&page.pageNumber!==Number(process.argv[2]))return;
  const map=storage.getLatestNodeData('artwork-map',page.pageId).data.images;
  const originals=new Map(storage.getPageImages(page.pageId).map(i=>[i.imageId,i]));
  const candidates=map.filter(i=>{const b=i.bounds;return b.x>35&&b.y>75&&b.x+b.width<525&&b.y+b.height<(page.pageNumber===1?715:685)&&b.width>25&&b.height>25&&(originals.get(i.sourceImageId)?.renderMethod==='raster'||i.sourceImageId?.startsWith('figure-'))});
  const selected=candidates.filter(i=>i.sourceImageId?.startsWith('figure-')||!candidates.some(other=>{
   if(!other.sourceImageId?.startsWith('figure-'))return false;
   const a=i.bounds,b=other.bounds;
   const overlap=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
   return overlap/(a.width*a.height)>.9;
  }));
  let captions=[];
  if(selected.length){
   const result=await captionPageImages({pageId:page.pageId,pageImageBase64:storage.getPageImageBase64(page.pageId),images:selected.map(i=>({imageId:i.imageId,imageBase64:storage.getImageBase64(i.imageId)})),language:'en',bookSummary:'Agriculture Form Two textbook. Describe instructional photographs and diagrams. Header and footer foliage, signatures, badges, panel backgrounds and framing artwork are decorative.'},buildCaptionConfig(config),model);
   captions=result.captions;
  }
  const selectedIds=new Set(captions.map(c=>c.imageId));
  captions.push(...map.filter(i=>!selectedIds.has(i.imageId)).map(i=>({imageId:i.imageId,reasoning:'Source page furniture, vector rules, or component duplicate; semantic text is retained separately.',caption:'',decorative:true})));
  storage.putNodeData('image-captioning',page.pageId,{captions});console.log('Captioned',page.pageId,selected.length);
  }catch(error){failures.push(page.pageId);console.error('Caption failed',page.pageId,error.message)}
 });
 if(failures.length)throw new Error('Caption pages to retry: '+failures.join(', '));
}finally{storage.close()}
