import json, subprocess, os
from pathlib import Path
from PIL import Image, ImageDraw
root=Path('books/agriculture-form-two')
out=Path(os.environ.get('COMPARE_DIR',str(root/'audit'/'comparisons')));out.mkdir(exist_ok=True,parents=True)
audit=Path(os.environ.get('AUDIT_DIR',str(root/'audit/pilot')))
records=json.loads((audit/'geometry.json').read_text())
for record in records:
 name=record['file'];n=1 if name=='index.html' else int(name[2:5])
 source=out/f'source-{n:03}'
 subprocess.run(['pdftoppm','-f',str(n),'-l',str(n),'-scale-to','1200','-png','-singlefile',str(root/'agriculture-form-two.pdf'),str(source)],check=True,stdout=subprocess.DEVNULL)
 left=Image.open(str(source)+'.png').convert('RGB')
 right=Image.open(audit/name.replace('.html','.png')).convert('RGB')
 right=right.resize(left.size)
 pair=Image.new('RGB',(left.width*2,1230),'white')
 pair.paste(left,(0,30));pair.paste(right,(left.width,30))
 draw=ImageDraw.Draw(pair);draw.text((10,8),f'Source PDF - physical {n}',fill='black');draw.text((left.width+10,8),'ADT output',fill='black')
 pair.save(out/f'compare-{n:03}.jpg',quality=92)
