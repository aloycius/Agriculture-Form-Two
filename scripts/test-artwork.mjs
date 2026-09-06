import fs from 'node:fs';
import mupdf from '../../../packages/pdf/node_modules/mupdf/dist/mupdf.js';
const doc=mupdf.Document.openDocument(fs.readFileSync('books/agriculture-form-two/agriculture-form-two.pdf'),'application/pdf');
const page=doc.loadPage(8);const scale=2;const rect=page.getBounds();
const pix=new mupdf.Pixmap(mupdf.ColorSpace.DeviceRGB,[0,0,Math.ceil(rect[2]*scale),Math.ceil(rect[3]*scale)],false);pix.clear(255);
const draw=new mupdf.DrawDevice(mupdf.Matrix.identity,pix);const callbacks={};
for(const name of ['fillPath','strokePath','clipPath','clipStrokePath','clipText','clipStrokeText','fillShade','fillImage','fillImageMask','clipImageMask','popClip','beginMask','endMask','beginGroup','endGroup','beginTile','endTile','beginLayer','endLayer']) callbacks[name]=(...args)=>draw[name](...args);
const filter=new mupdf.Device({...callbacks,fillText(){},strokeText(){},ignoreText(){}});
page.run(filter,mupdf.Matrix.scale(scale,scale));filter.close();draw.close();fs.writeFileSync('/private/tmp/agriculture-form-two-survey/art9.png',pix.asPNG());filter.destroy();draw.destroy();pix.destroy();page.destroy();doc.destroy();
