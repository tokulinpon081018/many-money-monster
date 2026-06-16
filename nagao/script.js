const head = document.getElementById("head");
const body = document.getElementById("body");
const field = document.getElementById("field");
const message = document.getElementById("message");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const retryButton = document.getElementById("retryButton");

let headX = 0;
let headY = -140;

let falling = false;
let fallSpeed = 3.2;
let animationId = null;

let bodyFrame = 1;
let bodyTimer = null;

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// ここが「顔がハマる正解位置」
// 画像に合わせてあとで調整する
const targetX = 215;
const targetY = 250;

// 成功判定のゆるさ
const successRange = 35;

function setHeadPosition() {
  head.style.left = headX + "px";
  head.style.top = headY + "px";
}

function startBodyAnimation() {
  stopBodyAnimation();

  bodyTimer = setInterval(() => {
    if (bodyFrame === 1) {
      body.src = "img/karada2.png";
      bodyFrame = 2;
    } else {
      body.src = "img/karada1.png";
      bodyFrame = 1;
    }
  }, 180);
}

function stopBodyAnimation() {
  if (bodyTimer) {
    clearInterval(bodyTimer);
    bodyTimer = null;
  }
}

function startGame() {
  field.classList.remove("success");
  field.classList.remove("shake");

  message.textContent = "顔をハメろ！";

  startButton.style.display = "none";
  retryButton.style.display = "none";
  stopButton.style.display = "inline-block";

  const fieldRect = field.getBoundingClientRect();

  headX = fieldRect.width / 2;
  headY = -140;

  fallSpeed = 3.2;
  falling = true;

  head.src = "img/atama1.png";
  body.src = "img/karada1.png";

  head.style.transform = "translateX(-50%)";

  setHeadPosition();
  startBodyAnimation();
  fallLoop();
}

function fallLoop() {
  if (!falling) return;

  headY += fallSpeed;

  // 少し左右に揺れる
  headX += Math.sin(headY / 25) * 1.5;

  // 下まで行きすぎたら上からやり直し
  if (headY > 520) {
    headY = -140;
    message.textContent = "もう一回落ちてくる！";
  }

  const distance = getDistanceFromTarget();

  if (distance < 70) {
    message.textContent = "いまだーー！！";
    fallSpeed = 1.4;
  } else {
    message.textContent = "顔をハメろ！";
    fallSpeed = 3.2;
  }

  setHeadPosition();

  animationId = requestAnimationFrame(fallLoop);
}

function stopHead() {
  if (!falling) return;

  falling = false;
  cancelAnimationFrame(animationId);
  stopBodyAnimation();

  // 押した瞬間に少しズレる運ゲー
  const luck = Math.random();

  if (luck < 0.25) {
    headX += randomRange(-18, 18);
    headY += randomRange(-10, 10);
    message.textContent = "顔がズレた！？";
  } else if (luck < 0.4) {
    head.style.transform = "translateX(-50%) rotate(12deg)";
    message.textContent = "顔が回った！？";
  } else {
    message.textContent = "ピタッ！？";
  }

  setHeadPosition();

  setTimeout(() => {
    judge();
  }, 300);
}

function judge() {
  const distance = getDistanceFromTarget();

  if (distance <= successRange) {
    success();
  } else {
    miss();
  }
}

function success() {
  headX = targetX;
  headY = targetY;

  head.src = "img/atama2.png";
  body.src = "img/karada2.png";

  head.style.left = headX + "px";
  head.style.top = headY + "px";
  head.style.transform = "translateX(-50%)";

  field.classList.add("success");
  message.textContent = "ホームラン！！";

  stopButton.style.display = "none";
  retryButton.style.display = "inline-block";
}

function miss() {
  field.classList.add("shake");
  message.textContent = "おしい！もう一回！";

  stopButton.style.display = "none";
  retryButton.style.display = "inline-block";
}

function getDistanceFromTarget() {
  const dx = headX - targetX;
  const dy = headY - targetY;
  return Math.sqrt(dx * dx + dy * dy);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// 指で顔を動かせる
head.addEventListener("pointerdown", (e) => {
  isDragging = true;
  head.setPointerCapture(e.pointerId);

  const rect = head.getBoundingClientRect();

  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;

  e.preventDefault();
});

head.addEventListener("pointermove", (e) => {
  if (!isDragging || !falling) return;

  const fieldRect = field.getBoundingClientRect();

  headX = e.clientX - fieldRect.left;
  headY = e.clientY - fieldRect.top - dragOffsetY;

  // 動かせる範囲
  if (headX < 60) headX = 60;
  if (headX > fieldRect.width - 60) headX = fieldRect.width - 60;
  if (headY < -80) headY = -80;
  if (headY > 480) headY = 480;

  setHeadPosition();

  e.preventDefault();
});

head.addEventListener("pointerup", () => {
  isDragging = false;
});

head.addEventListener("pointercancel", () => {
  isDragging = false;
});

startButton.addEventListener("click", startGame);
stopButton.addEventListener("click", stopHead);
retryButton.addEventListener("click", startGame);
