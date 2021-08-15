const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

/**
 * Utils
 */

let size = {
  w: window.innerWidth,
  h: window.innerHeight,
};

/**
 * Set Canvas to fullscreen size
 */

canvas.width = size.w;
canvas.height = size.h;

/**
 * Colors
 */

const yellowColor = "#FBE94F";
const pinkColor = "#E93383";
const whiteColor = "white";

let backgroundColorTopColor = "#1E122D"; //"#191F28";
let backgroundColorMiddleColor = "#3F2F6A"; //"#3E4A5B";
let backgroundColorBottomColor = "#8F66FF"; //"#838383";

var bckgGradient = ctx.createLinearGradient(0, 0, 0, size.h);
bckgGradient.addColorStop(0.0, backgroundColorTopColor);
bckgGradient.addColorStop(0.4, backgroundColorMiddleColor);
bckgGradient.addColorStop(1.0, backgroundColorBottomColor);

let layer1Color = "#432879"; //"#39444F";
let layer2Color = "#352060"; //"#2E3841";
let layer3Color = "#201339"; //"#27333D";
let groundColor = "#150D26"; //"#181F26";

let starColor = yellowColor;
let ballColor = getRandomStartColor();

/**
 * Position and Sizes references
 */

const initialTriangleTopY = size.h - size.h * 0.2;
const initialTriangleBottomY = size.h * 0.9;
const groundTopY = initialTriangleBottomY;
const initialTriangleStartX = 0;
const initialTriangleEndX = size.w * 1.1;
const offsetX = size.w * 0.05;

const starMaxSize = 3;
const ballMaxSize = 40;
const ballMinSize = 20;

const numberOfStarts = 1000;

/**
 * Fill stars
 */
function getRandomStartColor() {
  return "hsl(54,96%," + Math.floor(Math.random() * 50 + 50) + "%)";
}

let stars = [];
for (let i = 0; i < numberOfStarts; i++) {
  stars.push({
    circle: getRandomCircle(starMaxSize, 0, 0, size.w, size.h * 1.5),
    color: getRandomStartColor(),
    speed: 0.1, //0.2 + Math.random() * 0.8,
  });
}

function getRandomCircle(radius, initX, initY, width, heigth) {
  let x = Math.random() * width + initX;
  let y = Math.random() * heigth + initY;
  const r = (Math.random() * radius) / 2;

  return {
    x: x,
    y: y,
    r: r,
  };
}

/**
 * Respawn Balls
 */

let balls = [];
let maxTimeToRespawnNextBall = 500;
let minTimeToRespawnNextBall = 50;
let timeToRespawnNextBall = 500;

function respawnBall() {
  if (elapsedTime > timeToRespawnNextBall) {
    elapsedTime = 0;
    timeToRespawnNextBall = Math.random() * maxTimeToRespawnNextBall;
    if (timeToRespawnNextBall < minTimeToRespawnNextBall)
      timeToRespawnNextBall = minTimeToRespawnNextBall;

    let ballSize = Math.random() * ballMaxSize;
    if (ballSize < ballMinSize) ballSize = ballMinSize;

    let circle = getRandomCircle(ballSize, 0, -500, size.w, size.h * 0.05);

    let aX = (Math.random() - 0.5) * 10;
    if (Math.abs(aX) < 5) aX = 5 * (aX / Math.abs(aX));

    balls.push({
      circle: circle,
      accelerationX: aX,
      accelerationY: 0,
    });
  }
}

/**
 * Particles
 */

let respawInfo = [];

function repawnParticles() {
  respawInfo.forEach((ball) => {
    const numberOfParticles = Math.floor(Math.random() * 5 + 1);
    for (let i = 0; i < numberOfParticles; i++) {
      let circle = {
        x: ball.circle.x,
        y: ball.circle.y,
        r: ball.circle.r / 2,
      };
      let side = Math.random() * 2 - 1 < 0 ? -1 : 1;
      let rate = Math.random() + 0.3;
      let aX = ball.accelerationX * side * rate;

      balls.push({
        circle: circle,
        accelerationX: aX,
        accelerationY: ball.accelerationY * rate,
      });
    }
  });

  respawInfo = [];
}

/**
 * Basic Physics
 */

let gravity = 1.0; // pixels per second

let restitution = 0.6;
let reductionRate = 0.6;

function updatePhysics() {
  balls.forEach((ball) => {
    ball.circle.y += ball.accelerationY;
    ball.circle.x += ball.accelerationX;

    ball.accelerationY += gravity;
    if (checkGroundCollision(ball)) {
      ballCollisionCallback(ball);
    }
  });
}

function checkGroundCollision(ball) {
  return ball.circle.y > groundTopY - ball.circle.r;
}

function ballCollisionCallback(ball) {
  ball.accelerationY = -ball.accelerationY * restitution;
  ball.circle.y = groundTopY - ball.circle.r;
  ball.circle.r *= reductionRate;
  if (ball.circle.r < 1) {
    balls.splice(balls.indexOf(ball), 1);
  } else {
    respawInfo.push(ball);
  }
}

/**
 * TrackTime
 */

let currentTime = Date.now();
let lastTime = currentTime;
let elapsedTime = 0;
let dt = 0;

function updateTime() {
  currentTime = Date.now();
  dt = currentTime - lastTime;
  elapsedTime += dt;
  lastTime = currentTime;
}

/**
 * Draw functions
 */
function drawBackground() {
  /**
   * Background
   */
  ctx.fillStyle = bckgGradient;
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.fill();

  /**
   * Draw Starts
   */
  drawStarts();

  ctx.shadowBlur = 0;

  /**
   * Layer 1
   */
  ctx.beginPath();
  ctx.moveTo(initialTriangleStartX - offsetX, initialTriangleBottomY);

  ctx.lineTo(
    1 * ((initialTriangleEndX + initialTriangleStartX) / 2) - offsetX,
    size.h - initialTriangleTopY
  );

  ctx.lineTo(
    2 * ((initialTriangleEndX + initialTriangleStartX) / 2) - offsetX,
    initialTriangleBottomY
  );

  ctx.fillStyle = layer1Color;
  ctx.closePath();

  ctx.fill();

  /**
   * Layer 2
   */

  ctx.beginPath();
  ctx.moveTo(initialTriangleStartX - offsetX, initialTriangleBottomY);

  ctx.lineTo(
    1 * ((initialTriangleEndX + initialTriangleStartX) / 4) - offsetX,
    size.h - initialTriangleTopY * 0.8
  );

  ctx.lineTo(
    2 * ((initialTriangleEndX + initialTriangleStartX) / 4) - offsetX,
    initialTriangleBottomY
  );

  ctx.lineTo(
    3 * ((initialTriangleEndX + initialTriangleStartX) / 4) - offsetX,
    size.h - initialTriangleTopY * 0.8
  );

  ctx.lineTo(
    4 * ((initialTriangleEndX + initialTriangleStartX) / 4) - offsetX,
    initialTriangleBottomY
  );

  ctx.fillStyle = layer2Color;
  ctx.closePath();

  ctx.fill();

  /**
   * Layer 3
   */

  ctx.beginPath();
  ctx.moveTo(initialTriangleStartX - offsetX, initialTriangleBottomY);

  ctx.lineTo(
    1 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    size.h - initialTriangleTopY * 0.5
  );

  ctx.lineTo(
    2 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    initialTriangleBottomY
  );

  ctx.lineTo(
    3 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    size.h - initialTriangleTopY * 0.5
  );

  ctx.lineTo(
    4 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    initialTriangleBottomY
  );

  ctx.lineTo(
    5 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    size.h - initialTriangleTopY * 0.5
  );

  ctx.lineTo(
    6 * ((initialTriangleEndX + initialTriangleStartX) / 6) - offsetX,
    initialTriangleBottomY
  );

  ctx.fillStyle = layer3Color;
  ctx.closePath();

  ctx.fill();

  /**
   * Ground
   */

  ctx.fillStyle = groundColor;
  ctx.shadowColor = groundColor;
  ctx.shadowBlur = 40;
  ctx.fillRect(0, groundTopY, size.w, size.h);
}

function drawStarts() {
  stars.forEach((star) => {
    //update star position
    star.circle.y -= star.speed;
    if (star.circle.y < -100) {
      star.circle.y = size.h * 1.5;
    }

    ctx.moveTo(star.circle.x, star.circle.y);
    ctx.beginPath();
    ctx.ellipse(
      star.circle.x,
      star.circle.y,
      star.circle.r,
      star.circle.r,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = star.color;
    ctx.shadowColor = star.color;
    ctx.shadowBlur = 10;
    ctx.fill();
  });
}

function drawBalls() {
  balls.forEach((ball) => {
    ctx.moveTo(ball.circle.x, ball.circle.y);
    ctx.beginPath();
    ctx.ellipse(
      ball.circle.x,
      ball.circle.y,
      ball.circle.r,
      ball.circle.r,
      0,
      0,
      Math.PI * 2
    );
    let color = getRandomStartColor();
    ctx.fillStyle = ballColor;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fill();
  });
}

/**
 * Final Render
 */
function draw() {
  repawnParticles();
  updatePhysics();
  updateTime();

  drawBackground();
  drawBalls();
  respawnBall();

  requestAnimationFrame(draw);
}

draw();
