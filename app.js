(() => {
  'use strict';
  const asset = name => `assets-${name}.webp`;
  const chapters = [
    {name:'changes in my hometown',zh:'我的家乡',steps:1,thumb:'cover'},
    {name:'The city, then & now',zh:'城市的过去与变化',steps:6,thumb:'street-old'},
    {name:'The way home',zh:'小时候回家的路',steps:4,thumb:'ramp-start'},
    {name:'Through the doorway',zh:'走进温暖的家',steps:3,thumb:'home'},
    {name:'A new neighbourhood',zh:'搬进新小区',steps:3,thumb:'neighborhood-new'},
    {name:'A changing city',zh:'欧亚与万达',steps:3,thumb:'ouya'},
    {name:'A familiar little shop',zh:'熟悉的小店与人情',steps:1,thumb:'shop'},
    {name:'The warmth remains',zh:'变化中的温暖',steps:1,thumb:'cover'}
  ];
  const places = [
    {title:'The streets<br>we remember.',label:'Streets',zh:'老街道',old:'1990s',asset:'street',copy:'The same streets. A different rhythm.',oldCaption:'A glimpse of the old streets',newCaption:'The streets in 2021'},
    {title:'A familiar<br>landmark.',label:'City People’s Hospital',zh:'市人民医院',old:'1980s',asset:'hospital',copy:'A city’s changes, reflected in a familiar place.',oldCaption:'City People’s Hospital in the 1980s',newCaption:'City People’s Hospital in 2021'},
    {title:'Room for<br>everyday life.',label:'Wuyi Square',zh:'五一广场',old:'1990s',asset:'square',copy:'An open space. Generations of everyday moments.',oldCaption:'Wuyi Square in the 1990s',newCaption:'Wuyi Square in 2021'}
  ];
  let chapter = 0, step = 0, paused = false, compareOld = false, blackoutTimer = 0, toastTimer = 0;
  let blackoutRemaining = 0, blackoutStarted = 0;
  let audioContext = null, audioGain = null, soundOn = false;
  const stage = document.querySelector('#stage');
  const app = document.querySelector('#app');
  const dialog = document.querySelector('#chapters-dialog');
  const $ = s => document.querySelector(s);
  const pad = n => String(n).padStart(2,'0');
  const bg = (file,alt,extra='') => `<img class="scene-image ${extra}" src="${asset(file)}" alt="${alt}" fetchpriority="high"><div class="shade"></div>`;
  const eyebrow = t => `<p class="eyebrow">${t}</p>`;
  const timeline = n => `<div class="scene-timeline" aria-label="Step ${step+1} of ${n}">${Array.from({length:n},(_,i)=>`<button class="timeline-point ${i===step?'active':''}" data-step="${i}" aria-label="Go to step ${i+1}"></button>`).join('')}</div>`;
  const pauseButton = () => `<button class="pause-pill" data-action="pause">${paused?'▶ Continue':'Ⅱ Pause'}</button>`;
  function markup() {
    if(chapter===0) return '<div id="opening-root"></div>';
    if(chapter===1){
      const p=places[Math.floor(step/2)], newer=step%2===1, year=newer?'2021':p.old, file=`${p.asset}-${newer?'2021':'old'}`;
      return `<section class="scene history-scene"><div class="history-layout"><div class="history-copy">${eyebrow('01 / THE CITY, THEN & NOW')}<h1>${p.title}</h1><p class="description">${p.copy}</p><nav class="place-buttons" aria-label="Choose landmark">${places.map((x,i)=>`<button class="place-button ${i===Math.floor(step/2)?'active':''}" data-step="${i*2}" aria-pressed="${i===Math.floor(step/2)}"><span>${pad(i+1)}</span><span>${x.label}</span></button>`).join('')}</nav></div><figure class="photo-frame" style="margin:0"><div class="photo-mat"><img class="image-fill" src="${asset(file)}" alt="" aria-hidden="true"><img class="real-photo" src="${asset(file)}" alt="Pixel-art interpretation of ${p.label}, ${year}"><span class="date-label">${year}</span></div><figcaption class="photo-caption"><p>${newer?p.newCaption:p.oldCaption}<small>Photo-based pixel interpretation · ${p.zh}</small></p><div class="date-switch" aria-label="Choose year"><button data-step="${Math.floor(step/2)*2}" class="${!newer?'active':''}" aria-pressed="${!newer}">${p.old}</button><button data-step="${Math.floor(step/2)*2+1}" class="${newer?'active':''}" aria-pressed="${newer}">2021</button></div></figcaption></figure></div></section>`;
    }
    if(chapter===2){
      const data=[['ramp-start','The way home.','A familiar climb, after school.'],['ramp-mid','Step by step.','The slope. The gravel. The iron fences.'],['ramp-end','There it was.','Our old neighbourhood, just beyond the slope.'],['ramp-end','A small world.<br>A place of my own.','The place I once called home.']][step];
      return `<section class="scene walk ${step===1?'walking':''} ${step===3?'arrival':''}">${bg(data[0],'First-person pixel-art view of the path into the old neighbourhood')}<div class="memory-tag"><i></i> EPISODE 1 · CHILDHOOD</div>${step===1||step===3?pauseButton():''}<div class="scene-content">${eyebrow('02 / THE WAY HOME')}<h1 class="scene-heading">${data[1]}</h1><p class="scene-subtitle">${data[2]}</p>${step===3?'<div class="scene-facts"><div class="fact"><strong>06</strong><span>APARTMENT<br>BUILDINGS</span></div><div class="fact"><strong>06</strong><span>STOREYS<br>EACH</span></div></div>':''}</div>${timeline(4)}</section>`;
    }
    if(chapter===3){
      const data=[['stairwell','Through the<br>unit entrance.','An ordinary stairwell. A familiar route.'],['stairwell','One flight.<br>Then another.','A few steps closer to home.'],['home','And then,<br><em>home.</em>','Our warm, welcoming flat.']][step];
      return `<section class="scene home ${step===1?'walking':''} ${step===2?'home-warm arrival':''}">${bg(data[0],step===2?'Warm pixel-art interior of an ordinary family flat':'Pixel-art stairwell in an older residential building')}<div class="scene-content">${eyebrow('03 / THROUGH THE DOORWAY')}<h1 class="scene-heading">${data[1]}</h1><p class="scene-subtitle">${data[2]}</p>${step===2?'<button class="small-action" data-action="replay-home">↺ Walk home again</button>':''}</div>${step>0?pauseButton():''}${timeline(3)}</section>`;
    }
    if(chapter===4){
      const titles=['A new chapter.<br>A new neighbourhood.','More places.<br>More everyday possibilities.','A different place.<br>The same feeling of home.'];
      return `<section class="scene neighborhood">${bg(compareOld?'ramp-end':'neighborhood-new',compareOld?'The old six-building neighbourhood':'Pixel-art view of a newer neighbourhood with shops and green public spaces')}<button class="compare-home" data-action="compare-home" aria-pressed="${compareOld}">${compareOld?'Show the new neighbourhood →':'← Remember the old neighbourhood'}</button><div class="scene-content">${eyebrow(compareOld?'04 / LOOKING BACK':'04 / YEARS LATER · JUNIOR HIGH')}<h1 class="scene-heading">${compareOld?'Where we<br>started.':titles[step]}</h1><p class="scene-subtitle">${compareOld?'Six buildings. Six storeys. So many memories.':'We moved closer to my new school.'}</p><div class="feature-row"><button class="feature-chip ${step>=0?'active':''}" data-step="0">Closer to school</button><button class="feature-chip ${step>=1?'active':''}" data-step="1">Shops & restaurants</button><button class="feature-chip ${step>=2?'active':''}" data-step="2">Better-maintained facilities</button></div></div>${timeline(3)}</section>`;
    }
    if(chapter===5){
      const mall=[{file:'ouya',title:'Ouya.',sub:'A familiar name.<br>A wider world of choices.',caption:'欧亚 · OUYA'},{file:'wanda',title:'Wanda.',sub:'New spaces for shopping,<br>meeting and everyday life.',caption:'万达 · WANDA'},{file:'wanda-detail',title:'A closer look.',sub:'The details of a changing city.',caption:'万达 · WANDA / ANOTHER VIEW'}][step];
      return `<section class="scene commerce-scene"><div class="commerce-layout"><div class="commerce-copy">${eyebrow('05 / A CHANGING CITY')}<h1>${mall.title}</h1><p class="description">${mall.sub}</p><div class="mall-tabs"><button data-step="0" class="${step===0?'active':''}">OUYA</button><button data-step="1" class="${step>0?'active':''}">WANDA</button></div></div><figure class="commerce-photo" style="margin:0"><div class="photo-mat"><img class="image-fill" src="${asset(mall.file)}" alt="" aria-hidden="true"><img class="real-photo" src="${asset(mall.file)}" alt="Pixel-art interpretation of ${step===0?'Ouya mall':'Wanda Plaza'} from the supplied photograph"></div><figcaption class="photo-caption"><span>${mall.caption}</span><span class="frame-num">${pad(step+1)} / 03</span></figcaption></figure></div></section>`;
    }
    if(chapter===6) return `<section class="scene quiet">${bg('shop','Illustrative pixel-art neighbourhood shop with warm lights')}<div class="scene-content">${eyebrow('06 / THE PEOPLE & THE MEMORIES')}<h1 class="scene-heading">Some places<br>stay with <em>us.</em></h1><p class="scene-subtitle">A little shop. Familiar moments.<br>The human side of change.</p></div></section>`;
    return `<section class="scene ending">${bg('cover','The hometown pixel-art cityscape returns')}<div class="scene-content">${eyebrow('THE JOURNEY COMES HOME')}<h1 class="scene-heading">The warmth of<br>the city <em>remains.</em></h1><p class="thank-you">THANK YOU FOR WALKING WITH ME.</p><button class="small-action" data-action="restart">↺ Return to the beginning</button></div></section>`;
  }
  function readHash(){const m=location.hash.match(/^#scene-(\d+)(?:-(\d+))?$/);if(m){chapter=Math.max(0,Math.min(7,Number(m[1])-1));step=Math.max(0,Math.min(chapters[chapter].steps-1,Number(m[2]||1)-1));}}
  function updateHash(){try{history.replaceState(null,'',`#scene-${chapter+1}-${step+1}`);}catch(e){}}
  function render({black=false}={}){
    clearTimeout(blackoutTimer);blackoutRemaining=0;$('#blackout').classList.remove('visible');
    document.body.classList.toggle('light-scene',chapter===1);
    document.body.classList.toggle('opening-scene',chapter===0);
    app.classList.toggle('paused',paused);
    window.HometownOpening?.unmount();
    stage.innerHTML=markup();
    if(chapter===0) window.HometownOpening?.mount($('#opening-root'),()=>{go(1);stage.focus({preventScroll:true});});
    $('#current-count').textContent=pad(chapter+1);$('#current-name').textContent=chapters[chapter].name;
    $('#step-count').textContent=`${step+1}/${chapters[chapter].steps}`;
    $('#prev').disabled=chapter===0&&step===0;$('#next').disabled=chapter===7;
    $('#chapter-progress').innerHTML=chapters.map((c,i)=>`<button class="progress-item ${i===chapter?'active':i<chapter?'completed':''}" data-chapter="${i}" aria-label="${i+1}. ${c.name}" ${i===chapter?'aria-current="step"':''}></button>`).join('');
    $('#chapter-menu').innerHTML=chapters.map((c,i)=>`<button class="chapter-menu-item ${i===chapter?'active':''}" data-chapter="${i}"><span>${pad(i+1)}</span><div>${c.name}<small>${c.zh}</small></div></button>`).join('');
    $('#announcement').textContent=`Chapter ${chapter+1}: ${chapters[chapter].name}. Step ${step+1} of ${chapters[chapter].steps}.`;
    updateHash();preloadNext();
    if(black){$('#blackout').classList.add('visible');blackoutRemaining=850;resumeBlackout();}
  }
  function go(c,s=0){const wasChapter=chapter,wasStep=step;chapter=Math.max(0,Math.min(7,c));step=Math.max(0,Math.min(chapters[chapter].steps-1,s));if(wasChapter===chapter&&wasStep===step)return;paused=false;compareOld=false;render({black:chapter===3&&step===2&&wasChapter===3&&wasStep===1});}
  function next(){if(step<chapters[chapter].steps-1)go(chapter,step+1);else if(chapter<7)go(chapter+1);}
  function prev(){if(step>0)go(chapter,step-1);else if(chapter>0)go(chapter-1,chapters[chapter-1].steps-1);}
  function resumeBlackout(){if(blackoutRemaining<=0)return;blackoutStarted=performance.now();blackoutTimer=setTimeout(()=>{blackoutRemaining=0;$('#blackout').classList.remove('visible');},blackoutRemaining);}
  function togglePause(){paused=!paused;app.classList.toggle('paused',paused);if(blackoutRemaining>0){if(paused){clearTimeout(blackoutTimer);blackoutRemaining=Math.max(1,blackoutRemaining-(performance.now()-blackoutStarted));}else resumeBlackout();}document.querySelectorAll('.pause-pill').forEach(b=>b.textContent=paused?'▶ Continue':'Ⅱ Pause');toast(paused?'动画已暂停 · Paused':'继续播放 · Playing');}
  function toast(t){clearTimeout(toastTimer);$('#toast').textContent=t;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),1800);}
  function preloadNext(){const names=new Set([chapters[Math.min(7,chapter+1)].thumb]);if(chapter===1){const p=places[Math.floor(step/2)];names.add(`${p.asset}-${step%2?'old':'2021'}`);if(step<4)names.add(`${places[Math.floor(step/2)+1].asset}-old`);}if(chapter===2){names.add('ramp-mid');names.add('ramp-end');}if(chapter===3)names.add('home');if(chapter===5){names.add('wanda');names.add('wanda-detail');}for(const n of names){const img=new Image();img.src=asset(n);}}
  async function sound(){try{if(!audioContext){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){toast('此浏览器不支持环境音');return;}audioContext=new AC();audioGain=audioContext.createGain();audioGain.gain.value=0;audioGain.connect(audioContext.destination);[130.81,196,261.63].forEach((freq,i)=>{const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='sine';o.frequency.value=freq;g.gain.value=[.17,.08,.04][i];o.connect(g);g.connect(audioGain);o.start();});}await audioContext.resume();soundOn=!soundOn;audioGain.gain.setTargetAtTime(soundOn?.08:0,audioContext.currentTime,.5);document.body.classList.toggle('sound-on',soundOn);$('#sound').setAttribute('aria-pressed',String(soundOn));$('#sound').setAttribute('aria-label',soundOn?'Mute ambient sound':'Enable ambient sound');$('.sound-status').textContent=soundOn?'ON':'OFF';toast(soundOn?'环境音已开启 · Ambient sound on':'环境音已关闭 · Sound off');}catch(e){toast('环境音暂不可用');}}
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else toast('请使用浏览器菜单进入全屏');}catch(e){toast('请使用浏览器菜单进入全屏');}}
  $('#next').addEventListener('click',next);$('#prev').addEventListener('click',prev);$('#brand').addEventListener('click',()=>go(0));$('#sound').addEventListener('click',sound);$('#fullscreen').addEventListener('click',fullscreen);
  $('#chapters-open').addEventListener('click',()=>dialog.showModal());$('#chapters-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  document.addEventListener('click',e=>{const ch=e.target.closest('[data-chapter]');if(ch){go(Number(ch.dataset.chapter));if(dialog.open)dialog.close();return;}const st=e.target.closest('[data-step]');if(st){const wasComparing=compareOld;compareOld=false;const nextStep=Number(st.dataset.step);if(wasComparing&&nextStep===step)render();else go(chapter,nextStep);return;}const action=e.target.closest('[data-action]')?.dataset.action;if(action==='next')next();else if(action==='pause')togglePause();else if(action==='replay-home')go(3,0);else if(action==='restart')go(0);else if(action==='compare-home'){compareOld=!compareOld;render();}});
  document.addEventListener('keydown',e=>{if(dialog.open||e.altKey||e.ctrlKey||e.metaKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(chapter===0&&e.code==='Space')return;if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();if(!e.repeat)next();}else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();if(!e.repeat)prev();}else if(e.code==='Space'){e.preventDefault();if(!e.repeat)togglePause();}});
  let touchX=null,touchY=null;stage.addEventListener('touchstart',e=>{if(e.touches.length===1){touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;}},{passive:true});stage.addEventListener('touchend',e=>{if(touchX===null||!e.changedTouches.length)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0)next();else prev();}touchX=null;},{passive:true});
  document.addEventListener('fullscreenchange',()=>$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Exit fullscreen':'Enter fullscreen'));
  window.addEventListener('hashchange',()=>{readHash();paused=false;compareOld=false;render();});
  readHash();render();
})();
