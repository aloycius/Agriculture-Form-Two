import json
import pdfplumber
from pathlib import Path
root=Path('books/agriculture-form-two')
out=[]
with pdfplumber.open(root/'agriculture-form-two.pdf') as pdf:
 for n,page in enumerate(pdf.pages,1):
  tables=[]
  for table in page.find_tables():
   if not table.rows or max(len(r.cells) for r in table.rows)<2: continue
   tables.append({'bbox':table.bbox,'rows':[r.cells for r in table.rows]})
  out.append({'page':n,'tables':tables})
(root/'source-tables.json').write_text(json.dumps(out,indent=2))
