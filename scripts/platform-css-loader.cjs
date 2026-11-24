const path=require('node:path');
module.exports=function(source){
 const postcss=require('postcss');
 const ast=postcss.parse(source);const map={};
 if(this.resourcePath.endsWith('.module.css')){
  const prefix=path.basename(this.resourcePath,'.module.css').replace(/\W/g,'_');
  ast.walkRules(rule=>{if(rule.parent?.type==='atrule'&&/keyframes$/i.test(rule.parent.name))return;rule.selector=rule.selector.replace(/\.([a-zA-Z_][\w-]*)/g,(_,name)=>'.'+(map[name]??=prefix+'_'+name));});
 }
 const css=ast.toString();return `const style=document.createElement('style');style.textContent=${JSON.stringify(css)};document.head.appendChild(style);export default ${JSON.stringify(map)};`;
};
