// 调试版 Plane Game v2
// ✅ 自动检测资源加载情况
// ✅ 在控制台输出详细错误信息

console.log("%c🚀 启动游戏资源加载...", "color: #4CAF50; font-weight: bold;");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const hud = document.getElementById("hud");
const scoreDisplay = document.getElementById("score");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const finalScore = document.getElementById("finalScore");
const bestScore = document.getElementById("bestScore");

let score = 0;
let lives = 3;
let level = 1;
let bullets = [];
let enemies = [];
let keys = {};
let gameRunning = false;

// ✅ 资源路径
const ASSET_PATHS = {
  player: "assets/player.png",
  enemy: "assets/enemy.png",
  bullet: "assets/bullet.png"
};

const ASSETS = {};
let loadedAssets = 0;
const totalAssets = Object.keys(ASSET_PATHS).length;

// ✅ 检查图片是否加载成功
function loadAssets() {
  for (let key in ASSET_PATHS) {
    const img = new Image();
    img.src = ASSET_PATHS[key];
    img.onload = () => {
      console.log(`✅ 成功加载: ${ASSET_PATHS[key]}`);
      loadedAssets++;
      ASSETS[key] = img;
      if (loadedAssets === totalAssets) {
        console.log("%c🎮 所有资源加载完毕!", "color: #2196F3; font-weight: bold;");
        initGame();
      }
    };
    img.onerror = () => {
      console.error(`❌ 加载失败: ${ASSET_PATHS[key]}`);
      ctx.fillStyle = "red";
      ctx.font = "20px Arial";
      ctx.fillText(`加载失败: ${ASSET_PATHS[key]}`, 20, 40 + loadedAssets * 30);
    };
  }
}

// ✅ 初始化游戏
function initGame() {
  startScreen.classList.add("hidden");
  hud.classList.remove("hidden");
  gameOverScreen.classList.add("hidden");
  score = 0;
  lives = 3;
  level = 1;
  bullets = [];
  enemies = [];
  player.x = canvas.width / 2;
  player.y = canvas.height - 100;
  gameRunning = true;
  loop();
}

const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 60,
  height: 60,
  speed: 6
};

document.addEventListener("keydown", (e) => {
  keys[e.key] = true;
  if (e.key === " ") shoot();
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function shoot() {
  bullets.push({ x: player.x + 25, y: player.y, width: 10, height: 20 });
}

function update() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
  if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
  if (keys["ArrowDown"] && player.y < canvas.height - player.height) player.y += player.speed;

  bullets.forEach((b) => (b.y -= 10));
  bullets = bullets.filter((b) => b.y > 0);
}

function drawPlayer() {
  try {
    ctx.drawImage(ASSETS.player, player.x, player.y, player.width, player.height);
  } catch (e) {
    console.error("🛑 绘制玩家时出错:", e);
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  bullets.forEach((b) => {
    ctx.fillStyle = "white";
    ctx.fillRect(b.x, b.y, b.width, b.height);
  });
}

function loop() {
  if (!gameRunning) return;
  update();
  render();
  requestAnimationFrame(loop);
}

// ✅ 绑定按钮
startBtn.addEventListener("click", () => {
  console.log("▶️ 点击开始游戏");
  loadAssets();
});

restartBtn.addEventListener("click", initGame);
