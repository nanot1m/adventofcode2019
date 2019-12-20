import { prepareCanvas } from "./prepareCanvas.js";
import { roundRect } from "./roundRect.js";

function parseMap(str) {
  const portalPositions = [];

  let map = {};

  let x = 0;
  let y = 0;
  for (let char of str) {
    if (char === "\n") {
      y++;
      x = 0;
    } else {
      if (isPortal(char)) {
        portalPositions.push([x, y]);
      }
      setM(x, y, char, map);
      x++;
    }
  }

  const { bottomRight, topLeft } = getCorners(map);

  const portalList = [];
  let entrance;
  let target;

  const outerPortals = {};
  const innerPortals = {};

  for (let [x, y] of portalPositions) {
    const portal = tryCreatePortal(x, y, map);
    if (portal) {
      if (portal.name === "AA") {
        entrance = portal.exit;
      }
      if (portal.name === "ZZ") {
        target = portal.exit;
      }
      if (
        portal.exit.x === bottomRight.x ||
        portal.exit.y === bottomRight.y ||
        portal.exit.x === topLeft.x ||
        portal.exit.y === topLeft.y
      ) {
        setM(x, y, true, outerPortals);
      } else {
        setM(x, y, true, innerPortals);
      }
      portalList.push([portal, { x, y }]);
    }
  }

  const portals = {};
  portalList.forEach(pairA => {
    const [, posA] = pairA;
    const result = portalList.find(
      pairB => pairA !== pairB && pairA[0].name === pairB[0].name
    );
    if (result) {
      const [portalB] = result;
      setM(posA.x, posA.y, portalB.exit, portals);
    }
  });

  return { map, portals, entrance, target, outerPortals, innerPortals };
}

function setM(x, y, value, map) {
  map[y] = map[y] || {};
  map[y][x] = value;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

function* traverseMap(map) {
  for (let y in map) {
    for (let x in map[y]) {
      yield { val: map[y][x], x: Number(x), y: Number(y) };
    }
  }
}

function getCorners(map) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = 0;
  let maxY = 0;
  for (const { x, y, val } of traverseMap(map)) {
    if (val === MapObjects.Wall) {
      minX = Math.min(x, minX);
      maxX = Math.max(x, maxX);
      minY = Math.min(y, minY);
      maxY = Math.max(y, maxY);
    }
  }
  return {
    topLeft: { x: minX, y: minY },
    bottomRight: { x: maxX, y: maxY }
  };
}

function tryCreatePortal(x, y, map) {
  const center = getM(x, y, map);
  const top = getM(x, y - 1, map);
  const right = getM(x + 1, y, map);
  const bottom = getM(x, y + 1, map);
  const left = getM(x - 1, y, map);

  if (!isPortal(center)) {
    return null;
  }

  if (isPortal(top) && bottom === MapObjects.Passage) {
    return {
      name: top + center,
      exit: { x, y: y + 1 }
    };
  }

  if (isPortal(left) && right === MapObjects.Passage) {
    return {
      name: left + center,
      exit: { x: x + 1, y }
    };
  }

  if (isPortal(right) && left === MapObjects.Passage) {
    return {
      name: center + right,
      exit: { x: x - 1, y }
    };
  }

  if (isPortal(bottom) && top === MapObjects.Passage) {
    return {
      name: center + bottom,
      exit: { x, y: y - 1 }
    };
  }

  return null;
}

const MapObjects = {
  Wall: "#",
  Passage: ".",
  Empty: " "
};

const isPortal = val => /[A-Z]/.test(val);

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 § @param {number} y 
 * @param {number} scale 
 */
function drawWall(ctx, x, y, scale) {
  ctx.fillStyle = "white";
  const padding = 0;
  roundRect(
    ctx,
    x * scale + padding,
    y * scale + padding,
    scale - 2 * padding,
    scale - 2 * padding,
    0,
    true
  );
}
/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 § @param {number} y 
 * @param {number} scale 
 */
function drawPassage(ctx, x, y, scale) {
  ctx.fillStyle = "#333333";
  const padding = 1;

  roundRect(
    ctx,
    x * scale + padding,
    y * scale + padding,
    scale - 2 * padding,
    scale - 2 * padding,
    4,
    true
  );
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 § @param {number} y 
 * @param {number} scale 
 */
function drawPortal(ctx, x, y, scale, val, disabled) {
  if (disabled) {
    ctx.fillStyle = "gray";
  } else {
    ctx.fillStyle = "brown";
  }
  roundRect(ctx, x * scale + 1, y * scale + 1, scale - 2, scale - 2, 2, true);
  ctx.fillStyle = "white";
  ctx.font = scale / 1.2 + "px sans-serif";
  ctx.fillText(val, x * scale + 0.2 * scale, y * scale + scale / 1.3);
}

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} x 
 § @param {number} y 
 * @param {number} scale 
 */
function drawPlayer(ctx, x, y, scale) {
  ctx.fillStyle = "red";
  roundRect(ctx, x * scale, y * scale, scale, scale, scale / 4, true);
}

function drawMap(
  canvas,
  map,
  curPos,
  scale,
  screen,
  { entrance, target, outerPortals, level }
) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const minX = curPos.x - Math.floor(screen.width / 2);
  const minY = curPos.y - Math.floor(screen.height / 2);
  const maxX = minX + screen.width;
  const maxY = minY + screen.height;

  for (const { x: x0, y: y0, val } of traverseMap(map)) {
    if (maxX < x0 || x0 < minX || maxY < y0 || y0 < minY) {
      continue;
    }
    const x = x0 - minX;
    const y = y0 - minY;
    if (val === MapObjects.Wall) {
      drawWall(ctx, x, y, scale);
    }
    if (val === MapObjects.Passage) {
      drawPassage(ctx, x, y, scale);
    }
    if (isPortal(val)) {
      let disabled = false;
      if (getM(x0, y0, outerPortals) && level === 0) {
        disabled = true;
      }
      if (val === "Z") {
        disabled = level !== 0;
      }
      drawPortal(ctx, x, y, scale, val, disabled);
    }
    if (x0 === curPos.x && y0 === curPos.y) {
      drawPlayer(ctx, x, y, scale);
    }
  }
}

function main() {
  const canvas = document.querySelector("canvas");
  const levelNode = document.getElementById("level-value");
  const scoreNode = document.getElementById("score-value");
  const loadMapBtn = document.getElementById("load-map");

  let { map, portals, entrance, target, outerPortals } = parseMap(initData);

  const screen = {
    width: 25,
    height: 25
  };

  let scale = 50;
  function prepare() {
    const availableWidth = window.innerWidth - 32;
    scale = Math.min(50, (availableWidth / screen.width) * devicePixelRatio);
    prepareCanvas(screen.width, screen.height, scale, canvas);
  }
  prepare();

  window.addEventListener("resize", prepare);

  const curPos = { ...entrance };
  let level = 0;
  let score = 0;

  loadMapBtn.addEventListener("click", () => {
    const newData = prompt("Insert your map here");
    setData(newData);
  });

  function setData(newData) {
    if (newData.trim().length) {
      const next = parseMap(newData);
      map = next.map;
      portals = next.portals;
      entrance = next.entrance;
      target = next.target;
      outerPortals = next.outerPortals;
      curPos.x = entrance.x;
      curPos.y = entrance.y;
      score = 0;
      level = 0;
    }
  }

  let lastCurPos = { ...curPos };
  function draw(force = false) {
    if (!force && (lastCurPos.x === curPos.x || lastCurPos.y === curPos.y)) {
      return;
    }
    lastCurPos.x = curPos.x;
    lastCurPos.y = curPos.y;
    drawMap(canvas, map, curPos, scale, screen, {
      entrance,
      target,
      outerPortals,
      level
    });
    levelNode.innerText = level;
    scoreNode.innerText = score;
    requestAnimationFrame(draw);
  }

  draw(true);

  function isPossibleMove({ dx, dy }) {
    const x = curPos.x + dx;
    const y = curPos.y + dy;
    const val = getM(x, y, map);
    if (val === MapObjects.Passage) {
      return true;
    }
    if (isPortal(val)) {
      if (getM(x, y, outerPortals)) {
        return level > 0;
      }
      if (val === "Z") {
        return level === 0;
      }
      return true;
    }
    return false;
  }

  function move(dx, dy) {
    if (!isPossibleMove({ dx, dy })) {
      return;
    }
    curPos.x += dx;
    curPos.y += dy;
    if (isPortal(getM(curPos.x, curPos.y, map))) {
      teleportFrom(curPos.x, curPos.y);
    }
    score++;

    if (curPos.x === target.x && curPos.y === target.y && level === 0) {
      alert("YOU WIN! SCORE: " + score);
    }
  }

  function teleportFrom(x, y) {
    if (getM(x, y, outerPortals)) {
      level--;
    } else {
      level++;
    }
    const target = getM(x, y, portals);
    curPos.x = target.x;
    curPos.y = target.y;
  }

  document.addEventListener("keydown", ev => {
    const keyIsArrow = [
      "ArrowDown",
      "ArrowRight",
      "ArrowLeft",
      "ArrowUp"
    ].includes(ev.key);

    if (keyIsArrow) {
      ev.preventDefault();
      switch (ev.key) {
        case "ArrowDown":
          move(0, 1);
          break;
        case "ArrowRight":
          move(1, 0);
          break;
        case "ArrowLeft":
          move(-1, 0);
          break;
        case "ArrowUp":
          move(0, -1);
          break;
      }
    }
  });

  document.querySelector(".game-controls").addEventListener("click", ev => {
    if (!(ev.target instanceof HTMLButtonElement)) {
      return;
    }
    const direction = ev.target.dataset.direction;
    switch (direction) {
      case "down":
        move(0, 1);
        break;
      case "right":
        move(1, 0);
        break;
      case "left":
        move(-1, 0);
        break;
      case "up":
        move(0, -1);
        break;
    }
  });
}

main();
