/** Browser platform and approved landing share this origin. Assets are embedded
 * by build-worker.cjs; the worker never handles Supabase credentials or records.
 */
const binaryCache=new Map();
export default {async fetch(request){
 const url=new URL(request.url);
 if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
 let pathname;try{pathname=decodeURIComponent(url.pathname);}catch{return new Response('Invalid path',{status:400});}
 let key=pathname==='/'?'/junta11/index.html':pathname;
 if(['/login','/registro','/crear-liga','/recuperar','/mis-ligas','/demo'].includes(pathname.replace(/\/$/,'')))key='/junta11/platform.html';
 if(/^\/demo\/(?:equipos|jugadores|partidos|noticias)\/[^/]+\/?$/.test(pathname))key='/junta11/platform.html';
 if(/^\/panel\/[0-9a-f-]{36}\/?$/i.test(pathname)||/^\/(?:liga|l)\/[^/]+(?:\/(?:equipos|jugadores|partidos|noticias)\/[^/]+)?\/?$/.test(pathname))key='/junta11/platform.html';
 const asset=ASSETS[key];
 if(!asset)return new Response('Página no encontrada',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 let body=asset.text;
 if(asset.base64){body=binaryCache.get(key);if(!body){const raw=atob(asset.base64);body=Uint8Array.from(raw,char=>char.charCodeAt(0));binaryCache.set(key,body);}}
 const headers={'Content-Type':asset.type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff',ETag:'"'+asset.sha+'"'};
 if(request.headers.get('If-None-Match')===headers.ETag)return new Response(null,{status:304,headers});
 return new Response(request.method==='HEAD'?null:body,{headers});
}};
