'use strict';
const scenes = [
  [
    "Tu liga, en un solo lugar.",
    "Juntá equipos, fechas y resultados en una página. Tu grupo puede consultar la información sin buscar mensajes viejos.",
    "Un jugador entra por una puerta",
    "Crear mi liga"
  ],
  [
    "Tu nombre. Tus colores. Tu liga.",
    "Elegís el nombre, subís el escudo y definís los colores. La página reúne la información de tu competencia bajo una misma identidad y un enlace propio que podés pasarle al grupo.",
    "Un jugador mira una cancha grande desde atrás",
    null
  ],
  [
    "Dejá de buscar la última lista en el chat.",
    "Cargá los equipos y sus jugadores. Los planteles quedan juntos y podés consultar quién forma parte de cada equipo.",
    "Cuatro jugadores se reúnen como equipo",
    null
  ],
  [
    "Temporadas y divisiones",
    "Una nueva temporada no tiene por qué mezclarse con la anterior. Organizá las divisiones y elegí qué competencia consultar o administrar: cada una muestra sus partidos y sus posiciones.",
    "Un jugador se ata los cordones",
    null
  ],
  [
    "¿Liga por equipos o partidos entre amigos?",
    "Elegí la modalidad que usa tu grupo: planteles fijos para una competencia por equipos, o una liga de jugadores para los partidos donde cambian los compañeros.",
    "Un jugador sostiene una pelota con las manos",
    null
  ],
  [
    "Día. Hora. Cancha.",
    "Programá cada encuentro y dejá la información en el calendario. Todos pueden consultar cuándo y dónde juegan sin volver a preguntarlo en el grupo.",
    "Un jugador saca desde el centro de la cancha, visto de costado",
    null
  ],
  [
    "Un enlace para todo el grupo",
    "La información de la liga es pública. Compartís su enlace y los jugadores, sus amigos o quien siga la competencia pueden consultar partidos, resultados, posiciones y noticias sin crear una cuenta.",
    "Un jugador le pasa la pelota a un compañero",
    null
  ],
  [
    "El partido también se cuenta jugador por jugador.",
    "Registrá goles, asistencias, amarillas, rojas y una nota manual de rendimiento. Las estadísticas reúnen lo que vas cargando en cada encuentro.",
    "Un jugador corre y levanta una mano para pedir la pelota",
    null
  ],
  [
    "Antes y después de cada fecha",
    "Consultá los encuentros programados y los que ya se jugaron en el mismo calendario. El día, la hora, la cancha y el resultado quedan disponibles para que el grupo tenga una referencia común.",
    "Un jugador corre llevando la pelota",
    null
  ],
  [
    "Cargás el marcador. Se calculan las posiciones.",
    "Los puntos se suman según tus reglas: podés configurar cuánto vale ganar, empatar o perder. Así evitás recalcular la tabla a mano después de cada fecha.",
    "Un jugador patea la pelota al arco",
    null
  ],
  [
    "Que lo que pasa en la cancha quede en tu liga.",
    "Resultados, estadísticas y noticias quedan reunidos en la página de la competencia. Tu grupo puede seguir cómo viene el torneo, revisar lo que pasó y consultar la próxima fecha.",
    "Un jugador festeja deslizándose de rodillas",
    "Empezar mi liga"
  ]
];
const section = document.getElementById('historia');
const title = document.getElementById('scene-title');
const description = document.getElementById('scene-description');
const illustration = document.getElementById('illustration');
const action = document.getElementById('scene-action');
// Copy stays centered; the original transparent drawings change position per beat.
const stage = document.querySelector('.stage');
const poses = [
  [82,48,'Crear mi liga','registro'],
  [18,38,'Ver una liga','demo'],
  [82,65,'Organizar mi grupo','registro'],
  [19,66,'Preparar mi liga','registro'],
  [82,38,'Elegir mi modalidad','registro'],
  [18,46,'Organizar mis partidos','registro'],
  [81,65,'Ver una liga pública','demo'],
  [18,35,'Empezar con mi equipo','registro'],
  [82,47,'Ver cómo se organiza','demo'],
  [19,64,'Crear mi competencia','registro'],
  [82,43,'Empezar mi liga','registro'],
];
// Layout and entrance belong to each scene, rather than one repeated hero.
const presentations = [
  ['classic','fade'], ['prose','right'], ['statement','rise'],
  ['prose','type'], ['editorial','left'], ['statement','right'],
  ['prose','fade'], ['editorial','type'], ['prose','rise'],
  ['statement','left'], ['prose','fade'],
];
// Each composition pairs copy and drawing; coordinates change together at the scene cut.
const compositions = [
  {
    "text": [
      50,
      50,
      40
    ],
    "figure": [
      82,
      48,
      22
    ],
    "mobileText": [
      50,
      47
    ],
    "mobileFigure": [
      64,
      80,
      16
    ]
  },
  {
    "text": [
      68,
      46,
      40
    ],
    "figure": [
      24,
      58,
      31
    ],
    "mobileText": [
      54,
      43
    ],
    "mobileFigure": [
      28,
      79,
      19
    ]
  },
  {
    "text": [
      30,
      40,
      42
    ],
    "figure": [
      75,
      64,
      32
    ],
    "mobileText": [
      46,
      42
    ],
    "mobileFigure": [
      73,
      80,
      18
    ]
  },
  {
    "text": [
      66,
      61,
      40
    ],
    "figure": [
      24,
      35,
      24
    ],
    "mobileText": [
      55,
      46
    ],
    "mobileFigure": [
      27,
      80,
      16
    ]
  },
  {
    "text": [
      32,
      62,
      42
    ],
    "figure": [
      76,
      32,
      30
    ],
    "mobileText": [
      45,
      44
    ],
    "mobileFigure": [
      72,
      80,
      19
    ]
  },
  {
    "text": [
      50,
      50,
      40
    ],
    "figure": [
      84,
      53,
      21
    ],
    "mobileText": [
      50,
      50
    ],
    "mobileFigure": [
      78,
      83,
      12
    ]
  },
  {
    "text": [
      31,
      43,
      42
    ],
    "figure": [
      76,
      65,
      26
    ],
    "mobileText": [
      46,
      44
    ],
    "mobileFigure": [
      73,
      81,
      16
    ]
  },
  {
    "text": [
      66,
      58,
      40
    ],
    "figure": [
      23,
      38,
      29
    ],
    "mobileText": [
      54,
      43
    ],
    "mobileFigure": [
      26,
      80,
      19
    ]
  },
  {
    "text": [
      32,
      62,
      42
    ],
    "figure": [
      77,
      34,
      30
    ],
    "mobileText": [
      45,
      44
    ],
    "mobileFigure": [
      74,
      81,
      18
    ]
  },
  {
    "text": [
      67,
      43,
      40
    ],
    "figure": [
      24,
      65,
      34
    ],
    "mobileText": [
      54,
      41
    ],
    "mobileFigure": [
      28,
      80,
      21
    ]
  },
  {
    "text": [
      50,
      50,
      40
    ],
    "figure": [
      84,
      53,
      21
    ],
    "mobileText": [
      50,
      50
    ],
    "mobileFigure": [
      78,
      83,
      12
    ]
  }
];
const copy = document.querySelector('.copy');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = -1, requested = 0, scheduled = 0, fadeTimer = 0;
let entrance = null, typingTimer = 0, typingTarget = null, typingText = '';
function stopEntrance() {
  if (entrance) {entrance.cancel(); entrance = null;}
  clearTimeout(typingTimer); typingTimer = 0;
  if (typingTarget) {typingTarget.textContent = typingText; typingTarget.classList.remove('is-typing'); typingTarget = null;}
}
function revealCopy(frame) {
  if (reducedMotion.matches || frame === 0) return;
  const [layout,effect] = presentations[frame];
  const origin = {left:'-48px 0',right:'48px 0',rise:'0 28px',fade:'0 0',type:'0 0'}[effect];
  if (copy.animate) entrance = copy.animate([{opacity:0,translate:origin},{opacity:1,translate:'0 0'}],{duration:effect==='fade'?700:580,easing:'cubic-bezier(.2,.65,.3,1)',fill:'backwards'});
  if (effect !== 'type') return;
  // Full text reserves the final height. A separate accessible copy is never typed.
  const target = layout === 'prose' ? description : title;
  const full = target.textContent;
  typingTarget = target; typingText = full;
  const reserve=document.createElement('span'), readable=document.createElement('span'), ink=document.createElement('span');
  reserve.className='type-reserve';reserve.textContent=full;reserve.setAttribute('aria-hidden','true');
  readable.className='sr-only';readable.textContent=full;
  ink.className='type-ink';ink.setAttribute('aria-hidden','true');
  target.textContent='';target.classList.add('is-typing');target.append(reserve,readable,ink);
  const characters=Array.from(full),started=performance.now(),duration=Math.min(1900,Math.max(850,characters.length*13));
  function tick(){
    const progress=Math.min(1,(performance.now()-started)/duration);
    ink.textContent=characters.slice(0,Math.ceil(progress*characters.length)).join('');
    if(progress<1) typingTimer=setTimeout(tick,24);
    else {target.textContent=full;target.classList.remove('is-typing');typingTarget=null;typingTimer=0;}
  }
  tick();
}
function render(frame) {
  stopEntrance();
  active = frame;
  const [layout,effect]=presentations[frame];
  copy.dataset.layout=layout;
  copy.dataset.centered=String(frame === 5 || frame === 10);
  copy.dataset.entrance=effect;
  const composition=compositions[frame];
  const [textX,textY,textWidth]=composition.text;
  const [figureX,figureY,figureSize]=composition.figure;
  copy.style.setProperty('--copy-x',textX+'%');
  copy.style.setProperty('--copy-y',textY+'%');
  copy.style.setProperty('--copy-width',textWidth+'vw');
  copy.style.setProperty('--mobile-copy-x',composition.mobileText[0]+'%');
  copy.style.setProperty('--mobile-copy-y',composition.mobileText[1]+'%');
  illustration.style.setProperty('--figure-size',figureSize+'vw');
  illustration.style.setProperty('--mobile-figure-y',composition.mobileFigure[1]+'%');
  illustration.style.setProperty('--mobile-figure-size',composition.mobileFigure[2]+'svh');
  const scene = scenes[frame], pose = poses[frame];
  title.textContent = scene[0];
  description.textContent = scene[1];
  illustration.setAttribute('aria-label',scene[2]);
  illustration.style.backgroundPosition = `${frame % 4 * 100 / 3}% ${Math.floor(frame / 4) * 50}%`;
  illustration.style.setProperty('--figure-x',`${figureX}%`);
  illustration.style.setProperty('--figure-y',`${figureY}%`);
  illustration.style.setProperty('--mobile-x',`${composition.mobileFigure[0]}%`);
  action.hidden = false;
  action.textContent = pose[2];
  action.href = `/${pose[3]}`;
  revealCopy(frame);
}
function measure() {
  scheduled = 0;
  const bounds = section.getBoundingClientRect();
  const travel = bounds.height - innerHeight;
  requested = travel <= 0 ? 0 : Math.min(10,Math.max(0,Math.floor(-bounds.top / travel * scenes.length)));
  if (active < 0 || reducedMotion.matches) {
    clearTimeout(fadeTimer); fadeTimer = 0;
    render(requested); stage.classList.remove('is-changing'); return;
  }
  if (requested === active || fadeTimer) return;
  stopEntrance();
  stage.classList.add('is-changing');
  // On fast scroll, render the latest requested frame rather than a stale queue.
  fadeTimer = setTimeout(() => {
    render(requested);
    stage.classList.remove('is-changing');
    fadeTimer = 0;
  },180);
}
reducedMotion.addEventListener('change',schedule);
function schedule() {if(!scheduled) scheduled = requestAnimationFrame(measure);}
addEventListener('scroll',schedule,{passive:true});
addEventListener('resize',schedule);
new ResizeObserver(schedule).observe(section);
const dialog = document.getElementById('junta11-menu');
const opener = document.getElementById('open-menu');
let previousOverflow = null;
function restore() {if(previousOverflow !== null){document.body.style.overflow = previousOverflow;previousOverflow = null;}}
function closeMenu() {dialog.close();restore();opener.setAttribute('aria-expanded','false');}
opener.addEventListener('click',()=>{if(dialog.open)return;previousOverflow = document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();opener.setAttribute('aria-expanded','true');});
document.getElementById('close-menu').addEventListener('click',closeMenu);
dialog.addEventListener('close',()=>{restore();opener.setAttribute('aria-expanded','false');opener.focus();});
function jump(index) {closeMenu();const bounds=section.getBoundingClientRect();scrollTo({top:bounds.top+scrollY+(bounds.height-innerHeight)*(index===0?0:(index+.1)/11),behavior:'instant'});}
if (location.hash === "#como-funciona") requestAnimationFrame(() => jump(5));
document.querySelectorAll('[data-jump]').forEach(button=>button.addEventListener('click',()=>jump(Number(button.dataset.jump))));
document.querySelectorAll('.jump-start').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();jump(0);}));
document.querySelectorAll('[data-app-link]').forEach(link=>link.addEventListener('click',closeMenu));
const list = document.getElementById('accessible-story');
scenes.forEach(scene=>{const li=document.createElement('li');const heading=document.createElement('h2');heading.textContent=scene[0];const p=document.createElement('p');p.textContent=scene[1];li.append(heading,p);list.append(li);});
measure();

// Theme preference is optional local storage; browsing also works when it is blocked.
const themeToggle = document.getElementById('theme-toggle');
function setTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.setAttribute('aria-pressed',String(dark));
  const label = dark ? 'Activar modo claro' : 'Activar modo oscuro';
  themeToggle.setAttribute('aria-label',label);
  themeToggle.setAttribute('title',label);
}
setTheme(document.documentElement.dataset.theme);
themeToggle.addEventListener('click',()=>{
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  setTheme(theme);
  try {localStorage.setItem('junta11-theme',theme);} catch { /* No persistence; toggle still works. */ }
});
