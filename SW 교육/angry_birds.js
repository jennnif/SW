// Matter.js 모듈
const { Engine, Render, Runner, World, Bodies, Body, Constraint, Mouse, MouseConstraint, Events } = Matter;

const width = 1200, height = 400;
const engine = Engine.create();
const world = engine.world;

// 캔버스 렌더러
const render = Render.create({
  element: document.body,
  canvas: document.getElementById('gameCanvas'),
  engine: engine,
  options: {
    width,
    height,
    wireframes: false,
    background: 'transparent',
  }
});
Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// 바닥
const ground = Bodies.rectangle(width/2, height-10, width, 20, { isStatic: true, render: { fillStyle: '#7cfc00' } });
World.add(world, ground);

// 나무 구조물(블록) 추가 (좌표를 오른쪽으로 이동)
const woodBlocks = [
  Bodies.rectangle(1000, height-30, 60, 20, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1060, height-30, 60, 20, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1000, height-70, 20, 60, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1060, height-70, 20, 60, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1030, height-100, 60, 20, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1030, height-140, 20, 60, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' }),
  Bodies.rectangle(1030, height-170, 60, 20, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'wood' })
];
woodBlocks.forEach(b => World.add(world, b));

// 얼음(파란색) 블록 추가
const iceBlocks = [
  Bodies.rectangle(1030, height-200, 60, 20, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'ice' }),
  Bodies.rectangle(1000, height-100, 20, 60, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'ice' }),
  Bodies.rectangle(1060, height-100, 20, 60, { isStatic: false, render: { fillStyle: 'rgba(0,0,0,0)' }, label: 'ice' })
];
iceBlocks.forEach(b => World.add(world, b));

// 돼지 여러 마리 추가 (나무/얼음 사이에 배치)
const pigs = [
  Bodies.circle(1030, height-50, 20, {
    isStatic: false,
    restitution: 0.6,
    label: 'pig',
    render: { fillStyle: 'rgba(0,0,0,0)' }
  }),
  Bodies.circle(1000, height-120, 16, {
    isStatic: false,
    restitution: 0.6,
    label: 'pig',
    render: { fillStyle: 'rgba(0,0,0,0)' }
  }),
  Bodies.circle(1060, height-120, 16, {
    isStatic: false,
    restitution: 0.6,
    label: 'pig',
    render: { fillStyle: 'rgba(0,0,0,0)' }
  })
];
pigs.forEach(p => World.add(world, p));

// 새(투사체)
const bird = Bodies.circle(150, height-60, 18, {
  density: 0.004,
  restitution: 0.7,
  render: { fillStyle: '#e74c3c' }
});
World.add(world, bird);

// 새총(슬링샷)
const slingshotAnchor = { x: 120, y: height-80 };
let slingshot = Constraint.create({
  pointA: slingshotAnchor,
  bodyB: bird,
  stiffness: 0.05,
  render: {
    strokeStyle: '#444',
    lineWidth: 4
  }
});
World.add(world, slingshot);

// 마우스 드래그
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.1,
    render: { visible: false }
  },
  collisionFilter: { mask: 0x0001 }
});
World.add(world, mouseConstraint);
render.mouse = mouse;

// 새를 드래그할 때만 슬링샷 작동
Events.on(mouseConstraint, 'startdrag', function(event) {
  if (event.body === bird) {
    slingshot.bodyB = bird;
  }
});

// 마우스에서 손을 떼면 새 발사
Events.on(mouseConstraint, 'enddrag', function(event) {
  if (event.body === bird) {
    setTimeout(() => {
      slingshot.bodyB = null;
    }, 100);
  }
});

// 새가 화면 밖으로 나가면 리셋
function resetBird() {
  Body.setPosition(bird, { x: 150, y: height-60 });
  Body.setVelocity(bird, { x: 0, y: 0 });
  Body.setAngularVelocity(bird, 0);
  slingshot.bodyB = bird;
}

Events.on(engine, 'afterUpdate', function() {
  if (bird.position.y > height + 50 || bird.position.x > width + 50 || bird.position.x < -50) {
    resetBird();
  }
});

Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: width, y: height } });

// 점수 및 클리어 메시지
let score = 0;
let cleared = false;
let started = false;
const overlay = document.getElementById('overlay');
function updateOverlay() {
  if (!started) {
    overlay.style.display = 'none';
    return;
  }
  if (cleared) {
    overlay.innerHTML = `🎉 클리어!<br>점수: ${score}`;
    overlay.style.display = 'flex';
  } else {
    overlay.innerHTML = `점수: ${score}`;
    overlay.style.display = 'block';
  }
}
updateOverlay();
overlay.style.display = 'none'; // 시작 시 점수판 숨김

// 게임 시작 감지 (처음 새를 드래그하면 started=true)
Events.on(mouseConstraint, 'startdrag', function(event) {
  if (event.body === bird && !started) {
    started = true;
    updateOverlay();
  }
  if (event.body === bird) {
    slingshot.bodyB = bird;
  }
});

// 배경, 구조물, 새, 돼지 등 그리기
Events.on(render, 'afterRender', function() {
  const ctx = render.context;
  // 배경
  drawBackground(ctx);
  // 나무 구조물(산 앞에)
  woodBlocks.forEach(b => drawWoodBlock(ctx, b));
  // 얼음 블록(산 앞에)
  iceBlocks.forEach(b => drawIceBlock(ctx, b));
  // Y자 나무 새총
  drawSlingshot(ctx);
  // 고무줄(밴드)
  drawSlingshotBand(ctx);
  // 기존 새(빨간 원) 가리기
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(bird.position.x, bird.position.y, 18+2, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
  // 새 얼굴 그리기
  drawAngryBirdFace(ctx, bird.position.x, bird.position.y, 18);
  // 돼지 얼굴 그리기
  pigs.forEach(p => {
    if (!p.isSleeping && !p.isRemoved) {
      drawPigFace(ctx, p.position.x, p.position.y, p.circleRadius);
    }
  });
});

// 배경 그리기 (afterRender에서 제일 먼저)
function drawBackground(ctx) {
  // 하늘
  ctx.save();
  ctx.fillStyle = '#b3e0ff';
  ctx.fillRect(0, 0, width, height);
  // 구름
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(120, 80, 40, 0, Math.PI*2); ctx.arc(170, 80, 30, 0, Math.PI*2); ctx.arc(150, 100, 35, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(600, 60, 35, 0, Math.PI*2); ctx.arc(640, 70, 25, 0, Math.PI*2); ctx.arc(620, 90, 30, 0, Math.PI*2); ctx.fill();
  ctx.globalAlpha = 1;
  // 산
  ctx.fillStyle = '#6a8d3a';
  ctx.beginPath(); ctx.moveTo(0, height-80); ctx.lineTo(120, height-180); ctx.lineTo(300, height-80); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(200, height-60); ctx.lineTo(400, height-200); ctx.lineTo(600, height-60); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(500, height-100); ctx.lineTo(700, height-220); ctx.lineTo(800, height-100); ctx.closePath(); ctx.fill();
  // 풀
  ctx.fillStyle = '#8ee000';
  ctx.fillRect(0, height-40, width, 40);
  ctx.restore();
}

// Y자 나무 새총 그리기
function drawSlingshot(ctx) {
  ctx.save();
  ctx.lineCap = 'round';
  // 나무 몸통
  ctx.strokeStyle = '#a0522d';
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(120, height-40); // 오른쪽 다리
  ctx.lineTo(120, height-120);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(100, height-40); // 왼쪽 다리
  ctx.lineTo(120, height-100);
  ctx.stroke();
  // Y자 윗부분
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(120, height-120);
  ctx.lineTo(110, height-140);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(120, height-120);
  ctx.lineTo(130, height-140);
  ctx.stroke();
  ctx.restore();
}

// 고무줄(밴드) 그리기
function drawSlingshotBand(ctx) {
  if (slingshot.bodyB) {
    ctx.save();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(110, height-130); // 왼쪽 Y자
    ctx.lineTo(bird.position.x, bird.position.y);
    ctx.lineTo(130, height-130); // 오른쪽 Y자
    ctx.stroke();
    ctx.restore();
  }
}

// 돼지가 충격을 받으면 제거 + 점수
Events.on(engine, 'collisionStart', function(event) {
  event.pairs.forEach(pair => {
    let pig = null;
    if (pair.bodyA.label === 'pig') pig = pair.bodyA;
    if (pair.bodyB.label === 'pig') pig = pair.bodyB;
    if (pig && !pig.isRemoved) {
      // 충격이 충분히 크면 제거
      const impact = pair.collision.depth;
      if (impact > 0.5) {
        World.remove(world, pig);
        pig.isRemoved = true;
        score += 1000;
        updateOverlay();
      }
    }
  });
  // 클리어 체크 (모든 돼지와 나무, 얼음 블록이 사라졌을 때)
  if (
    pigs.every(p => p.isRemoved) &&
    woodBlocks.every(b => b.isSleeping || b.position.y > height+40) &&
    iceBlocks.every(b => b.isSleeping || b.position.y > height+40)
  ) {
    cleared = true;
    overlay.style.display = 'flex';
    updateOverlay();
  }
}); 

// 나무 블록 직접 그리기
function drawWoodBlock(ctx, block) {
  ctx.save();
  ctx.translate(block.position.x, block.position.y);
  ctx.rotate(block.angle);
  let w = block.bounds.max.x - block.bounds.min.x;
  let h = block.bounds.max.y - block.bounds.min.y;
  ctx.fillStyle = '#e67e22';
  ctx.strokeStyle = '#b3541a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(-w/2, -h/2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 얼음 블록 직접 그리기
function drawIceBlock(ctx, block) {
  ctx.save();
  ctx.translate(block.position.x, block.position.y);
  ctx.rotate(block.angle);
  let w = block.bounds.max.x - block.bounds.min.x;
  let h = block.bounds.max.y - block.bounds.min.y;
  ctx.fillStyle = 'rgba(120,200,255,0.85)';
  ctx.strokeStyle = '#b3e0ff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.rect(-w/2, -h/2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 앵그리버드 얼굴 그리기
function drawAngryBirdFace(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r/50, r/50);
  // 몸통(빨간 원)
  ctx.beginPath();
  ctx.arc(0, 0, 50, 0, Math.PI*2);
  ctx.fillStyle = '#e74c3c';
  ctx.fill();
  ctx.closePath();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#000';
  ctx.stroke();
  // 꼬리
  ctx.save();
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.moveTo(-60, 10); ctx.lineTo(-80, 0); ctx.lineTo(-60, -10);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#111';
  ctx.stroke();
  ctx.restore();
  // 머리 깃털
  ctx.save();
  ctx.rotate(-0.1);
  ctx.beginPath();
  ctx.arc(0, -55, 10, Math.PI*0.7, Math.PI*2.3);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#c0392b';
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.rotate(0.2);
  ctx.beginPath();
  ctx.arc(15, -50, 7, Math.PI*0.7, Math.PI*2.3);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#c0392b';
  ctx.stroke();
  ctx.restore();
  // 눈(흰자)
  ctx.beginPath();
  ctx.ellipse(-18, -10, 15, 18, 0, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
  ctx.beginPath();
  ctx.ellipse(10, -12, 13, 15, 0, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
  // 눈(검은자)
  ctx.beginPath();
  ctx.arc(-13, -7, 4, 0, Math.PI*2);
  ctx.fillStyle = '#111'; ctx.fill(); ctx.closePath();
  ctx.beginPath();
  ctx.arc(13, -9, 3, 0, Math.PI*2);
  ctx.fillStyle = '#111'; ctx.fill(); ctx.closePath();
  // 눈썹
  ctx.save();
  ctx.rotate(-0.1);
  ctx.beginPath();
  ctx.moveTo(-30, -25); ctx.lineTo(-5, -20);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.rotate(0.1);
  ctx.beginPath();
  ctx.moveTo(5, -22); ctx.lineTo(28, -30);
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#111'; ctx.stroke();
  ctx.restore();
  // 부리(윗부분)
  ctx.beginPath();
  ctx.moveTo(0, 0); ctx.lineTo(35, 10); ctx.lineTo(10, 18);
  ctx.closePath();
  ctx.fillStyle = '#f9d423'; ctx.fill(); ctx.stroke();
  // 부리(아랫부분)
  ctx.beginPath();
  ctx.moveTo(10, 18); ctx.lineTo(35, 22); ctx.lineTo(0, 12);
  ctx.closePath();
  ctx.fillStyle = '#f39c12'; ctx.fill(); ctx.stroke();
  ctx.restore();
}

// 돼지 얼굴 그리기
function drawPigFace(ctx, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(r/20, r/20);
  // 몸통
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI*2);
  ctx.fillStyle = '#a3e048'; ctx.fill(); ctx.closePath();
  ctx.lineWidth = 3; ctx.strokeStyle = '#4e9a06'; ctx.stroke();
  // 귀
  ctx.beginPath(); ctx.ellipse(-12, -15, 5, 8, -0.3, 0, Math.PI*2);
  ctx.ellipse(12, -15, 5, 8, 0.3, 0, Math.PI*2);
  ctx.fillStyle = '#a3e048'; ctx.fill(); ctx.stroke();
  // 콧구멍
  ctx.beginPath(); ctx.ellipse(-5, 5, 2, 3, 0, 0, Math.PI*2);
  ctx.ellipse(5, 5, 2, 3, 0, 0, Math.PI*2);
  ctx.fillStyle = '#4e9a06'; ctx.fill();
  // 코
  ctx.beginPath(); ctx.ellipse(0, 5, 8, 6, 0, 0, Math.PI*2);
  ctx.fillStyle = '#b6e97d'; ctx.fill(); ctx.stroke();
  // 눈
  ctx.beginPath(); ctx.arc(-7, -5, 3, 0, Math.PI*2);
  ctx.arc(7, -5, 3, 0, Math.PI*2);
  ctx.fillStyle = '#fff'; ctx.fill(); ctx.closePath();
  ctx.beginPath(); ctx.arc(-7, -5, 1, 0, Math.PI*2);
  ctx.arc(7, -5, 1, 0, Math.PI*2);
  ctx.fillStyle = '#222'; ctx.fill(); ctx.closePath();
  ctx.restore();
} 