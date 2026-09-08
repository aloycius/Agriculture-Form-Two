import fs from 'node:fs';
import mupdf from '../../../packages/pdf/node_modules/mupdf/dist/mupdf.js';
import {renderPageArtwork} from '../../../packages/pdf/src/page-artwork.ts';
import {cropPng,decodePng} from '../../../packages/pdf/src/png-utils.ts';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
import {sectionFixedLayoutPage,renderFixedLayoutPage} from '../../../packages/pipeline/src/fixed-layout-rendering.ts';
import {packageAdtWeb} from '../../../packages/pipeline/src/packaging/web.ts';
import {ensureBookGoogleFontsCached} from '../../../packages/pipeline/src/fonts-bundle.ts';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview';
// Source-backed heading leaves identified by the complete-book semantic audit.
// The page renderer preserves their measured position and typography while
// exposing them as actual HTML headings rather than styled paragraphs.
const auditedHeadingIds=new Set([
 'pg004_p002','pg005_p002','pg007_p003','pg009_p003','pg011_p002','pg012_p002','pg012_p017','pg014_p002','pg016_p002','pg016_p012','pg018_p011','pg018_p019',
 'pg024_p021','pg026_p002','pg027_p002','pg029_p003','pg030_p002','pg031_p002','pg032_p002','pg037_p028','pg038_p002','pg039_p002','pg040_p002','pg041_p016',
 'pg042_p027','pg043_p002','pg043_p007','pg043_p018','pg044_p008','pg045_p002','pg047_p002','pg049_p003','pg051_p002','pg052_p002','pg056_p002','pg059_p002',
 'pg061_p005','pg064_p010','pg065_p002','pg066_p003','pg071_p009','pg071_p015','pg072_p002','pg074_p002','pg076_p022','pg077_p002','pg078_p003','pg078_p024',
 'pg079_p002','pg081_p002','pg082_p002','pg082_p008','pg085_p009','pg085_p030','pg086_p002','pg087_p011','pg088_p002','pg089_p002','pg089_p024','pg090_p002',
 'pg090_p013','pg092_p002','pg095_p003','pg097_p002','pg098_p028','pg100_p002','pg100_p010','pg101_p017','pg101_p032','pg102_p002','pg102_p027','pg104_p002',
 'pg104_p023','pg107_p007','pg108_p002','pg108_p020','pg110_p025','pg111_p002','pg114_p003','pg116_p002','pg116_p024','pg118_p012','pg118_p024','pg119_p002',
 'pg122_p002','pg123_p026','pg124_p016','pg126_p002','pg127_p002','pg128_p008','pg129_p009','pg132_p030','pg133_p002','pg135_p002','pg137_p003','pg138_p002',
 'pg139_p002','pg141_p002','pg142_p002','pg142_p007','pg145_p029','pg145_p033','pg146_p002','pg147_p002','pg147_p019','pg149_p012','pg149_p017','pg154_p003',
 'pg161_p003','pg162_p002',
 // Additional source headings flagged as indeterminate by the semantic scan.
 'pg001_p000','pg001_p002','pg002_p002','pg009_p023','pg010_p002','pg015_p020','pg019_p002','pg019_p023','pg020_p003','pg020_p020','pg020_p024','pg024_p003',
 'pg025_p030','pg029_p026','pg031_p032','pg033_p003','pg036_p003','pg037_p003','pg044_p003','pg049_p027','pg050_p002','pg053_p002','pg057_p003','pg058_p003',
 'pg060_p002','pg061_p002','pg062_p002','pg066_p020','pg073_p002','pg078_p010','pg087_p002','pg095_p022','pg099_p002','pg101_p003','pg103_p028','pg105_p002',
 'pg106_p003','pg107_p019','pg109_p002','pg114_p010','pg117_p002','pg123_p002','pg124_p002','pg125_p002','pg127_p026','pg128_p002','pg132_p003','pg137_p018',
 'pg142_p017','pg144_p003','pg149_p003','pg151_p003','pg156_p002',
 'pg001_p001','pg007_p002','pg009_p020','pg020_p002','pg024_p002','pg033_p002','pg036_p002','pg037_p002','pg044_p002','pg057_p002',
 'pg058_p002','pg095_p019','pg101_p002','pg106_p002','pg132_p002','pg144_p002','pg149_p002','pg151_p002','pg161_p002','pg001_p004',
]);
const storage=createBookStorage('agriculture-form-two',root);
const measurements=JSON.parse(fs.readFileSync('books/agriculture-form-two/source-line-measurements.json'));
const tableMeasurements=JSON.parse(fs.readFileSync('books/agriculture-form-two/source-tables.json'));
storage.putNodeData('font-registry','book',{fonts:[{id:'tinos',family:'Tinos',source:'google',googleKey:'tinos',category:'serif',faces:[],role:'body',roleLockedByUser:false}]});
await ensureBookGoogleFontsCached(storage,'books/agriculture-form-two/.fonts-cache');
const doc=mupdf.Document.openDocument(fs.readFileSync('books/agriculture-form-two/agriculture-form-two.pdf'),'application/pdf');
const excluded=process.env.ONLY_NEW?JSON.parse(fs.readFileSync(root+'/agriculture-form-two/config.yaml')).speech.excluded_text_ids:[];
try {
 for(const page of storage.getPages()) {
  if(process.env.ONLY_NEW&&storage.getLatestNodeData('artwork-map',page.pageId))continue;
  const source=storage.getLatestNodeData('positioned-text',page.pageId).data;
  const pdfPage=doc.loadPage(page.pageNumber-1); const artwork=renderPageArtwork(pdfPage,2);
  const sourceTextStrokes=[];const strokeProbe=new mupdf.Device({strokeText(t,s,m){sourceTextStrokes.push(t.getBounds(s,m))}});pdfPage.run(strokeProbe,mupdf.Matrix.identity);strokeProbe.close();strokeProbe.destroy();pdfPage.destroy();
  const width=artwork.readUInt32BE(16),height=artwork.readUInt32BE(20);
  const artPixels=decodePng(artwork),fullPixels=decodePng(Buffer.from(storage.getPageImageBase64(page.pageId),'base64'));
  const hidden=[];
  const visiblyPainted=(line)=>{
   const b=line.blockBounds;const left=Math.max(0,Math.floor(line.left*2)),right=Math.min(width,Math.ceil(Math.max(b?b.x+b.width:0,line.left+line.text.length*line.lineHeight*.6)*2));
   const top=Math.max(0,Math.floor(line.top*2)),bottom=Math.min(height,Math.ceil((line.top+line.lineHeight*1.4)*2));
   let changed=0;for(let y=top;y<bottom;y++)for(let x=left;x<right;x++){const i=(y*width+x)*4;if(Math.max(...[0,1,2].map(k=>Math.abs(artPixels.data[i+k]-fullPixels.data[i+k])))>25)changed++}
   if(changed<3)hidden.push({id:line.textId,text:line.text});return changed>=3;
  };
  const version=storage.putNodeData('artwork-repair',page.pageId,{method:'source PDF artwork with fillText/strokeText disabled; crop individual existing image regions',sourceNodeVersion:storage.getCurrentNodeVersion('positioned-text',page.pageId)});
  const drawItems=[];const ids=[];const imageMap=[];
  let index=0;
  const regions=source.drawItems.filter(x=>x.kind==='image'&&!(x.bounds.width>source.pageWidth*.9&&x.bounds.height>source.pageHeight*.9));
  if(page.pageNumber===97)regions.push({kind:'image',imageId:'figure-6-2',bounds:{x:116,y:274,width:326,height:367}});
  if(page.pageNumber===17)regions.push({kind:'image',imageId:'figure-1-2',bounds:{x:143,y:368,width:273,height:279}});
  if(page.pageNumber===100)regions.push({kind:'image',imageId:'figure-6-3',bounds:{x:90,y:289,width:377,height:307}});
  // Preserve isolated vector rules missed by the original image grouping,
  // especially complete table grids. Each component remains its own crop.
  const seen=new Uint8Array(width*height);const queue=new Int32Array(width*height);
  const ink=(i)=>{const k=i*4;return artPixels.data[k]<245||artPixels.data[k+1]<245||artPixels.data[k+2]<245};
  for(let y=43;y<height-43;y++)for(let x=43;x<width-43;x++){
   const seed=y*width+x;if(seen[seed]||!ink(seed))continue;
   let head=0,tail=1,minX=x,maxX=x,minY=y,maxY=y;queue[0]=seed;seen[seed]=1;
   while(head<tail){const i=queue[head++],cx=i%width,cy=Math.floor(i/width);minX=Math.min(minX,cx);maxX=Math.max(maxX,cx);minY=Math.min(minY,cy);maxY=Math.max(maxY,cy);
    for(const d of [-width-1,-width,-width+1,-1,1,width-1,width,width+1]){const j=i+d,jx=j%width,jy=Math.floor(j/width);if(jx<43||jx>=width-43||jy<43||jy>=height-43||seen[j]||!ink(j))continue;seen[j]=1;queue[tail++]=j;}
   }
   if(tail<8)continue;const bounds={x:(minX-1)/2,y:(minY-1)/2,width:(maxX-minX+3)/2,height:(maxY-minY+3)/2};
   if(!regions.some(r=>r.bounds.x<=bounds.x+.5&&r.bounds.y<=bounds.y+.5&&r.bounds.x+r.bounds.width>=bounds.x+bounds.width-.5&&r.bounds.y+r.bounds.height>=bounds.y+bounds.height-.5))regions.push({kind:'image',bounds});
  }
  for(const item of regions) {
   const b=item.bounds;
   if(b.width>source.pageWidth*.9 && b.height>source.pageHeight*.9) continue;
   const x=Math.max(21,Math.floor(b.x*2)/2),y=Math.max(21,Math.floor(b.y*2)/2);
   const right=Math.min(source.pageWidth-21,Math.ceil((b.x+b.width)*2)/2),bottom=Math.min(source.pageHeight-21,Math.ceil((b.y+b.height)*2)/2);
   if(right<=x||bottom<=y) continue;
   const bounds={x,y,width:right-x,height:bottom-y};
   const cropped=cropPng(artwork,{left:Math.round(x*2),top:Math.round(y*2),width:Math.round(bounds.width*2),height:Math.round(bounds.height*2)});
   const segmentIndex=index++;const imageId=`${page.pageId}_page_seg${String(segmentIndex).padStart(3,'0')}_v${version}`;
   storage.putSegmentedImage({sourceImageId:`${page.pageId}_page`,segmentIndex,pageId:page.pageId,version,buffer:cropped,width:cropped.readUInt32BE(16),height:cropped.readUInt32BE(20),bounds});
   drawItems.push({kind:'image',imageId,bounds});ids.push(imageId);
   imageMap.push({imageId,sourceImageId:item.imageId??null,bounds});
  }
  const text=source.drawItems.filter(x=>x.kind==='paragraph' && !/\.indd\b|^\d{2}\/\d{2}\/\d{4}\s/.test(x.text) && visiblyPainted(x));
  const measuredPage=measurements.find(p=>p.physical_page===page.pageNumber);
  if(page.pageNumber!==1)excluded.push(...text.filter(t=>t.top<75||t.top>685).map(t=>t.textId));
  console.log(page.pageId,'occluded source text:',JSON.stringify(hidden));
  const groups=new Map();
  for(const line of text){const id=line.mergedParagraphId||line.textId; if(!groups.has(id))groups.set(id,[]);groups.get(id).push(line)}
  for(const lines of groups.values()){
   lines.sort((a,b)=>a.top-b.top||a.left-b.left);
   for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(line.segments.length===1&&measuredPage&&/\s/.test(line.text)){
     const size=parseFloat(line.segments[0].style['font-size']);
     const chars=measuredPage.chars.filter(c=>Math.abs(c.top-(line.top+size*.333))<.8&&c.x0>=line.left-.5).sort((a,b)=>a.x0-b.x0);
     const visible=chars.filter(c=>c.text.trim());const key=line.text.replace(/\s/g,'');
     if(visible.map(c=>c.text).join('').startsWith(key)){
      let count=0,end;for(const char of visible){count+=char.text.length;if(count>=key.length){end=char.x1;break;}}
      if(end>line.left)Object.assign(line.segments[0].style,{'display':'inline-block','width':`${end-line.left}px`,'text-align':'justify','text-align-last':'justify'});
     }
    }
    for(const segment of line.segments){
     segment.style['white-space']='pre';
     // Source flowchart lettering is regular; extraction incorrectly inherited
     // the one-point box outline as a stroke on these text runs.
     if(!sourceTextStrokes.some(b=>line.left>=b[0]&&line.left<b[2]&&line.top+line.lineHeight*.6>=b[1]&&line.top<b[3])){delete segment.style['-webkit-text-stroke'];delete segment.style['paint-order'];}
    }
   }
  }
  const tables=(tableMeasurements.find(p=>p.page===page.pageNumber)?.tables??[]).filter(t=>t.bbox[1]>75&&t.bbox[2]<source.pageWidth-21);
  const readingKey=line=>{
   for(const t of tables)for(let r=0;r<t.rows.length;r++)for(let c=0;c<t.rows[r].length;c++){
    const b=t.rows[r][c],y=line.top+line.lineHeight*.6;
    if(b&&line.left+2>=b[0]&&line.left+2<b[2]&&y>=b[1]&&y<b[3])return [t.bbox[1],r,c,line.top,line.left];
   }
   if(page.pageNumber===97&&line.top>=300&&line.top<610)return [300,0,line.left<270?0:1,line.top,line.left];
   return [Math.round(line.top),0,0,0,line.left];
  };
  text.sort((a,b)=>{const ka=readingKey(a),kb=readingKey(b);for(let i=0;i<ka.length;i++)if(ka[i]!==kb[i])return ka[i]-kb[i];return 0;});
  for(const line of text){
   const toc=line.text.match(/^(.*?)\s*\.{4,}\s*([ivxlcdm\d]+)\s*$/i);
   if(page.pageNumber>=3&&page.pageNumber<=5&&toc){
    const chars=measurements.find(p=>p.physical_page===page.pageNumber).chars.filter(c=>Math.abs(c.top-(line.top+3.996))<1&&c.x0>=line.left-1).sort((a,b)=>a.x0-b.x0);
    const dot=chars.find(c=>c.text==='.');
    const right=chars.at(-1)?.x1??468.1969;
    const numberWidth=Math.max(18,toc[2].length*7);
    const start=dot?dot.x0-line.left:toc[1].length*6;
    const style={...line.segments[0].style};delete style.width;delete style.display;delete style['text-align'];delete style['text-align-last'];
    line.segments=[{text:toc[1],style},{text:'.'.repeat(160),style:{...style,position:'absolute',left:`${start}px`,width:`${right-line.left-numberWidth-start}px`,overflow:'hidden'}},{text:toc[2],style:{...style,position:'absolute',left:`${right-line.left-numberWidth}px`,width:`${numberWidth}px`,'text-align':'right'}}];
   }
   delete line.mergedParagraphId;delete line.blockBounds;delete line.textAlign;
  }
  drawItems.push(...text);
  // Source-composed panels can carry their words as raster pixels. Keep the
  // measured text leaves visible as the page's authority. The artwork passed
  // to this script was rendered with MuPDF text painting disabled, so its
  // panel crops retain the book's original borders, fills, shadows and icons
  // without carrying duplicate text pixels.
  const sectioning=sectionFixedLayoutPage({pageId:page.pageId,pageNumber:page.pageNumber,viewport:{width:Math.round(source.pageWidth),height:Math.round(source.pageHeight)},drawItems,availableImageIds:new Set(ids),renderRasterTextAsHtml:true});
  const section=sectioning.sections[0];
  const presentImageIds=new Set(section.nodes.filter(node=>node.role==='image').map(node=>node.nodeId));
  // The generic semantic mode omits image crops that overlap text and
  // synthesises approximate CSS panels. Restore the source-derived, text-free
  // crops for this book so each page keeps its exact original scaffolding.
  for(const item of drawItems){
   if(item.kind!=='image'||presentImageIds.has(item.imageId)||!ids.includes(item.imageId))continue;
   section.nodes.push({nodeId:item.imageId,role:'image',isPruned:false});
   section.placement[item.imageId]={bounds:item.bounds};
  }
  // Avoid synthetic fills and tabs: the restored source panel artwork is the
  // visual layer, while the measured HTML leaves remain the visible text.
  const sourceTextById=new Map(text.map(item=>[item.textId,item]));
  for(const node of section.nodes){
   if(node.role==='image')continue;
   const placement=section.placement[node.nodeId];
   const sourceItem=sourceTextById.get(node.nodeId);
   if(sourceItem&&placement?.position){
    placement.position.top=sourceItem.top;
    placement.position.left=sourceItem.left;
    placement.position.lineHeight=sourceItem.lineHeight;
   }
   if(placement){delete placement.htmlPanel;delete placement.htmlTextPanel;}
  }
  for(const node of sectioning.sections[0].nodes)if(auditedHeadingIds.has(node.nodeId))node.role='heading';
  storage.putNodeData('fixed-layout-sectioning',page.pageId,sectioning);
  storage.putNodeData('artwork-map',page.pageId,{images:imageMap});
  storage.putNodeData('web-rendering',page.pageId,renderFixedLayoutPage(sectioning.sections[0],'/api/books/agriculture-form-two/images',Math.round(source.pageWidth)));
 }
 const speechConfig={excluded_text_ids:excluded,word_highlighting:false};
 fs.writeFileSync(root+'/agriculture-form-two/config.yaml',JSON.stringify({default_render_strategy:'fixed_layout',pruned_section_types:[],concurrency:8,speech:speechConfig},null,2));
 await packageAdtWeb(storage,{bookDir:root+'/agriculture-form-two',label:'agriculture-form-two',language:'en',outputLanguages:['en'],title:'Agriculture Form Two',webAssetsDir:'/Users/aloyciuslaurent/adt-studio/assets/adt',speechConfig,fixedLayout:true});
} finally {storage.close();doc.destroy()}
