import { build } from 'esbuild';
import { readFile, readdir, mkdir, rm, cp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
const root=process.cwd(), dist=path.join(root,'dist'), client=path.join(dist,'client');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'};
const assets={};
async function collect(dir,prefix='') {
  for (const entry of await readdir(dir,{withFileTypes:true})) {
    const relative=prefix+'/'+entry.name, file=path.join(dir,entry.name);
    if (entry.isDirectory()) await collect(file,relative);
    else {
      const body=await readFile(file);
      assets[relative]={body:body.toString('base64'),mime:types[path.extname(file)]??'application/octet-stream',etag:'"'+createHash('sha256').update(body).digest('hex')+'"'};
    }
  }
}
await collect(client);
for (const entry of await readdir(dist)) if (entry!=='client') await rm(path.join(dist,entry),{recursive:true,force:true});
await mkdir(path.join(dist,'server'),{recursive:true});
await mkdir(path.join(dist,'.openai'),{recursive:true});
await cp(path.join(root,'.openai/hosting.json'),path.join(dist,'.openai/hosting.json'));
await build({entryPoints:['server/index.ts'],outfile:'dist/server/index.js',bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true,plugins:[{name:'game-assets',setup(builder){builder.onResolve({filter:/^virtual:gemblast-assets$/},()=>({path:'game-assets',namespace:'game-assets'}));builder.onLoad({filter:/.*/,namespace:'game-assets'},()=>({contents:'export default '+JSON.stringify(assets),loader:'js'}));}}]});
console.log(`Worker built with ${Object.keys(assets).length} embedded assets and the league API.`);
