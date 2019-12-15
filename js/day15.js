require("./Problem")({
  input() {
    return require("./Input")
      .day(15)
      .split(",")
      .map(Number);
  },
  async solve(registries) {
    const program = require("./IntcodeComputer").program(registries);
    const { result, map, oxygenPos } = bfs(program);
    drawMap(map, {});

    const result2 = await spreadOxygen(oxygenPos, map);
    return {
      "Part 1": result,
      "Part 2": result2
    };
  }
}).run();

const Direction = {
  North: 1,
  South: 2,
  West: 3,
  East: 4
};

const MapObjects = {
  Wall: 0,
  Empty: 1,
  OxygenSystem: 2
};

const delay = t => new Promise(r => setTimeout(r, t));

async function spreadOxygen(oxygenPos, map) {
  const queue = [[oxygenPos, 0]];

  let max = 0;
  while (queue.length) {
    const [curPos, len] = queue.shift();
    const allowedPositions = getAllowedPositions(curPos, map);
    max = Math.max(max, len);
    allowedPositions.forEach(pos => {
      map[pos.y][pos.x] = MapObjects.OxygenSystem;
      queue.push([pos, len + 1]);
    });

    drawMap(map, curPos);
    await delay(16);
  }

  return max;
}

function bfs(initProgram) {
  const map = {};
  const queue = [[Direction.North, { x: 0, y: 0 }, initProgram, 0]];

  let oxygenPos;
  let result;
  while (queue.length) {
    const [direction, curPos, program, length] = queue.shift();

    const nextProgram = makeMove(program, direction);
    const status = getStatus(nextProgram);
    const nextPos = markOnMap(curPos, status, map, direction);
    const nextLength = nextPos === curPos ? length : length + 1;

    if (status === MapObjects.OxygenSystem) {
      oxygenPos = nextPos;
      result = nextLength;
    }

    const unvisitedDirections = getUnvisitedDirections(nextPos, map);
    for (const nextDirection of unvisitedDirections) {
      queue.push([nextDirection, nextPos, nextProgram, nextLength]);
    }
  }

  return { result, oxygenPos, map };
}

function drawMap(map, position) {
  let minX = -5;
  let minY = -5;
  let maxX = 5;
  let maxY = 5;

  for (const y in map) {
    minY = Math.min(Number(y), minY);
    maxY = Math.max(Number(y), maxY);
    for (const x in map[y]) {
      minX = Math.min(Number(x), minX);
      maxX = Math.max(Number(x), maxX);
    }
  }

  let result = "";
  for (let y = minY; y <= maxY; y++) {
    let line = "";
    for (let x = minX; x <= maxX; x++) {
      if (position.x === x && position.y === y) {
        line += "D ";
      } else {
        line += getCh({ x, y }, map);
      }
    }
    result += line + "\n";
  }
  process.stdout.clearScreenDown();
  process.stdout.cursorTo(0, 0);
  process.stdout.write(result);
}

function getCh(pos, map) {
  switch (getM(pos, map)) {
    case MapObjects.Empty:
      return ". ";
    case MapObjects.Wall:
      return "# ";
    case MapObjects.OxygenSystem:
      return "0 ";
    default:
      return "  ";
  }
}

function getDeltaXYForDirection(direction) {
  switch (direction) {
    case Direction.North:
      return { dx: 0, dy: -1 };
    case Direction.South:
      return { dx: 0, dy: 1 };
    case Direction.East:
      return { dx: 1, dy: 0 };
    case Direction.West:
      return { dx: -1, dy: 0 };
  }
}

function markOnMap(position, obj, map, direction) {
  const { dx, dy } = getDeltaXYForDirection(direction);
  const x = dx + position.x;
  const y = dy + position.y;
  map[y] = map[y] || {};
  map[y][x] = obj;
  if (obj === MapObjects.Wall) {
    return position;
  }
  return { x, y };
}

function getM({ x, y }, map) {
  return map[y] && map[y][x];
}

function getUnvisitedDirections({ x, y }, map) {
  const result = [];
  Object.values(Direction).forEach(direction => {
    const { dx, dy } = getDeltaXYForDirection(direction);
    if (getM({ x: x + dx, y: y + dy }, map) == null) {
      result.push(direction);
    }
  });
  return result;
}

function getAllowedPositions({ x, y }, map) {
  const result = [];
  Object.values(Direction).forEach(direction => {
    const { dx, dy } = getDeltaXYForDirection(direction);
    if (getM({ x: x + dx, y: y + dy }, map) == MapObjects.Empty) {
      result.push({ x: x + dx, y: y + dy });
    }
  });
  return result;
}

function makeMove(program, direction) {
  const clone = program.clone();
  clone.pushInput([direction]).run();
  return clone;
}

function getStatus(program) {
  return program.output.slice(-1)[0];
}
