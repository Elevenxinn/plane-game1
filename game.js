const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ✅ 修正资源路径
const playerImg = new Image();
playerImg.src = "assets/player.png";
const enemyImg = new Image();
enemyImg.src = "assets/enemy.png";

// 玩家、子弹、敌人数据
let player = { x: canvas.width/2 - 32, y: canvas.height - 120, w: 64, h: 64, speed: 6 };
let bullets = [];
let enemies = [];
let keys = {};
let lastShot = 0;

// 键盘控制
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

function shoot() {
  const now = Date.now();
  if (now - lastShot < 200) return; // 防止连射太快
  bullets.push({ x: player.x + player.w/2 - 3, y: player.y, w: 6, h: 12, speed: 10 });
  lastShot = now;
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (canvas.width - 50),
    y: -60,
    w: 50,
    h: 50,
    speed: 2 + Math.random() * 3
  });
}

function update() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.w < canvas.width) player.x += player.speed;
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y + player.h < canvas.height) player.y += player.speed;
  if (keys[" "]) shoot();

  bullets.forEach(b => b.y -= b.speed);
  enemies.forEach(e => e.y += e.speed);

  bullets = bullets.filter(b => b.y > -20);
  enemies = enemies.filter(e => e.y < canvas.height + 50);

  // 碰撞检测
  bullets.forEach((b, bi) => {
    enemies.forEach((e, ei) => {
      if (b.x < e.x + e.w && b.x + b.w > e.x && b.y < e.y + e.h && b.y + b.h > e.y) {
        bullets.splice(bi, 1);
        enemies.splice(ei, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
  enemies.forEach(e => ctx.drawImage(enemyImg, e.x, e.y, e.w, e.h));

  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function startGame() {
  document.getElementById('startBtn').style.display = 'none'; // ✅ 点击后隐藏按钮
  setInterval(spawnEnemy, 1500);
  loop();
}

document.getElementById('startBtn').addEventListener('click', startGame);
