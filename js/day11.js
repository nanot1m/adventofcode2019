const Dir = {
  Top: 0,
  Right: 1,
  Bottom: 2,
  Left: 3
};

const Rotation = {
  Anticlockwise: 0,
  Clockwise: 1
};

const Color = {
  Black: 0,
  White: 1
};

function rotate(rotation, dir) {
  if (rotation === Rotation.Clockwise) {
    switch (dir) {
      case Dir.Top:
        return Dir.Right;
      case Dir.Right:
        return Dir.Bottom;
      case Dir.Bottom:
        return Dir.Left;
      case Dir.Left:
        return Dir.Top;
    }
  }

  switch (dir) {
    case Dir.Top:
      return Dir.Left;
    case Dir.Left:
      return Dir.Bottom;
    case Dir.Bottom:
      return Dir.Right;
    case Dir.Right:
      return Dir.Top;
  }
}

class Grid {
  constructor() {
    this._hash = {};
    this._minX = 0;
    this._maxX = 0;
    this._minY = 0;
    this._maxY = 0;
  }

  get coloredCount() {
    let result = 0;
    for (let y in this._hash) {
      for (let _ in this._hash[y]) {
        result++;
      }
    }
    return result;
  }

  get corners() {
    return {
      topLeft: { x: this._minX, y: this._minY },
      bottomRight: { x: this._maxX, y: this._maxY }
    };
  }

  set(pos, color) {
    this.updateMinMax(pos);
    this._hash[pos.y] = this._hash[pos.y] || {};
    this._hash[pos.y][pos.x] = color;
    return this;
  }

  get(pos) {
    return (this._hash[pos.y] && this._hash[pos.y][pos.x]) || Color.Black;
  }

  updateMinMax(pos) {
    this._minX = Math.min(this._minX, pos.x);
    this._maxX = Math.max(this._maxX, pos.x);
    this._minY = Math.min(this._minY, pos.y);
    this._maxY = Math.max(this._maxY, pos.y);
  }
}

class Robot {
  constructor(registries) {
    this._program = require("./IntcodeComputer").program(registries);
    this._pos = { x: 0, y: 0 };
    this._dir = Dir.Top;
  }

  get position() {
    return this._pos;
  }

  get direction() {
    return this._dir;
  }

  isHalted() {
    return this._program.isHalted();
  }

  /** @param {Grid} grid */
  paint(grid, color) {
    grid.set(this._pos, color);
    return this;
  }

  /** @param {Grid} grid */
  step(grid) {
    const input = [grid.get(this._pos)];
    const { output } = this._program.pushInput(input).run();
    const [color, rotation] = output.slice(-2);
    return this.paint(grid, color)
      .rotate(rotation)
      .stepForward();
  }

  rotate(rotation) {
    this._dir = rotate(rotation, this._dir);
    return this;
  }

  stepForward() {
    switch (this._dir) {
      case Dir.Top:
        this._pos.y -= 1;
        break;
      case Dir.Right:
        this._pos.x += 1;
        break;
      case Dir.Bottom:
        this._pos.y += 1;
        break;
      case Dir.Left:
        this._pos.x -= 1;
        break;
    }
    return this;
  }
}

function solve(registries, initColor) {
  const robot = new Robot(registries);
  const grid = new Grid().set(robot.position, initColor);
  while (!robot.isHalted()) {
    robot.step(grid);
  }
  return grid;
}

/**
 * @param {Grid} grid
 * @param {Robot} robot
 */
function drawGrid(grid, robot) {
  const { bottomRight, topLeft } = grid.corners;
  let result = "";
  for (let y = topLeft.y - 1; y <= bottomRight.y + 1; y++) {
    let line = "";
    for (let x = topLeft.x - 1; x <= bottomRight.x + 1; x++) {
      if (robot.position.x === x && robot.position.y === y) {
        line += drawDirection(robot.direction) + " ";
      } else {
        line += drawColor(grid.get({ x, y })) + " ";
      }
    }
    result += line + "\n";
  }
  return result;
}

function drawDirection(direction) {
  switch (direction) {
    case Dir.Top:
      return "👆";
    case Dir.Right:
      return "👉";
    case Dir.Bottom:
      return "👇";
    case Dir.Left:
      return "👈";
  }
}

function drawColor(color) {
  if (color === Color.White) {
    return "🌺";
  }
  return "🌱";
}

function clear() {
  process.stdout.cursorTo(0, 0);
  process.stdout.clearScreenDown();
}

function solveAnimated(registries, initColor, speed) {
  const robot = new Robot(registries);
  const grid = new Grid().set(robot.position, initColor);

  drawGrid(grid, robot);

  function step(resolve) {
    robot.step(grid);
    clear();
    process.stdout.write(drawGrid(grid, robot));

    if (robot.isHalted()) {
      resolve();
    } else {
      setTimeout(() => {
        step(resolve);
      }, speed);
    }
  }

  return new Promise(step);
}

require("./Problem")({
  input() {
    return require("./Input")
      .day(11)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    return solveAnimated(registries, Color.White, 16);
  }
}).run();
