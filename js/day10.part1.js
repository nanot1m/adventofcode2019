require("./Problem")({
  input() {
    return require("./Input")
      .day(10)
      .split("\n")
      .map(lineStr => lineStr.split(""));
  },
  solve(map) {
    const allAsteroidPositions = getAsteroidsPositions(map);
    const results = allAsteroidPositions.map(p =>
      getAsteroidInLinesOfSight(p, allAsteroidPositions)
    );
    return Math.max(...results);
  }
}).run();

function isAsterod(ch) {
  return ch === "#";
}

function get(x, y, map) {
  return map[y] && map[y][x];
}

function isEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function getAsteroidsPositions(map) {
  let result = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (isAsterod(get(x, y, map))) result.push({ x, y });
    }
  }
  return result;
}

function getAsteroidInLinesOfSight(point, allAsteroidPositions) {
  let hash = {};

  for (let p2 of allAsteroidPositions) {
    if (isEqual(point, p2)) {
      continue;
    }
    const angle = getAngle(point, p2);
    hash[angle] = hash[angle] || [];
    hash[angle].push(p2);
  }

  let result = Object.keys(hash).length;

  return result;
}

function getAngle({ x: x1, y: y1 }, { x: x2, y: y2 }) {
  var angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI + 90;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}
