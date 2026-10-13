// Deterministic reference pipeline. No model, network request or tool execution.
export const words=text=>text.toLowerCase().match(/[\p{L}\p{N}]+/gu)??[];
const normalize=text=>words(text).join(" ");
export function retrieve(query,documents){
 const queryWords=new Set(words(query));
 const ids=new Set();
 for(const d of documents){if(typeof d.id!=="string"||!d.id.trim()||ids.has(d.id)||typeof d.text!=="string"||!d.text.trim()||typeof d.title!=="string")throw new Error("Evidence documents need unique IDs and nonempty text.");ids.add(d.id);}
 return documents.filter(d=>d.visibility==="public").map(d=>{
  const vocabulary=new Set(words(d.text+" "+d.title));
  const hits=[...queryWords].filter(w=>vocabulary.has(w));
  return {...d,hits,score:queryWords.size?hits.length/queryWords.size:0,wordCount:words(d.text).length};
 }).filter(d=>d.hits.length>0).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
}
export function verifyQuotes(claims,evidence){
 const seen=new Set();
 for(const doc of evidence){if(typeof doc.id!=="string"||!doc.id.trim()||seen.has(doc.id)||typeof doc.text!=="string"||!doc.text.trim())throw new Error("Evidence needs unique IDs and nonempty text.");seen.add(doc.id);}
 const byId=new Map(evidence.map(d=>[d.id,d]));
 return claims.map(c=>{
  const doc=byId.get(c.citation);
  const quote=typeof c.quote==="string"?normalize(c.quote):"";
  const matches=Boolean(doc&&quote&&(" "+normalize(doc.text)+" ").includes(" "+quote+" "));
  return {...c,verified:matches,reason:!doc?"unknown citation":!quote?"empty quote":matches?"exact normalized token sequence":"quote absent from cited evidence"};
 });
}
export function run(query,documents,{budgetWords=120,minCoverage=.4,capability="read",granted=["read"]}={}){
 if(typeof query!=="string"||!query.trim())throw new Error("Query is required.");
 if(!Number.isInteger(budgetWords)||budgetWords<0||!Number.isFinite(minCoverage)||minCoverage<0||minCoverage>1)throw new Error("Invalid evidence budget or coverage threshold.");
 if(!Array.isArray(granted)||granted.some(x=>typeof x!=="string"))throw new Error("Invalid capabilities.");
 const trace=[{stage:"request",query,capability}];
 const abstain=reason=>({status:"abstained",reason,claims:[],contextWords:0,trace:[...trace,{stage:"abstain",reason}]});
 if(capability!=="read"||!granted.includes(capability))return abstain("This reference pipeline only permits authorized reads.");
 const ranked=retrieve(query,documents);trace.push({stage:"retrieve",candidates:ranked.map(d=>({id:d.id,score:d.score}))});
 const qualified=ranked.filter(d=>d.score>=minCoverage);
 if(!qualified.length)return abstain("No public evidence reaches the requested lexical coverage.");
 let remaining=budgetWords;const selected=[];
 for(const d of qualified)if(d.wordCount<=remaining){selected.push(d);remaining-=d.wordCount;}
 trace.push({stage:"budget",budgetWords,used:budgetWords-remaining,selected:selected.map(d=>d.id)});
 if(!selected.length)return abstain("No complete evidence passage fits the word budget.");
 const claims=verifyQuotes(selected.map(d=>({quote:d.text,citation:d.id,title:d.title})),selected);
 trace.push({stage:"verify",verified:claims.filter(c=>c.verified).length,total:claims.length});
 if(claims.some(c=>!c.verified))return abstain("Citation verification failed.");
 return {status:"supported",reason:"Extractive evidence only; assess relevance before making a decision.",claims,contextWords:budgetWords-remaining,trace};
}
