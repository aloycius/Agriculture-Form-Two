import fs from 'node:fs';
import {runAccessibilityAssessment} from '../../../packages/pipeline/src/accessibility-assessment.ts';
import {createBookStorage} from '../../../packages/storage/src/index.ts';
const root=process.env.CONVERSION_ROOT??'books/agriculture-form-two/pilot-preview';
const result=await runAccessibilityAssessment({bookDir:root+'/agriculture-form-two'});
const storage=createBookStorage('agriculture-form-two',root);
try{storage.putNodeData('accessibility-assessment','book',result)}finally{storage.close()}
fs.writeFileSync((process.env.AUDIT_DIR??'books/agriculture-form-two/audit/pilot')+'/accessibility.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result.summary));
