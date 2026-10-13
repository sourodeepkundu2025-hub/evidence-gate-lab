import{mkdir,cp,access}from"node:fs/promises";
await mkdir("_site",{recursive:true});
for(const name of ["index.html","app.mjs","style.css","src","assets","README.md","PROVENANCE.md","fixtures.mjs"]){await access(name);await cp(name,"_site/"+name,{recursive:true});}
console.log("Curated static lab built in _site.");
