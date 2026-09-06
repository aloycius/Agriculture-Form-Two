import json
from pathlib import Path
import pdfplumber
root=Path('books/agriculture-form-two')
result=[]
with pdfplumber.open(root/'agriculture-form-two.pdf') as pdf:
 for n,page in enumerate(pdf.pages,1):
  result.append({'physical_page':n,'chars':[{**{k:c[k] for k in ['text','x0','x1','top','bottom','fontname','size']},'baseline':page.height-c['matrix'][5]} for c in page.chars]})
(root/'source-line-measurements.json').write_text(json.dumps(result))
