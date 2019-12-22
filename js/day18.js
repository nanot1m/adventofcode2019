const assert = require("assert");

function createBitMap() {
  const map = {};
  const charCodeFor_a = "a".charCodeAt(0);
  const charCodeFor_z = "z".charCodeAt(0);
  for (let i = 0; i <= charCodeFor_z - charCodeFor_a; i++) {
    map[String.fromCharCode(i + charCodeFor_a)] = Math.pow(2, i);
  }
  return map;
}

const BIT_MAP = createBitMap();

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
      result += getM(x, y, map) + "";
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
  let entrances = [];
  let idx = 0;
  for (const { val, x, y } of traverseMap(map)) {
    if (isKey(val)) {
      keys[val] = { val, x, y };
    }
    if (isDoor(val)) {
      doors[val] = { val, x, y };
    }
    if (isEntrance(val)) {
      entrances.push({ val: val + idx++, x, y });
    }
  }
  return { keys, doors, entrances };
}

const Deltas = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];

function getPositions(entrances, keys, map) {
  const result = {};
  const objects = entrances.concat(Object.values(keys));
  for (const obj of objects) {
    result[obj.val] = getPositionsForKey(obj, map);
  }
  return result;
}

function getPositionsForKey(key, map) {
  const result = {};

  const queue = [[key, 0, 0, 0]];
  const visited = { [key.y]: { [key.x]: true } };
  while (queue.length) {
    const [pos, doors, distance, keys] = queue.shift();

    for (const [dx, dy] of Deltas) {
      const x = pos.x + dx;
      const y = pos.y + dy;

      if (getM(x, y, visited)) continue;
      setM(x, y, true, visited);

      const val = getM(x, y, map);
      let nKeys = keys;
      let nDoors = doors;
      let nDistance = distance + 1;
      if (isWall(val)) continue;
      if (isDoor(val)) nDoors |= BIT_MAP[val.toLowerCase()];
      if (isKey(val)) {
        nKeys |= BIT_MAP[val];
        result[val] = { distance: nDistance, key: val, doors, keys: nKeys };
      }

      queue.push([{ x, y }, nDoors, nDistance, nKeys]);
    }
  }

  return result;
}

function getAccessibleKeys(val, positions, keys) {
  const positionsForVal = positions[val];
  const result = {};
  for (const key in positionsForVal) {
    const { doors, distance, keys: tKeys } = positionsForVal[key];
    if ((keys & BIT_MAP[key]) !== 0) continue;
    if (doors && (keys & doors) !== doors) continue;
    result[key] = [distance, tKeys];
  }
  return result;
}

function getAllKeysB(positions) {
  return Object.keys(positions)
    .filter(x => !x.startsWith("@"))
    .reduce((acc, x) => acc | BIT_MAP[x], 0);
}

function toArray(flags) {
  const result = [];
  let i = 1;
  while (i <= flags) {
    if ((flags & i) !== 0) {
      result.push(i);
    }
    i <<= 1;
  }
  return result.map(x => Object.entries(BIT_MAP).find(([a, b]) => b === x)[0]);
}

function bfs(positions, entrances) {
  let result = Infinity;
  const queue = entrances.map(key => [key, 0, 0]);

  const allKeys = getAllKeysB(positions);

  while (queue.length) {
    const [val, distance, keys] = queue.shift();

    if (keys === allKeys) {
      result = Math.min(result, distance);
      continue;
    }

    const accessibleKeys = getAccessibleKeys(val, positions, keys);

    for (let key in accessibleKeys) {
      const nDistance = distance + accessibleKeys[key][0];
      const nKeys = keys | accessibleKeys[key][1];
      queue.push([key, nDistance, nKeys]);
    }
  }

  return result;
}

function dfs(positions, allKeys, currents, distance = 0, keys = 0, memo = {}) {
  if (keys === allKeys) {
    return distance;
  }

  const mKey = distance + currents.join("") + keys;
  if (memo[mKey] != null) {
    return memo[mKey];
  }

  const results = [];
  for (let i = 0; i < currents.length; i++) {
    const current = currents[i];
    const accessibleKeys = getAccessibleKeys(current, positions, keys);
    for (let key in accessibleKeys) {
      const nDistance = distance + accessibleKeys[key][0];
      const nKeys = keys | accessibleKeys[key][1];
      const nCurrents = currents.slice();
      nCurrents[i] = key;
      results.push(dfs(positions, allKeys, nCurrents, nDistance, nKeys, memo));
    }
  }

  let result = Math.min(...results);
  memo[mKey] = result;
  return result;
}

function part1(input) {
  const { map, width, height } = parseMap(input);
  const { keys, entrances } = locateObjectsOnMap(map);

  const positions = getPositions(entrances, keys, map);

  // drawMap(map, width, height);
  return dfs(
    positions,
    getAllKeysB(positions),
    entrances.map(x => x.val)
  );
}

function modifyMap(map) {
  const center = { x: 0, y: 0 };
  for (const { x, y, val } of traverseMap(map)) {
    if (isEntrance(val)) {
      center.x = x;
      center.y = y;
      break;
    }
  }
  // prettier-ignore
  [
    [-1, -1, '@'], [0, -1, '#'], [1, -1, '@'],
    [-1,  0, '#'], [0,  0, '#'], [1,  0, '#'],
    [-1,  1, '@'], [0,  1, '#'], [1,  1, '@'],
  ].forEach(([dx, dy, val]) => {
    setM(center.x + dx, center.y + dy, val, map)
  })
}

function part2(input) {
  const { map, width, height } = parseMap(input);
  modifyMap(map);
  const { keys, entrances } = locateObjectsOnMap(map);

  const positions = getPositions(entrances, keys, map);
  // drawMap(map, width, height);
  return dfs(
    positions,
    getAllKeysB(positions),
    entrances.map(x => x.val)
  );
}

require("./Problem")({
  input() {
    return require("./Input").day(18);
  },
  solve(input) {
    return {
      "Part 1": part1(input),
      "Part 2": part2(input)
    };
  }
}).run();

const case1 = `
#########
#b.A.@.a#
#########
`;
// assert.equal(part1(case1), 8);

const case2 = `
########################
#f.D.E.e.C.b.A.@.a.B.c.#
######################.#
#d.....................#
########################
`;
// assert.equal(part1(case2), 86);

const case3 = `
########################
#...............b.C.D.f#
#.######################
#.....@.a.B.c.d.A.e.F.g#
########################
`;
// assert.equal(part1(case3), 132);

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
// assert.equal(part1(case4), 136);

const case5 = `
########################
#@..............ac.GI.b#
###d#e#f################
###A#B#C################
###g#h#i################
########################
`;
// assert.equal(part1(case5), 81);
