const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const sourceDir=path.join(root,'public/junta11');
const assets={};
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory()){walk(file);continue;}const name='/junta11/'+path.relative(sourceDir,file).split(path.sep).join('/');const extension=path.extname(file);const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.json':'application/json; charset=utf-8'};if(!types[extension])continue;const bytes=fs.readFileSync(file);assets[name]={type:types[extension],sha:crypto.createHash('sha256').update(bytes).digest('hex'),...(['.png'].includes(extension)?{base64:bytes.toString('base64')}:{text:bytes.toString('utf8')})};}}
walk(sourceDir);
const runtime=fs.readFileSync(path.join(root,'worker/index.js'),'utf8');
const source='const ASSETS='+JSON.stringify(assets)+';\n'+runtime;
fs.mkdirSync(path.join(dist,'server'),{recursive:true});fs.writeFileSync(path.join(dist,'server/index.js'),source);
console.log(JSON.stringify({assets:Object.keys(assets).length,workerBytes:Buffer.byteLength(source)}));
