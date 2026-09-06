import fs from 'node:fs';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
const storage=createBookStorage('agriculture-form-two',process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview');
try{
 for(const page of JSON.parse(fs.readFileSync((process.env.AUDIT_DIR??'books/agriculture-form-two/audit/pilot')+'/baselines.json'))){
  const node=storage.getLatestNodeData('fixed-layout-sectioning',page.pageId).data;
  for(const line of page.lines){if(Math.abs(line.delta)>.15)node.sections[0].placement[line.id].position.top+=line.delta;}
  storage.putNodeData('fixed-layout-sectioning',page.pageId,node);
  storage.putNodeData('baseline-alignment',page.pageId,{method:'PDF text-matrix baseline minus measured browser baseline; Tinos fonts fully loaded',lines:page.lines});
 }
 const row=storage.getLatestNodeData('image-captioning','pg097').data;
 const fig=row.captions.find(c=>!c.decorative);
 if(fig){fig.caption='Planning for livestock enterprises links physical and financial factors. Physical factors include suitable livestock type, breed, system and housing; disease and parasite control; proper feeding and breeding; and proper harvesting, handling, processing and marketing of produce. Financial factors include production costs, divided into variable and fixed costs, together with yields, prices and revenue. The branches connect these considerations to profitable livestock enterprises.';fig.reasoning='Expanded from the complete source diagram to preserve the subfactors and relationships for narration.';fig.source='manual';storage.putNodeData('image-captioning','pg097',row);}
}finally{storage.close()}
