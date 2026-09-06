import fs from 'node:fs';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
import {renderFixedLayoutPage} from '../../../packages/pipeline/src/fixed-layout-rendering.ts';
import {buildTextCatalog} from '../../../packages/pipeline/src/text-catalog.ts';
import {packageAdtWeb} from '../../../packages/pipeline/src/packaging/web.ts';
import {createStageRunner} from '../../../apps/api/src/services/stage-runner.ts';
import {JSDOM} from '../../../packages/pipeline/node_modules/jsdom/lib/api.js';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview',label='agriculture-form-two',bookDir=root+'/'+label;
const tables=JSON.parse(fs.readFileSync('books/agriculture-form-two/source-tables.json'));
const config=JSON.parse(fs.readFileSync(bookDir+'/config.yaml'));
config.speech.excluded_text_ids=config.speech.excluded_text_ids.filter(id=>!id.startsWith('pg001_'));
const storage=createBookStorage(label,root);
let displayCatalog;
try{
 for(const page of storage.getPages()){
  const sectioning=storage.getLatestNodeData('fixed-layout-sectioning',page.pageId).data;
  const section=sectioning.sections[0],placements=section.placement;
  const captions=storage.getLatestNodeData('image-captioning',page.pageId)?.data?.captions??[];
  const meaningful=new Set(captions.filter(c=>!c.decorative&&c.caption).map(c=>c.imageId));
  const pageTables=(tables.find(p=>p.page===page.pageNumber)?.tables??[]).filter(t=>t.bbox[1]>75&&t.bbox[2]<537);
  const figureLabels=section.nodes.filter(n=>n.role==='text'&&/^Figure:?\s*\d/.test(n.text??''));
  const pairedFigures=section.nodes.filter(n=>n.role==='image'&&meaningful.has(n.nodeId)).map(image=>{
   const b=placements[image.nodeId].bounds;
   const label=figureLabels.find(n=>{const p=placements[n.nodeId],width=p.segments.reduce((sum,s)=>sum+(parseFloat(s.style.width)||s.text.length*parseFloat(s.style['font-size'])*.5),0),center=p.position.left+width/2;return p.position.top>=b.y+b.height-3&&p.position.top<b.y+b.height+40&&center>b.x&&center<b.x+b.width});
   return {image,label,b};
  }).filter(f=>f.label);
  const figureOrder=new Map();
  for(const f of pairedFigures){
   const row=pairedFigures.filter(other=>Math.abs(other.b.y-f.b.y)<15&&other.label.nodeId!==f.label.nodeId||other===f).sort((a,b)=>a.b.x-b.b.x);
   if(row.length<2)continue;const top=Math.min(...row.map(g=>g.b.y));
   for(let c=0;c<row.length;c++)for(const id of [row[c].image.nodeId,row[c].label.nodeId])figureOrder.set(id,[top,0,c,id===row[c].image.nodeId?0:1,0]);
  }
  const key=node=>{
   const p=placements[node.nodeId];if(node.role==='image'&&!meaningful.has(node.nodeId))return [-1,0,0,0,0];
   const x=p.position?.left??p.bounds.x,y=p.position?.top??p.bounds.y,h=p.position?.lineHeight??0;
   if(page.pageNumber===1&&node.role==='text'&&y<250)return [0,0,0,y,x];
   if([9,29,49,66,78,95,114,137].includes(page.pageNumber)&&node.role==='text'&&y>=75&&y<200&&p.segments.some(s=>parseFloat(s.style['font-size'])>=18))return [75,0,x<215?0:1,y,x];
   for(const t of pageTables)for(let r=0;r<t.rows.length;r++)for(let c=0;c<t.rows[r].length;c++){const b=t.rows[r][c];if(b&&x+2>=b[0]&&x+2<b[2]&&y+h*.6>=b[1]&&y+h*.6<b[3])return [t.bbox[1],r,c,y,x]}
   // Source-measured figure panels: keep each complete caption and credit
   // with its image, while leaving shared credits after the entire panel.
   const panels={
    14:[[398,540,[280]],[542,675,[280]]],30:[[140,335,[338]]],
    32:[[420,647,[285]]],59:[[190,457,[280]]],50:[[80,280,[270]]],
    67:[[80,290,[295]]],71:[[440,605,[228,350]]],
    73:[[80,285,[300]],[400,590,[290]]],79:[[150,430,[300]]],
    87:[[80,265,[275]],[489,650,[270]]],90:[[440,630,[275]]],
    111:[[360,650,[280]]],72:[[245,402,[300]]],
    142:[[378,640,[240]]]
   }[page.pageNumber]??[];
   for(const [top,bottom,splits]of panels)if(y>=top&&y<bottom){
    const column=splits.filter(split=>x>=split).length;
    return [top,0,column,node.role==='image'?Math.round(y/10)*10:y,x];
   }
   if(figureOrder.has(node.nodeId))return figureOrder.get(node.nodeId);
   if(page.pageNumber===22&&y>=80&&y<685)return [90,y<215?0:y<348?1:y<507?2:3,x<265?0:1,y,x];
   if(page.pageNumber===143&&y>=80&&y<280)return [80,0,x<230?0:1,y,x];
   if(page.pageNumber===43&&y>=310&&y<550)return [310,0,x<270?0:1,y,x];
   if(page.pageNumber===93&&node.role==='image'&&meaningful.has(node.nodeId)&&y<310)return [165,0,0,0,x];
   if(page.pageNumber===93&&node.role==='text'&&x>285&&y<330)return [165,0,0,1,x];
   if(node.role==='image'){
    const row=section.nodes.filter(n=>n.role==='image'&&meaningful.has(n.nodeId)&&Math.abs(placements[n.nodeId].bounds.y-y)<15);
    if(row.length>1)return [Math.min(...row.map(n=>placements[n.nodeId].bounds.y)),0,0,0,x];
   }
   return [Math.round(y),0,0,0,x];
  };
  section.nodes.sort((a,b)=>{const ka=key(a),kb=key(b);for(let i=0;i<5;i++)if(ka[i]!==kb[i])return ka[i]-kb[i];return 0});
  const rendered=renderFixedLayoutPage(section,'/api/books/agriculture-form-two/images',558);
  // Semantic ordering is independent of artwork painting: all live text
  // remains above the source artwork regions even after figures are moved.
  rendered.sections[0].html=rendered.sections[0].html.replace(/(<p\b[^>]*?style=")/g,'$1z-index:1;');
  for(const node of section.nodes){
   const p=placements[node.nodeId];
   if(node.role==='text'&&p.position.top>75&&p.position.top<685&&p.segments?.some(s=>s.style?.['font-weight']==='bold'&&parseFloat(s.style?.['font-size'])>=13)){
    const level=p.segments.some(s=>parseFloat(s.style?.['font-size'])>=18)?1:2;
    rendered.sections[0].html=rendered.sections[0].html.replace(`<p data-id="${node.nodeId}"`,`<p role="heading" aria-level="${level}" data-id="${node.nodeId}"`);
   }
  }
  // Preserve source table cells as accessible groups while retaining the
  // page coordinate system for each live text line and figure.
  const dom=new JSDOM(rendered.sections[0].html),document=dom.window.document;
  for(const element of document.querySelectorAll('p[data-id]')){
   const id=element.getAttribute('data-id'),p=placements[id];
   if(config.speech.excluded_text_ids.includes(id)&&!diagramContains(page.pageNumber,p.position.top))element.setAttribute('aria-hidden','true');
   const smallHeading=p.segments.every(s=>s.style?.['font-weight']==='bold'&&s.style?.['font-style']==='italic')&&p.position.top>75&&p.position.top<685;
   if(element.getAttribute('role')==='heading'||smallHeading||id==='pg001_p000'){
    const level=id==='pg001_p000'?1:Number(element.getAttribute('aria-level')??2);
    const heading=document.createElement('h'+level);
    for(const attr of element.attributes)heading.setAttribute(attr.name,attr.value);
    heading.removeAttribute('role');heading.removeAttribute('aria-level');heading.style.margin='0';heading.style.fontWeight='normal';
    heading.innerHTML=element.innerHTML;element.replaceWith(heading);
   }
  }
  for(const table of pageTables){
   const wrapper=document.createElement('div');wrapper.setAttribute('role','table');wrapper.style.display='contents';
   let first;
   for(let r=0;r<table.rows.length;r++){
    const row=document.createElement('div');row.setAttribute('role','row');row.style.display='contents';
    for(const bounds of table.rows[r]){
     if(!bounds)continue;const cell=document.createElement('div');cell.setAttribute('role','cell');cell.style.display='contents';
     for(const node of section.nodes){
      const p=placements[node.nodeId];if(node.role==='image'&&!meaningful.has(node.nodeId))continue;
      const x=p.position?.left??p.bounds.x,y=p.position?.top??p.bounds.y,h=p.position?.lineHeight??0;
      if(x+2>=bounds[0]&&x+2<bounds[2]&&y+h*.6>=bounds[1]&&y+h*.6<bounds[3]){
       const element=document.querySelector(`[data-id="${node.nodeId}"]`);if(!element)continue;
       if(!first){first=element;first.before(wrapper);}cell.append(element);
      }
     }
     row.append(cell);
    }
    wrapper.append(row);
   }
  }
  rendered.sections[0].html=document.body.innerHTML;dom.window.close();
  storage.putNodeData('fixed-layout-sectioning',page.pageId,sectioning);
  storage.putNodeData('web-rendering',page.pageId,rendered);
  const diagram={17:[368,647],97:[274,641],100:[289,596]}[page.pageNumber];
  if(diagram)config.speech.excluded_text_ids.push(...section.nodes.filter(n=>n.role==='text'&&placements[n.nodeId].position.top>=diagram[0]&&placements[n.nodeId].position.top<diagram[1]).map(n=>n.nodeId));
 }
 displayCatalog=await buildTextCatalog(storage,storage.getPages());
 const spoken=structuredClone(displayCatalog);
 const math=spoken.entries.find(e=>e.id.startsWith('pg016_')&&e.text==='Plant population');
 if(math){
  math.text='Plant population equals the area of the land divided by the spacing of the crop.';
  config.speech.excluded_text_ids.push(...spoken.entries.filter(e=>e.id.startsWith('pg016_')&&['=','Area of the land','Spacing of the crop'].includes(e.text)).map(e=>e.id));
 }
 storage.putNodeData('text-catalog','book',spoken);
 fs.writeFileSync(bookDir+'/config.yaml',JSON.stringify(config,null,2));
}finally{storage.close()}
try{
 if(!process.env.SKIP_SPEECH)await createStageRunner().run(label,{booksDir:root,apiKey:process.env.OPENAI_API_KEY,promptsDir:'prompts',webAssetsDir:'assets/adt',fromStage:'speech',toStage:'speech'}, {emit:e=>{if(e.type!=='llm-log')console.log(JSON.stringify(e))}});
}finally{
 const s=createBookStorage(label,root);
 try{s.putNodeData('text-catalog','book',displayCatalog);await packageAdtWeb(s,{bookDir,label,language:'en',outputLanguages:['en'],title:'Agriculture Form Two',webAssetsDir:process.cwd()+'/assets/adt',speechConfig:config.speech,fixedLayout:true});}finally{s.close()}
}

function diagramContains(page,y){const bounds={17:[368,647],97:[274,641],100:[289,596]}[page];return bounds&&y>=bounds[0]&&y<bounds[1];}
