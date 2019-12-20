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

const Deltas = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

function getAllKeyDistancesAndDoors(entrance, keys, map) {
  const result = {
    "@": getDistancesAndDoors(entrance, map)
  };

  for (const key of Object.values(keys)) {
    result[key.val] = getDistancesAndDoors(key, map);
  }

  return result;
}

function getDistancesAndDoors(key, map) {
  const result = {};

  const queue = [[key, [], 0]];
  const visited = { [key.y]: { [key.x]: true } };
  while (queue.length) {
    const [pos, doors, distance] = queue.shift();

    for (const [dx, dy] of Deltas) {
      const x = pos.x + dx;
      const y = pos.y + dy;
      if (getM(x, y, visited)) {
        continue;
      }
      setM(x, y, true, visited);
      const val = getM(x, y, map);
      let nextDoors = doors;
      if (isWall(val)) {
        continue;
      }
      if (isDoor(val)) {
        nextDoors = doors.concat(val);
      }
      if (isKey(val)) {
        result[val] = { distance: distance + 1, key: val, doors };
      }
      queue.push([{ x, y }, nextDoors, distance + 1]);
    }
  }

  return result;
}

function getAccessibleKeys(val, allDistancesAndDoors, availableKeys) {
  const distancesAndDoors = allDistancesAndDoors[val];

  const result = {};

  outer: for (const key in distancesAndDoors) {
    const { doors, distance } = distancesAndDoors[key];
    if (availableKeys[key]) {
      continue;
    }
    for (let i = 0; i < doors.length; i++) {
      if (!availableKeys[doors[i].toLowerCase()]) {
        continue outer;
      }
    }
    result[key] = distance;
  }

  return result;
}

function bfs(allDistancesAndDoors) {
  let result = Infinity;
  const queue = [["@", 0, {}]];

  const allKeysCount = Object.keys(allDistancesAndDoors).length - 1;

  while (queue.length) {
    const [val, distance, availableKeys] = queue.shift();
    if (Object.keys(availableKeys).length === allKeysCount) {
      result = Math.min(result, distance);
      continue;
    }

    const accessibleKeys = getAccessibleKeys(
      val,
      allDistancesAndDoors,
      availableKeys
    );

    for (let key in accessibleKeys) {
      queue.push([
        key,
        distance + accessibleKeys[key],
        { ...availableKeys, [key]: true }
      ]);
    }
  }

  return result;
}

function dfs(allDistancesAndDoors) {
  const getKey = (key, availableKeys) =>
    key +
    "-" +
    Object.keys(availableKeys)
      .sort()
      .join();

  const allKeysCount = Object.keys(allDistancesAndDoors).length - 1;
  const cache = {};
  function rec(key, availableKeys) {
    const cacheKey = getKey(key, availableKeys);
    if (cache[key]) {
      return cache[key];
    }

    if (Object.keys(availableKeys).length === allKeysCount) {
      cache[cacheKey] = 0;
      return 0;
    }

    let min = Infinity;

    const keys = getAccessibleKeys(key, allDistancesAndDoors, availableKeys);

    for (let key2 in keys) {
      availableKeys[key2] = true;
      const curRes = keys[key2] + rec(key2, availableKeys);
      min = Math.min(curRes, min);
      delete availableKeys[key2];
    }
    cache[cacheKey] = min;
    return min;
  }

  return rec("@", {});
}

function solve(input) {
  const { map, width, height } = parseMap(input);
  const { keys, doors, entrance } = locateObjectsOnMap(map);

  const distancesAndDoors = getAllKeyDistancesAndDoors(entrance, keys, map);

  drawMap(map, width, height);
  // return bfs(distancesAndDoors);
  return dfs(distancesAndDoors);
}

require("./Problem")({
  input() {
    return require("./Input").day(18);
  },
  solve
}).run();

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
// assert.equal(solve(case4), 136);

const case5 = `
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################
`;
// assert.equal(solve(case5), 81);
