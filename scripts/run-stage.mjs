import {createStageRunner} from '../../../apps/api/src/services/stage-runner.ts';
import {STAGE_ORDER} from '../../../packages/types/src/pipeline.ts';
const stage=process.argv[2],to=process.argv[3]??stage;
if(!STAGE_ORDER.includes(stage)||!STAGE_ORDER.includes(to))throw new Error('Unknown ADT stage');
await createStageRunner().run('agriculture-form-two',{
 booksDir:process.env.CONVERSION_ROOT??'books/agriculture-form-two/full-conversion',
 apiKey:process.env.OPENAI_API_KEY,promptsDir:'prompts',webAssetsDir:'assets/adt',fromStage:stage,toStage:to,
},{emit:event=>{if(event.type!=='llm-log')console.log(JSON.stringify(event))}});
