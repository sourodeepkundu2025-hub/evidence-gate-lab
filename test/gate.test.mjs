import{test}from"node:test";import assert from"node:assert/strict";
import{run,retrieve,verifyQuotes}from"../src/gate.mjs";import{documents}from"../fixtures.mjs";
test("supported request exposes a verified citation and full trace",()=>{const r=run("Bluetooth recovery monitor",documents);assert.equal(r.status,"supported");assert.equal(r.claims[0].citation,"SYN-01");assert.ok(r.claims.every(c=>c.verified));assert.deepEqual(r.trace.map(t=>t.stage),["request","retrieve","budget","verify"]);});
test("unrelated question abstains",()=>assert.equal(run("photosynthesis chloroplast",documents).status,"abstained"));
test("zero budget abstains without partial evidence",()=>assert.equal(run("Bluetooth recovery monitor",documents,{budgetWords:0}).status,"abstained"));
test("private fixtures never retrieved",()=>assert.ok(retrieve("Bluetooth private",documents).every(d=>d.visibility==="public")));
test("write remains denied even when caller offers a grant",()=>assert.equal(run("Bluetooth",documents,{capability:"write",granted:["write"]}).status,"abstained"));
test("read without grant is denied",()=>assert.equal(run("Bluetooth",documents,{granted:[]}).status,"abstained"));
test("fabricated quotes and unknown citations fail",()=>{const r=verifyQuotes([{quote:"ninety percent improvement",citation:"SYN-01"},{quote:"Bluetooth",citation:"UNKNOWN"},{quote:"",citation:"SYN-01"}],documents);assert.ok(r.every(c=>!c.verified));});
test("passage matching tolerates formatting and case",()=>assert.equal(verifyQuotes([{quote:"A SYNTHETIC\nBluetooth monitor",citation:"SYN-01"}],documents)[0].verified,true));
test("budget always bounds the selected evidence words",()=>{for(let budget=0;budget<200;budget++){const r=run("synthetic",documents,{budgetWords:budget});assert.ok(r.contextWords<=budget);}});
test("documents with ambiguous IDs fail",()=>assert.throws(()=>retrieve("x",[{id:"x",title:"x",text:"x",visibility:"public"},{id:"x",title:"x",text:"x",visibility:"public"}])));
test("invalid request values fail",()=>{assert.throws(()=>run("",documents));assert.throws(()=>run("x",documents,{budgetWords:-1}));assert.throws(()=>run("x",documents,{minCoverage:2}));});

test("partial words do not establish a quotation",()=>assert.equal(verifyQuotes([{quote:"to",citation:"SYN-01"}],documents)[0].verified,false));
test("standalone verifier rejects duplicate source IDs",()=>assert.throws(()=>verifyQuotes([{quote:"fabricated",citation:"x"}],[{id:"x",text:"real"},{id:"x",text:"fabricated"}]),/unique IDs/));
