import fs from 'node:fs';
import { createBookStorage } from '../../../packages/storage/src/index.ts';
import { processFixedLayoutPages } from '../../../packages/pipeline/src/fixed-layout-rendering.ts';
import { packageAdtWeb } from '../../../packages/pipeline/src/packaging/web.ts';
const root = '/Users/aloyciuslaurent/adt-studio/books/agriculture-form-two/pilot-preview';
const storage = createBookStorage('agriculture-form-two', root);
try {
 for (const page of storage.getPages()) {
  const pos = storage.getLatestNodeData('positioned-text', page.pageId).data;
  const marks = new Set(pos.drawItems.filter(x=>x.kind==='image' && x.bounds.width > pos.pageWidth*0.9 && x.bounds.height > pos.pageHeight*0.9).map(x=>x.imageId));
  const classification = {images:storage.getPageImages(page.pageId).map(x=>({imageId:x.imageId,isPruned:x.source==='page'||marks.has(x.imageId),reason:marks.has(x.imageId)?'Source-verified full-page printer-mark layer':undefined}))};
  storage.putNodeData('image-filtering',page.pageId,classification);
 }
 processFixedLayoutPages(storage,'/api/books/agriculture-form-two/images');
 await packageAdtWeb(storage,{bookDir:root+'/agriculture-form-two',label:'agriculture-form-two',language:'en',outputLanguages:['en'],title:'Agriculture Form Two',webAssetsDir:'/Users/aloyciuslaurent/adt-studio/assets/adt',fixedLayout:true});
} finally {storage.close()}
