const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const playerImg = new Image();
playerImg.src = "rocket.png";
const enemyImg = new Image();
enemyImg.src = "enemy.png";

let player = { x: canvas.width/2 - 32, y: canvas.height - 100, w: 64, h: 64, speed: 5 };
let bullets = [];
let enemies = [];
let keys = {};

document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 50),
    y: -60,
    w: 50,
    h: 50,
    speed: 2 + Math.random()*2
  });
}

function update() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.w < canvas.width) player.x += player.speed;
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y + player.h < canvas.height) player.y += player.speed;

  bullets.forEach(b => b.y -= b.speed);
  enemies.forEach(e => e.y += e.speed);

  bullets = bullets.filter(b => b.y > -10);
  enemies = enemies.filter(e => e.y < canvas.height + 50);

  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x &&
          b.y < e.y + e.h && b.y + b.h > e.y) {
        bullets.splice(bi,1);
        enemies.splice(ei,1);
      }
    });
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
  bullets.forEach(b => {
    ctx.fillStyle = "white";
    ctx.fillRect(b.x, b.y, b.w, b.h);
  });
  enemies.forEach(e => {
    ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h);
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  setInterval(spawnEnemy, 1500);
  loop();
}

document.getElementById('startBtn').addEventListener('click', startGame);
