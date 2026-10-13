import{run}from"./src/gate.mjs";import{documents}from"./fixtures.mjs";
for(const query of ["Bluetooth recovery monitor","quantum circuit routing","photosynthesis chloroplast"])console.log(JSON.stringify(run(query,documents),null,2));
