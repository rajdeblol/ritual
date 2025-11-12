// app.js — main logic for RitualNet reveal

// ritual copy
const rituals = {
  aries: { glyph:"♈", title:"The First Flame", desc:"You move before the world asks permission. Strike once, burn bright, and do not apologize.", mini:"Clap once and whisper your next move." },
  taurus: { glyph:"♉", title:"The Grounding", desc:"You shape reality by staying. Hold a long breath and let patient will make the world conform.", mini:"Plant your palm and breathe four counts." },
  gemini: { glyph:"♊", title:"The Split Signal", desc:"You speak in echoes. Whisper twice, once for the future and once for the past.", mini:"Say your name forwards, then backwards." },
  cancer: { glyph:"♋", title:"The Shell of Echoes", desc:"You carry oceans beneath calm. Press a fingertip to your heart and listen to the tide.", mini:"Press a fingertip to your chest and hum." },
  leo: { glyph:"♌", title:"The Golden Rite", desc:"You collect the light. Stand, make a small gesture, and claim the room's attention.", mini:"Lift your chin; smile for three slow counts." },
  virgo: { glyph:"♍", title:"The Precision", desc:"You consecrate through craft. Do one small tidy thing perfectly and watch order reward you.", mini:"Tuck a small note away for tomorrow." },
  libra: { glyph:"♎", title:"The Balance", desc:"You weigh chaos into symmetry. Choose the kinder option and let it be your standard.", mini:"Name one thing you'll balance today." },
  scorpio: { glyph:"♏", title:"The Shadow Ritual", desc:"You turn silence into signal. Breathe deep, and let hidden truths sharpen into tools.", mini:"Breathe in the dark; exhale a secret." },
  sagittarius: { glyph:"♐", title:"The Arrow Path", desc:"You chase unlabeled horizons. Point to a distant place and vow one small step.", mini:"Point to a distant spot and name one goal." },
  capricorn: { glyph:"♑", title:"The Summit", desc:"You climb quietly. Make one measurable promise and take the step that keeps you ascending.", mini:"Make one small measurable promise this week." },
  aquarius: { glyph:"♒", title:"The Signal", desc:"You broadcast the future. Do one strange, deliberate thing and shift the pattern.", mini:"Share one idea with a stranger." },
  pisces: { glyph:"♓", title:"The Dreaming", desc:"You move between tides. Draw one tiny symbol on your palm and remember the path.", mini:"Draw one tiny shape on your palm." }
};

// DOM refs
const signInput = document.getElementById('signInput');
const quickPick = document.getElementById('quickPick');
const revealBtn = document.getElementById('reveal');
const randomBtn = document.getElementById('randomBtn');
const card = document.getElementById('card');
const cardTitle = document.getElementById('cardTitle');
const cardDesc = document.getElementById('cardDesc');
const cardMini = document.getElementById('cardMini');
const cardSigil = document.getElementById('cardSigil');
const sigilImg = document.getElementById('sigilImg');
const viewport = document.getElementById('viewport');
const particlesCanvas = document.getElementById('particles');
const dropHint = document.getElementById('dropHint');
const logoImg = document.getElementById('logoImg');
const logoFallback = document.getElementById('logoFallback');
const logoWrap = document.getElementById('logoWrap');
const shareTweet = document.getElementById('shareTweet');
const downloadCard = document.getElementById('downloadCard');
const muteBtn = document.getElementById('muteBtn');

const DEFAULT_SIGIL = 'assets/sigil-default.png';
const DEFAULT_LOGO = 'assets/ritual-logo.svg';

// audio (small reveal sting) — optional; user can mute
const audioCtx = typeof AudioContext !== 'undefined' ? new AudioContext() : null;
let revealSoundBuffer = null;
let audioEnabled = true;

// load a tiny built-in sting (base64 short beep-like) — minimal
const stingBase64 = "UklGRhQAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="; // placeholder very tiny silent-ish clip
function loadSting(){
  if(!audioCtx) return;
  fetch("data:audio/wav;base64,"+stingBase64).then(r=>r.arrayBuffer()).then(b=> audioCtx.decodeAudioData(b)).then(buf=>{ revealSoundBuffer = buf; }).catch(()=>{});
}
loadSting();

// init sigil
sigilImg.src = DEFAULT_SIGIL;

// init particles
const particles = new Particles(particlesCanvas);
function resizeCanvas(){ particles.resize(viewport.clientWidth, viewport.clientHeight); }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// helper
function keyFrom(str){ return (str||'').trim().toLowerCase().replace(/[^a-z]/g,''); }

// spawn burst helper
function spawnBurst(){
  const rect = viewport.getBoundingClientRect();
  const cx = rect.width/2;
  const cy = rect.height/2 - 30;
  for(let i=0;i<28;i++){
    particles.spawn(cx + (Math.random()-0.5)*160, cy + (Math.random()-0.5)*140, 1.6);
  }
}

// update card text
function showCardFor(signKey){
  const r = rituals[signKey];
  if(!r){
    cardTitle.textContent = "The Unknown Rite";
    cardDesc.textContent = "The signs misread you. Step back, breathe, and name the intention aloud.";
    cardMini.textContent = "Mini-ritual: Pause. Name your goal in one sentence.";
    cardSigil.textContent = "✶";
  } else {
    cardTitle.textContent = r.title;
    cardDesc.textContent = r.desc;
    cardMini.textContent = "Mini-ritual: " + r.mini;
    cardSigil.textContent = r.glyph;
  }
}

// play reveal sound
function playSting(){
  if(!audioEnabled || !audioCtx || !revealSoundBuffer) return;
  const src = audioCtx.createBufferSource();
  src.buffer = revealSoundBuffer;
  const gain = audioCtx.createGain(); gain.gain.value = 0.6;
  src.connect(gain).connect(audioCtx.destination);
  src.start(0);
}

// animated sequence using GSAP
function playReveal(signKey){
  // reset visuals
  sigilImg.style.opacity = '0';
  logoImg.style.opacity = '0';
  logoFallback.style.opacity = '0.04';
  particles.particles = [];
  gsap.set([card], {y:36, scale:0.98, opacity:0, rotation:0});

  const tl = gsap.timeline();

  // 0) logo entrance (centered)
  // try to show external logo first; fallback visible if needed
  if(logoImg.complete && logoImg.naturalWidth > 0){
    logoImg.style.display = ''; logoFallback.style.display = 'none';
  } else {
    logoImg.style.display = 'none'; logoFallback.style.display = '';
  }

  // subtle prep pulse
  tl.to(viewport, {duration:0.32, scale:1.01, ease:"power2.out"}, 0);

  // animate logo: scale up, rotate, bloom, then settle
  tl.to(logoImg, {duration:0.7, opacity:1, scale:1.18, rotate:8, filter:'drop-shadow(0 40px 120px rgba(0,255,128,0.18))', ease:"back.out(1.6)"}, 0.06);
  tl.to(logoImg, {duration:0.5, rotate:0, scale:1.0, ease:"power3.out"}, 0.72);

  // spawn initial particle burst
  tl.call(()=> { spawnBurst(); playSting(); }, null, 0.12);

  // bloom ramp (green wash)
  tl.to('.bloom', {duration:0.36, opacity:1.0, ease:'power2.out'}, 0.12);
  tl.to('.bloom', {duration:0.7, opacity:0.9, ease:'power2.out'}, 0.5);

  // reveal sigil (if user-supplied center sigil)
  tl.to(sigilImg, {duration:0.6, opacity:1, scale:1.02, ease:"power3.out"}, 0.6);

  // pause, then unfurl card from logo (scale + translate)
  tl.to(logoWrap, {duration:0.5, scale:0.86, opacity:0.9, ease:"power3.inOut"}, 0.96);
  tl.to(card, {duration:0.6, opacity:1, y:0, scale:1, ease:"back.out(1.1)"}, 1.02);
  tl.call(()=> { showCardFor(signKey); }, null, 1.05);

  // micro shake for impact
  tl.to(card, {duration:0.12, rotation:1.2, y:-6, ease:"power2.inOut", yoyo:true, repeat:1}, 1.15);

  // green flame subtle pulse (SVG path scale)
  tl.to('#greenFlame path', {duration:0.9, scale:1.06, transformOrigin:"50% 60%", yoyo:true, repeat:-1, ease:"sine.inOut"}, 1.2);

  // continuous ambient particles trickle
  tl.call(()=> {
    const rect = viewport.getBoundingClientRect();
    const cx = rect.width/2;
    const cy = rect.height/2 - 35;
    let n=0;
    const iv = setInterval(()=>{ particles.spawn(cx + (Math.random()-0.5)*240, cy + (Math.random()-0.5)*200, 1.1); n++; if(n>25) clearInterval(iv); }, 90);
  }, null, 1.05);

  // keep logo breathing
  tl.to(logoImg, {duration:3, scale:1.02, ease:"sine.inOut", yoyo:true, repeat:-1}, 1.4);
  tl.to('.bloom', {duration:3, scale:1.02, ease:"sine.inOut", yoyo:true, repeat:-1}, 1.4);
}

// reveal button handler
revealBtn.addEventListener('click', ()=>{
  const key = keyFrom(quickPick.value || signInput.value);
  if(!key){
    gsap.fromTo(signInput, {x:-4}, {duration:0.3, x:4, repeat:3, yoyo:true, clearProps:'x'}); return;
  }
  playReveal(key);
});

// quick pick sync
quickPick.addEventListener('change', ()=>{ if(quickPick.value) signInput.value = quickPick.value; });
randomBtn.addEventListener('click', ()=>{ const keys = Object.keys(rituals); const k = keys[Math.floor(Math.random()*keys.length)]; quickPick.value = k; signInput.value = k; });

// default load (scorpio)
window.addEventListener('load', ()=>{
  signInput.value = 'scorpio'; quickPick.value = 'scorpio';
  // try to preload external logo; if it fails, fallback shows
  fetch(DEFAULT_LOGO, {method:'HEAD'}).then(r=>{ if(r.ok) { logoImg.src = DEFAULT_LOGO; logoImg.style.display = ''; logoFallback.style.display='none'; } else { logoImg.style.display='none'; logoFallback.style.display=''; } }).catch(()=>{ logoImg.style.display='none'; logoFallback.style.display=''; });
  sigilImg.src = DEFAULT_SIGIL;
  setTimeout(()=> playReveal('scorpio'), 480);
});

// drag & drop sigil
viewport.addEventListener('dragover', (e)=>{ e.preventDefault(); viewport.style.outline = '2px dashed rgba(255,255,255,0.06)'; });
viewport.addEventListener('dragleave', ()=>{ viewport.style.outline = 'none'; });
viewport.addEventListener('drop', (e)=>{ e.preventDefault(); viewport.style.outline = 'none'; const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(f && f.type.startsWith('image/')){ const url = URL.createObjectURL(f); sigilImg.src = url; gsap.fromTo(sigilImg, {scale:0.6, opacity:0}, {duration:0.8, scale:1, opacity:1, ease:"back.out(1.2)"}); } });

// share to X
shareTweet.addEventListener('click', ()=>{
  const k = keyFrom(signInput.value || quickPick.value);
  const r = rituals[k];
  const tweet = r ? `My Zodiac Ritual: ${r.title} — ${r.desc} @Ritual_Net` : `I revealed a Zodiac Ritual @Ritual_Net`;
  const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
  window.open(intent, '_blank', 'noopener,noreferrer');
});

// download card (capture viewport)
downloadCard.addEventListener('click', ()=>{
  // temporarily reveal card if hidden so capture works
  html2canvas(viewport, {scale:2, backgroundColor:null}).then(canvas=>{
    const link = document.createElement('a');
    link.download = 'ritual-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(err=> alert('Export failed — try screenshot. '+err));
});

// mute toggle
muteBtn.addEventListener('click', ()=>{
  audioEnabled = !audioEnabled;
  muteBtn.textContent = audioEnabled ? 'Mute' : 'Unmute';
});

// keyboard
signInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ e.preventDefault(); revealBtn.click(); } });

// ambient particle trickle
setInterval(()=>{ const rect = viewport.getBoundingClientRect(); const cx = rect.width/2 + (Math.random()-0.5)*120; const cy = rect.height*0.6 + (Math.random()-0.5)*60; particles.spawn(cx, cy, 0.8); }, 4200);
