import fs from 'node:fs';
import {generateWordTimestamps} from '../../../packages/pipeline/src/speech.ts';
const base='books/agriculture-form-two/pilot-preview/agriculture-form-two';
const ids=process.argv.slice(2);
const result=[];
for(const id of ids){const fileName=id+'.mp3';const audioBuffer=fs.readFileSync(base+'/audio/en/'+fileName);const r=await generateWordTimestamps({audioBuffer,fileName,apiKey:process.env.OPENAI_API_KEY,language:'en',cacheDir:'books/agriculture-form-two/.cache'});result.push({id,...r});console.log(JSON.stringify({id,...r}));}
fs.mkdirSync('books/agriculture-form-two/audit/audio',{recursive:true});
fs.writeFileSync('books/agriculture-form-two/audit/audio/'+ids.join('-')+'.json',JSON.stringify(result,null,2));
