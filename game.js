\
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let DPR = window.devicePixelRatio || 1;
function resize(){ canvas.style.width=window.innerWidth+'px'; canvas.style.height=window.innerHeight+'px'; canvas.width=Math.floor(window.innerWidth*DPR); canvas.height=Math.floor(window.innerHeight*DPR); ctx.setTransform(DPR,0,0,DPR,0,0); }
window.addEventListener('resize', resize); resize();

// assets and audio
const ASSETS = {};
const assetPaths = {
  player: 'assets/player.png',
  enemy: 'assets/enemy.png',
  boss: 'assets/boss.png',
  bullet: 'assets/bullet.png',
  background: 'assets/background.jpg',
  explosion: 'assets/explosion.png',
  p_double: 'assets/powerup_double.png',
  p_strong: 'assets/powerup_stronger.png',
  p_life: 'assets/powerup_life.png'
};
let loaded=0, totalAssets=Object.keys(assetPaths).length + 3;
for(let k in assetPaths){
  ASSETS[k]=new Image(); ASSETS[k].src=assetPaths[k]; ASSETS[k].onload=()=>{ if(++loaded===totalAssets) init(); };
}
// audio
const SFX = {};
SFX.bgm = new Audio('assets/bgm_8bit.wav'); SFX.bgm.loop = true; SFX.bgm.volume = 0.4;
SFX.shot = new Audio('assets/sfx_shot.wav'); SFX.explode = new Audio('assets/sfx_explode.wav'); SFX.power = new Audio('assets/sfx_power.wav');
SFX.shot.volume = 0.6; SFX.explode.volume = 0.6; SFX.power.volume = 0.6;
SFX.shot.oncanplaythrough = ()=>{ if(++loaded===totalAssets) init(); };
SFX.explode.oncanplaythrough = ()=>{ if(++loaded===totalAssets) init(); };
SFX.power.oncanplaythrough = ()=>{ if(++loaded===totalAssets) init(); }

// UI
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');
const hud = document.getElementById('hud');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const levelEl = document.getElementById('level');
const finalScore = document.getElementById('finalScore');
const bestScore = document.getElementById('bestScore');
const toggleAudioBtn = document.getElementById('toggleAudio');

let player, bullets, enemies, powerups, explosions, score, lives, level, levelTimer, boss, gameRunning;
const keys = {};
document.addEventListener('keydown', e=>{ keys[e.key]=true; if(e.key===' ') e.preventDefault(); });
document.addEventListener('keyup', e=>{ keys[e.key]=false; });

function init(){
  player={ x: canvas.width/2, y: canvas.height-120, w:64, h:64, speed:6, fireDelay:300, lastFire:0, power:1, double:false };
  bullets=[]; enemies=[]; powerups=[]; explosions=[]; score=0; lives=3; level=1; levelTimer=0; boss=null; gameRunning=false;
  updateHUD(); startScreen.classList.remove('hidden'); hud.classList.add('hidden');
}

function rand(min,max){ return Math.random()*(max-min)+min; }
function spawnEnemyWave(count){ for(let i=0;i<count;i++){ enemies.push({ x: rand(50, canvas.width-50), y: -rand(20,200), w:48, h:48, speed:1+Math.random()*2, hp:1 }); } }
function spawnBoss(){ boss = { x: canvas.width/2, y: -120, w:200, h:120, hp: 10 + level*5, maxHp:10 + level*5, phase:0, timer:0 }; }
function spawnPowerup(x,y){ const r=Math.random(); let type='p_double'; if(r<0.12) type='p_life'; else if(r<0.4) type='p_strong'; powerups.push({ x,y,type,vy:1.2 }); }

function update(dt){
  if(!gameRunning) return;
  if(keys['ArrowLeft']||keys['a']) player.x -= player.speed;
  if(keys['ArrowRight']||keys['d']) player.x += player.speed;
  if(keys['ArrowUp']||keys['w']) player.y -= player.speed;
  if(keys['ArrowDown']||keys['s']) player.y += player.speed;
  player.x = Math.max(player.w/2, Math.min(canvas.width-player.w/2, player.x));
  player.y = Math.max(player.h/2, Math.min(canvas.height-player.h/2-40, player.y));
  const now=Date.now();
  if(now - player.lastFire > player.fireDelay){ fireBullet(); player.lastFire = now; }
  for(let i=bullets.length-1;i>=0;i--){ const b=bullets[i]; if('vx' in b){ b.x += b.vx; b.y += b.vy; } else { b.y -= b.vy||8; } if(b.y < -50 || b.y > canvas.height+50) bullets.splice(i,1); }
  for(let i=enemies.length-1;i>=0;i--){ const e=enemies[i]; e.y += e.speed; if(e.y > canvas.height+50){ enemies.splice(i,1); continue; } for(let j=bullets.length-1;j>=0;j--){ const b=bullets[j]; if(b.x > e.x - e.w/2 && b.x < e.x + e.w/2 && b.y > e.y - e.h/2 && b.y < e.y + e.h/2){ bullets.splice(j,1); e.hp -= (player.power||1); if(e.hp<=0){ if(Math.random()<0.25) spawnPowerup(e.x,e.y); enemies.splice(i,1); score += 10; SFX.explode.currentTime=0; SFX.explode.play(); } break; } } }
  if(boss){ boss.timer += dt; if(boss.phase===0){ if(boss.y < 120) boss.y += 1.5; else boss.phase=1; } else if(boss.phase===1){ boss.x += Math.sin(boss.timer/500)*1.5; if(boss.timer % 800 < dt){ const shots=6; const spread=Math.PI/4; const center=Math.PI/2; for(let i=0;i<shots;i++){ const angle=center-spread/2 + (i/(shots-1))*spread; const speed=3; bullets.push({ x: boss.x + Math.cos(angle)*40, y: boss.y + Math.sin(angle)*40, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed }); } } if(boss.hp < boss.maxHp*0.6){ boss.phase=2; boss.timer=0; } } else if(boss.phase===2){ boss.x += Math.sin(boss.timer/300)*3; if(boss.timer % 500 < dt){ for(let i=0;i<3;i++){ const dx = player.x - boss.x + (Math.random()-0.5)*100; const dy = player.y - boss.y; const ang = Math.atan2(dy,dx); bullets.push({ x: boss.x + Math.cos(ang)*40, y: boss.y + Math.sin(ang)*40, vx: Math.cos(ang)*5, vy: Math.sin(ang)*5 }); } } if(boss.hp < boss.maxHp*0.25) boss.phase=3; } else if(boss.phase===3){ if(boss.timer % 200 < dt){ const n=12; for(let i=0;i<n;i++){ const angle = (boss.timer/200 + i) * (Math.PI*2/n); bullets.push({ x: boss.x + Math.cos(angle)*30, y: boss.y + Math.sin(angle)*30, vx: Math.cos(angle)*4, vy: Math.sin(angle)*4 }); } } if(boss.hp <=0){ score += 200; boss=null; level++; levelTimer=0; spawnEnemyWave(3+level*2); if(Math.random()<0.5) spawnPowerup(canvas.width/2, boss?boss.y:100); } } for(let j=bullets.length-1;j>=0;j--){ const b=bullets[j]; if(b.x > boss.x - boss.w/2 && b.x < boss.x + boss.w/2 && b.y > boss.y - boss.h/2 && b.y < boss.y + boss.h/2){ bullets.splice(j,1); boss.hp -= player.power; if(boss.hp<=0){ score += 100; boss=null; level++; levelTimer=0; spawnEnemyWave(3+level*2); } break; } } }
  for(let i=powerups.length-1;i>=0;i--){ const p=powerups[i]; p.y += p.vy; if(p.y > canvas.height+20) powerups.splice(i,1); if(Math.abs(p.x - player.x) < 36 && Math.abs(p.y - player.y) < 36){ if(p.type==='p_double'){ player.double=true; player.fireDelay = Math.max(80, player.fireDelay/2); setTimeout(()=>{ player.double=false; player.fireDelay*=2; },15000); SFX.power.currentTime=0; SFX.power.play(); } else if(p.type==='p_strong'){ player.power = (player.power||1)+1; setTimeout(()=>{ player.power = Math.max(1, player.power-1); },15000); SFX.power.currentTime=0; SFX.power.play(); } else if(p.type==='p_life'){ lives = Math.min(9, lives+1); SFX.power.currentTime=0; SFX.power.play(); } powerups.splice(i,1); } }
  for(const e of enemies){ if(Math.abs(e.x - player.x) < (e.w/2 + player.w/2) && Math.abs(e.y - player.y) < (e.h/2 + player.h/2)){ lives -= 1; e.hp = 0; if(Math.random()<0.3) spawnPowerup(e.x,e.y); } }
  if(lives <= 0) endGame();
  levelTimer += dt;
  if(!boss && levelTimer > 15000) spawnBoss();
  if(Math.random() < 0.02 + level*0.002) spawnEnemyWave(1 + Math.floor(level/2));
  updateHUD();
}

function fireBullet(){ const top={ x: player.x, y: player.y - player.h/2 }; bullets.push({ x: top.x, y: top.y, vy: 8 }); if(player.double){ bullets.push({ x: top.x-18, y: top.y, vy: 8 }); bullets.push({ x: top.x+18, y: top.y, vy: 8 }); } SFX.shot.currentTime=0; SFX.shot.play(); }

function draw(){ const bg=ASSETS.background; ctx.drawImage(bg,0,0,canvas.width,canvas.height); for(const e of enemies){ ctx.drawImage(ASSETS.enemy, e.x - e.w/2, e.y - e.h/2, e.w, e.h); } if(boss) ctx.drawImage(ASSETS.boss, boss.x - boss.w/2, boss.y - boss.h/2, boss.w, boss.h); for(const p of powerups){ ctx.drawImage(ASSETS[p.type.replace('p_','p_')] || ASSETS.p_double, p.x-16, p.y-16, 32,32); } for(const b of bullets){ ctx.fillStyle='white'; ctx.fillRect(b.x-3, b.y-10, 6, 12); } ctx.drawImage(ASSETS.player, player.x - player.w/2, player.y - player.h/2, player.w, player.h); ctx.fillStyle='white'; ctx.font='18px Arial'; ctx.fillText('分数:'+score, canvas.width-140, 30); }

let last = performance.now();
function loop(ts){ const now = performance.now(); const dt = now - last; last = now; update(dt); draw(); requestAnimationFrame(loop); }

function updateHUD(){ scoreEl.innerText='分数: '+score; livesEl.innerText='生命: '+lives; levelEl.innerText='关卡: '+level; bestScore.innerText='最高分: '+(localStorage.getItem('bestScore')||0); }

function startGame(){ player.x = canvas.width/2; player.y = canvas.height-120; player.w=64; player.h=64; bullets=[]; enemies=[]; powerups=[]; boss=null; score=0; lives=3; level=1; levelTimer=0; gameRunning=true; startScreen.classList.add('hidden'); hud.classList.remove('hidden'); SFX.bgm.play().catch(()=>{}); last=performance.now(); requestAnimationFrame(loop); }

function endGame(){ gameRunning=false; gameOverScreen.classList.remove('hidden'); finalScore.innerText='得分: '+score; const best=Math.max(score, Number(localStorage.getItem('bestScore')||0)); localStorage.setItem('bestScore', best); bestScore.innerText='最高分: '+best; hud.classList.add('hidden'); SFX.bgm.pause(); }

startBtn.addEventListener('click', ()=>{ startGame(); }); restartBtn.addEventListener('click', ()=>{ init(); });

document.body.addEventListener('touchstart',(e)=>{ const t=e.touches[0]; player.x=t.clientX; player.y=t.clientY; fireBullet(); e.preventDefault(); },{passive:false}); document.body.addEventListener('touchmove',(e)=>{ const t=e.touches[0]; player.x=t.clientX; player.y=t.clientY; e.preventDefault(); },{passive:false});

toggleAudioBtn.addEventListener('click', ()=>{ if(SFX.bgm.paused){ SFX.bgm.play(); } else { SFX.bgm.pause(); } });

if(loaded === totalAssets) init();
