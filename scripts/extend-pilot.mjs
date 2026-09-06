import fs from 'node:fs';
import {extractPdfStream} from '../../../packages/pdf/src/extract.ts';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
const storage=createBookStorage('agriculture-form-two',process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview');
const pdfBuffer=fs.readFileSync('books/agriculture-form-two/agriculture-form-two.pdf');
const candidates=process.env.FULL_BOOK?Array.from({length:162},(_,i)=>i+1):[12,13,16,22,28,95,97,106,117,139,140,143,149,150,154,156,161,162];
try {
 const existing=new Set(storage.getPages().map(p=>p.pageNumber));
 for(const n of candidates){
  if(existing.has(n))continue;
  const {pages}=extractPdfStream({pdfBuffer,startPage:n,endPage:n,fixedLayout:true,vectorTextGrouping:false});
  for await(const page of pages){storage.putExtractedPage(page);storage.putNodeData('positioned-text',page.pageId,page.positionedText);if(page.extractionDebug)storage.putNodeData('extraction-debug',page.pageId,page.extractionDebug);console.log('Added pilot source',n)}
 }
}finally{storage.close()}
