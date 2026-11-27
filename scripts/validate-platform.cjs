const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const ts=require('typescript');
const navigation=[];const exportsObject={};
const router=ts.transpileModule(fs.readFileSync(path.join(root,'src/platform/router.tsx'),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
vm.runInNewContext(router,{exports:exportsObject,require:name=>require(name),window:{location:{assign:path=>navigation.push(['push',path]),replace:path=>navigation.push(['replace',path]),reload:()=>navigation.push(['reload'])},history:{back:()=>navigation.push(['back'])}}});
assert.equal(exportsObject.useRouter(),exportsObject.useRouter(),'Router identity must remain stable across renders');
exportsObject.useRouter().replace('/mis-ligas');assert.deepEqual(navigation,[['replace','/mis-ligas']]);
const bundle=fs.readFileSync(path.join(root,'public/junta11/platform.js'),'utf8');
for(const forbidden of ['process.env.NEXT_PUBLIC_SUPABASE_URL','process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY','process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'])assert.ok(!bundle.includes(forbidden),'Public config was not compiled');
assert.ok(bundle.includes(require('./platform-environment.cjs').platformEnvironment().NEXT_PUBLIC_SUPABASE_URL),'Unexpected Supabase project');
assert.ok(!fs.readFileSync(path.join(root,'public/junta11/index.html'),'utf8').includes('https://gestiona-tu-liga-tesis.vercel.app/'),'Landing links still leave Sites');
(async()=>{const source=fs.readFileSync(path.join(root,'dist/server/index.js'),'utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
for(const route of ['/','/login','/registro','/crear-liga','/recuperar','/mis-ligas','/demo','/panel/00000000-0000-4000-8000-000000000001','/l/liga-prueba','/junta11/platform.js','/junta11/story.js','/junta11/story.css','/junta11/story-sprite.png']){const r=await worker.fetch(new Request('https://example.test'+route));assert.equal(r.status,200,route);const bytes=new Uint8Array(await r.arrayBuffer());assert.ok(bytes.length>0,route);if(route.startsWith('/panel/')||route.startsWith('/l/'))assert.ok(new TextDecoder().decode(bytes).includes('platform-root'));}
assert.equal((await worker.fetch(new Request('https://example.test/no-existe'))).status,404);
assert.equal((await worker.fetch(new Request('https://example.test/login',{method:'POST'}))).status,405);
const first=await worker.fetch(new Request('https://example.test/junta11/platform.js'));const cached=await worker.fetch(new Request('https://example.test/junta11/platform.js',{headers:{'If-None-Match':first.headers.get('ETag')}}));assert.equal(cached.status,304);
assert.equal((await worker.fetch(new Request('https://example.test/login',{method:'HEAD'}))).body,null);
console.log('PASS stable router, expected public configuration, 13 worker routes, 404/405, ETag and HEAD. No browser or email claims.');})().catch(error=>{console.error(error.message);process.exitCode=1;});
