require("./Problem")({
  input() {
    return require("./Input").day(24);
  },
  async solve(input) {
    return {
      "Part 1": await part1(input),
      "Part 2": part2(input)
    };
  }
}).run();

function setM(x, y, value, map) {
  map[y] = map[y] || {};
  map[y][x] = value;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

const MapObjects = {
  Bug: "#",
  Space: "."
};

function* traverseMap(map) {
  for (let y in map) {
    for (let x in map[y]) {
      yield { val: map[y][x], x: Number(x), y: Number(y) };
    }
  }
}

function parseMap(input) {
  const map = {};
  let x = 0;
  let y = 0;
  for (let ch of input.trim()) {
    if (ch === "\n") {
      x = 0;
      y++;
      continue;
    }
    setM(x, y, ch, map);
    x++;
  }
  let width = x;
  let height = y + 1;

  return { width, height, map };
}

async function part1(input) {
  let { map, width, height } = parseMap(input);

  const cache = {};
  while (true) {
    const hash = getMapHash(map, width);
    if (cache[hash]) {
      return hash;
    }
    cache[hash] = true;
    map = iterateGeneration(map);
  }
}

function getMapHash(map, width) {
  let result = 0;
  for (const { x, y, val } of traverseMap(map)) {
    if (val === MapObjects.Bug) {
      result += Math.pow(2, x + y * width);
    }
  }
  return result;
}

function drawMap(map, width, height) {
  let result = "";
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      result += getM(x, y, map) + " ";
    }
    result += "\n";
  }
  console.log(result);
}

function iterateGeneration(map) {
  const nextMap = {};
  for (const { x, y } of traverseMap(map)) {
    setM(x, y, getCellNextState(x, y, map), nextMap);
  }
  return nextMap;
}
const Deltas = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0]
];
function getCellNextState(x, y, map) {
  let aliveCount = 0;

  for (const [dx, dy] of Deltas) {
    if (getM(x + dx, y + dy, map) === MapObjects.Bug) {
      aliveCount++;
    }
  }

  const cur = getM(x, y, map);

  if (cur === MapObjects.Bug) {
    if (aliveCount !== 1) {
      return MapObjects.Space;
    }
  }

  if (cur === MapObjects.Space) {
    if (aliveCount === 1 || aliveCount === 2) {
      return MapObjects.Bug;
    }
  }

  return cur;
}

function part2(input) {
  let { map, width, height } = parseMap(input);
  const grid = new RecursiveGrid(width, height);

  for (let { x, y, val } of traverseMap(map)) {
    if (val === MapObjects.Bug) {
      grid.setBug(x, y, 0);
    }
  }
  grid.draw(0);

  let nextGrid = grid;
  let i = 200;
  while (i--) {
    nextGrid = iterate(nextGrid);
  }

  return [...nextGrid].length;
}

/**
 * @param {RecursiveGrid} grid
 */
function iterate(grid) {
  const queue = [];

  for (let pos of grid) {
    queue.push(pos, ...grid.getAdjacentPositions(pos.x, pos.y, pos.level));
  }

  const nextGrid = new RecursiveGrid(grid.width, grid.height);
  const visited = {};

  while (queue.length) {
    const pos = queue.shift();
    const hash = posToHash(pos);
    if (visited[hash]) {
      continue;
    }
    visited[hash] = true;

    const adjs = grid.getAdjacentPositions(pos.x, pos.y, pos.level);
    const bugsCount = adjs.filter(({ x, y, level }) =>
      grid.isBugAtPos(x, y, level)
    ).length;

    if (
      bugsCount === 1 ||
      (!grid.isBugAtPos(pos.x, pos.y, pos.level) && bugsCount === 2)
    ) {
      nextGrid.setBug(pos.x, pos.y, pos.level);
    }
  }

  return nextGrid;
}

function posToHash({ x, y, level }) {
  return `${x}:${y}:${level}`;
}

function toHash(x, y) {
  return `${x}:${y}`;
}

function toPos(hash) {
  return hash.split(":").map(Number);
}

class RecursiveGrid {
  static Deltas = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0]
  ];

  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.levels = new Map();
  }

  get centerX() {
    return Math.floor(this.width / 2);
  }

  get centerY() {
    return Math.floor(this.height / 2);
  }

  isBugAtPos(x, y, level) {
    if (x === this.centerX && y === this.centerY) {
      throw new TypeError("not available position:", toHash(x, y));
    }
    if (this.levels.has(level)) {
      const map = this.levels.get(level);
      return Boolean(map[toHash(x, y)]);
    }
    return false;
  }

  setBug(x, y, level) {
    if (x === this.centerX && y === this.centerY) {
      throw new TypeError("not available position:", toHash(x, y));
    }
    if (!this.levels.has(level)) {
      this.levels.set(level, {});
    }
    this.levels.get(level)[toHash(x, y)] = true;
  }

  setSpace(x, y, level) {
    if (x === this.centerX && y === this.centerY) {
      throw new TypeError("not available position:", toHash(x, y));
    }
    if (this.levels.has(level)) {
      this.levels.get(level)[toHash(x, y)] = false;
    }
  }

  getAdjacentPositions(x0, y0, level) {
    const positions = [];
    for (const [dx, dy] of RecursiveGrid.Deltas) {
      const x = x0 + dx;
      const y = y0 + dy;

      if (x === this.centerX && y === this.centerY) {
        if (x0 < x) {
          for (let i = 0; i < this.height; i++) {
            positions.push({ x: 0, y: i, level: level + 1 });
          }
        } else if (x < x0) {
          for (let i = 0; i < this.height; i++) {
            positions.push({ x: this.width - 1, y: i, level: level + 1 });
          }
        } else if (y0 < y) {
          for (let i = 0; i < this.width; i++) {
            positions.push({ x: i, y: 0, level: level + 1 });
          }
        } else if (y < y0) {
          for (let i = 0; i < this.width; i++) {
            positions.push({ x: i, y: this.height - 1, level: level + 1 });
          }
        }
        continue;
      }

      if (0 <= x && x < this.width && 0 <= y && y < this.height) {
        positions.push({ x, y, level });
        continue;
      }

      if (x < 0) {
        positions.push({
          x: this.centerX - 1,
          y: this.centerY,
          level: level - 1
        });
        continue;
      }

      if (y < 0) {
        positions.push({
          x: this.centerX,
          y: this.centerY - 1,
          level: level - 1
        });
        continue;
      }

      if (x >= this.width) {
        positions.push({
          x: this.centerX + 1,
          y: this.centerY,
          level: level - 1
        });

        continue;
      }

      if (y >= this.height) {
        positions.push({
          x: this.centerX,
          y: this.centerY + 1,
          level: level - 1
        });
        continue;
      }
    }

    return positions;
  }

  *[Symbol.iterator]() {
    for (let [level, map] of this.levels) {
      for (let key in map) {
        if (map[key]) {
          const [x, y] = toPos(key);
          yield { x, y, level };
        }
      }
    }
  }

  draw(level) {
    let result = "";
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (x === this.centerX && y === this.centerY) {
          result += "? ";
        } else {
          result += (this.isBugAtPos(x, y, level) ? "#" : ".") + " ";
        }
      }
      result += "\n";
    }
    console.log(result);
  }

  drawAllLevels() {
    for (const level of [...this.levels.keys()].sort((a, b) => a - b)) {
      console.log("Level " + level);
      this.draw(level);
    }
  }
}
