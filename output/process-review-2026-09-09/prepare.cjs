const fs=require('fs'),path=require('path'),{execFileSync:r}=require('child_process');const dir=__dirname;const p=require('./content.json'),experiments=require('./experiments.json');fs.mkdirSync(dir+'/sources',{recursive:true});fs.mkdirSync(dir+'/exports',{recursive:true});let cache=new Map();
function asset(src){if(cache.has(src))return cache.get(src);let key='sources/'+String(cache.size).padStart(2,'0')+'.webp';r('magick',[src+'[0]','-auto-orient','-resize','1800x1800>','-quality','94',dir+'/'+key]);cache.set(src,key);return key;}
for(const x of p)for(const s of x.states){s.original=s.src;s.src=asset(s.src);}
for(const x of experiments){x.posterOriginal=x.poster;x.poster=asset(x.poster.replace(/^\//,''));}
fs.writeFileSync(dir+'/data.js','window.PROJECTS='+JSON.stringify(p)+';\nwindow.EXPERIMENTS='+JSON.stringify(experiments)+';');fs.writeFileSync(dir+'/sources.json',JSON.stringify([...cache].map(([source,copy])=>({source,copy})),null,2));
