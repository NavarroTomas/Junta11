const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../dist/server/index.js'),'utf8');
 const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const port=Number(process.env.PORT||3000);
 const server=http.createServer(async(req,res)=>{try{
  const response=await worker.fetch(new Request('http://localhost:'+port+req.url,{method:req.method}));
  res.writeHead(response.status,Object.fromEntries(response.headers));
  res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
 }catch{res.writeHead(500,{'Content-Type':'text/plain; charset=utf-8'});res.end('No se pudo abrir esta página.');}});
 server.listen(port,'127.0.0.1',()=>console.log('Junta11: http://localhost:'+port+' (Ctrl+C para cerrar)'));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
