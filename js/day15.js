const Computer = require("./IntcodeComputer");

require("./Problem")({
  input() {
    return require("./Input")
      .day(15)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    const program = Computer.program(registries);
    const { result, map, oxygenPos } = bfs(program);
    drawMap(map, {});
    return result;
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

  let result = "-".repeat(maxX - minX + 3) + "\n";
  for (let y = minY; y <= maxY; y++) {
    let line = "|";
    for (let x = minX; x <= maxX; x++) {
      if (position.x === x && position.y === y) {
        line += "O";
      } else {
        line += getCh({ x, y }, map);
      }
    }
    result += line + "|\n";
  }
  result += "-".repeat(maxX - minX + 3);
  console.log(result);
}

function getCh(pos, map) {
  switch (getM(pos, map)) {
    case MapObjects.Empty:
      return ".";
    case MapObjects.Wall:
      return "#";
    case MapObjects.OxygenSystem:
      return "Y";
    default:
      return " ";
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

function makeMove(program, direction) {
  const clone = program.clone();
  clone.pushInput([direction]).run();
  return clone;
}

function getStatus(program) {
  return program.output.slice(-1)[0];
}
