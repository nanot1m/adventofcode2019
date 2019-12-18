const assert = require("assert");

function parseMap(str) {
  const map = {};
  let x = 0;
  let y = 0;
  for (let char of str.trim()) {
    if (char === "\n") {
      y++;
      x = 0;
      continue;
    }
    setM(x, y, char, map);
    x++;
  }

  return { map, width: x, height: y + 1 };
}

function drawMap(map, width, height, position = {}) {
  let result = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (isKey(getM(x, y, map))) {
        result += "\x1b[31m";
      }
      if (isDoor(getM(x, y, map))) {
        result += "\x1b[7m";
      }
      if (isWall(getM(x, y, map))) {
        result += "\x1b[44m\x1b[34m";
      }
      if (position.x === x && position.y === y) {
        result += "\x1b[44m\x1b[32m";
      }
      result += getM(x, y, map) + " ";
      result += "\x1b[0m";
    }
    result += "\n";
  }
  console.log(result);
}

function* traverseMap(map) {
  for (let y in map) {
    for (let x in map[y]) {
      yield { val: map[y][x], x: Number(x), y: Number(y) };
    }
  }
}

function setM(x, y, val, map) {
  map[y] = map[y] || {};
  map[y][x] = val;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

function isKey(val) {
  return /[a-z]/.test(val);
}

function isDoor(val) {
  return /[A-Z]/.test(val);
}

function isWall(val) {
  return val === "#";
}

function isEntrance(val) {
  return val === "@";
}

function locateObjectsOnMap(map) {
  const keys = {};
  const doors = {};
  let entrance = null;
  for (const { val, x, y } of traverseMap(map)) {
    if (isKey(val)) {
      keys[val] = { val, x, y };
    }
    if (isDoor(val)) {
      doors[val] = { val, x, y };
    }
    if (isEntrance(val)) {
      entrance = { x, y };
    }
  }
  return { keys, doors, entrance };
}

function solve(input) {
  const { map, width, height } = parseMap(input);
  const { keys, doors, entrance } = locateObjectsOnMap(map);
  map.width = width;
  map.height = height;
  drawMap(map, width, height);
  const result = solutionBFS(entrance, map, keys);
  return Math.min(...result);
}

function solutionBFS(entrance, map, allKeys) {
  const result = [];

  const queue = [[entrance, {}, 0]];

  while (queue.length) {
    const [curPosition, availableKeys, curDistance] = queue.shift();
    // console.clear();
    // console.log(Object.keys(availableKeys).join(", "));
    if (Object.keys(allKeys).length === Object.keys(availableKeys).length) {
      result.push(curDistance);
      continue;
    }

    const accessibleKeys = getAccessibleKeys(curPosition, map, availableKeys);
    for (const [{ x, y, val }, distanceToKey] of accessibleKeys) {
      queue.push([
        { x, y },
        { ...availableKeys, [val]: true },
        distanceToKey + curDistance
      ]);
    }
  }

  return result;
}

function getAccessibleKeys(curPosition, map, availableKeys) {
  const queue = [[curPosition, 0]];
  const visited = {};
  const result = [];
  while (queue.length) {
    const [position, distance] = queue.shift();
    const next = getAllowedPositions(position, map, availableKeys);
    for (const { x, y } of next) {
      if (getM(x, y, visited)) {
        continue;
      }
      setM(x, y, true, visited);
      const valueAtPos = getM(x, y, map);
      if (isKey(valueAtPos) && !availableKeys[valueAtPos]) {
        result.push([{ val: valueAtPos, x, y }, distance + 1]);
      }
      queue.push([{ x, y }, distance + 1]);
    }
  }

  return result;
}

const Deltas = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

function getAllowedPositions(curPosition, map, availableKeys) {
  const result = [];
  const { x, y } = curPosition;
  for (const [dx, dy] of Deltas) {
    const target = getM(x + dx, y + dy, map);
    if (isWall(target)) {
      continue;
    }
    if (isDoor(target) && !availableKeys[target.toLowerCase()]) {
      continue;
    }
    result.push({ x: x + dx, y: y + dy });
  }
  return result;
}

require("./Problem")({
  input() {
    return require("./Input").day(18);
  },
  solve
});

const case1 = `
#########
#b.A.@.a#
#########
`;
// assert.equal(solve(case1), 8);

const case2 = `
########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################
`;
// assert.equal(solve(case2), 86);

const case3 = `
########################
#...............b.C.D.f#
#.######################
#.....@.a.B.c.d.A.e.F.g#
########################
`;
// assert.equal(solve(case3), 132);

const case4 = `
#################
#i.G..c...e..H.p#
########.########
#j.A..b...f..D.o#
########@########
#k.E..a...g..B.n#
########.########
#l.F..d...h..C.m#
#################
`;

assert.equal(solve(case4), 136);

const case5 = `
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################
`;
// assert.equal(solve(case5), 81);
