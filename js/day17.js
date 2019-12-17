require("./Problem")({
  input() {
    return require("./Input")
      .day(17)
      .split(",")
      .map(Number);
  },
  async solve(registries) {
    const { output: initOutput } = require("./IntcodeComputer")
      .program(registries)
      .run();
    const map = outputToMap(initOutput);
    const crossRoads = getAllCrossroads(map);

    const part1 = crossRoads.reduce((acc, { x, y }) => acc + x * y, 0);

    const path = getPath(map);
    const { fnA, fnB, fnC, result } = compressString(path);

    const input = [
      ...(result + "\n"),
      ...(fnA + "\n"),
      ...(fnB + "\n"),
      ...(fnC + "\n"),
      ...("y" + "\n")
    ].map(toASCII);

    registries[0] = 2;
    const { output } = require("./IntcodeComputer")
      .program(registries)
      .withInput(input)
      .run();

    const part2 = output[output.length - 1];
    await drawOutput(output, true);
    return {
      "Part 1": part1,
      "Part 2": part2
    };
  }
}).run();

function compressString(path) {
  const substrings = dedupe(getSubstrings(path));
  const pathAsStr = path.join(",");

  for (let i = 0; i < substrings.length; i++) {
    for (let j = i + 1; j < substrings.length; j++) {
      for (let k = j + 1; k < substrings.length; k++) {
        const fnA = substrings[i];
        const fnB = substrings[j];
        const fnC = substrings[k];

        const result = pathAsStr
          .replace(new RegExp(fnA, "g"), "A")
          .replace(new RegExp(fnB, "g"), "B")
          .replace(new RegExp(fnC, "g"), "C")
          .replace(/,+/g, ",")
          .replace(/(,$)|(^,)/, "");

        if (/^[ABC,]+$/.test(result)) {
          return {
            fnA,
            fnB,
            fnC,
            result
          };
        }
      }
    }
  }

  return null;
}

function dedupe(list) {
  const groups = {};
  const result = [];
  for (let i = 0; i < list.length; i++) {
    const key = list[i];
    if (groups[key]) {
      continue;
    } else {
      groups[key] = true;
      result.push(list[i]);
    }
  }
  return result;
}

function getSubstrings(list) {
  const MAX_LEN = 20;
  const result = [];
  for (let i = 0; i < list.length; i += 2) {
    for (let j = 2; j < MAX_LEN; j += 2) {
      result.push(list.slice(i, i + j).join(","));
    }
  }
  return result;
}

function toASCII(char) {
  return char.charCodeAt(0);
}

const Rotation = {
  Right: "R",
  Left: "L"
};

const Direction = {
  Top: "^",
  Right: ">",
  Bottom: "v",
  Left: "<"
};

const Directions = Object.values(Direction);

function getInitDroid(map) {
  for (const { val, x, y } of traverseMap(map)) {
    if (Directions.includes(val)) {
      return {
        x: x,
        y: y,
        direction: val
      };
    }
  }
}

function getPath(map) {
  const droid = getInitDroid(map);
  const visited = {};

  let nextDirection = getUnvisitedDirection(droid, visited, map);

  const result = [];
  while (nextDirection) {
    const rotations = getRotationsBetweenDirections(
      droid.direction,
      nextDirection
    );
    result.push(...rotations);
    droid.direction = nextDirection;

    const length = getAvailableForwardLength(droid, map, visited);
    result.push(length);
    moveDroidBy(length, droid);

    nextDirection = getUnvisitedDirection(droid, visited, map);
  }

  return result;
}

const Deltas = {
  [Direction.Top]: [0, -1],
  [Direction.Right]: [1, 0],
  [Direction.Bottom]: [0, 1],
  [Direction.Left]: [-1, 0]
};

function moveDroidBy(length, droid) {
  const [dx, dy] = Deltas[droid.direction];
  droid.x += dx * length;
  droid.y += dy * length;
}

function getAvailableForwardLength(droid, map, visited) {
  const [dx, dy] = Deltas[droid.direction];
  let i = 0;
  let x = droid.x + dx;
  let y = droid.y + dy;
  while (getM(x, y, map) === "#") {
    x += dx;
    y += dy;
    i++;
    setM(x, y, true, visited);
  }
  return i;
}

const DirectionRotationMap = {
  [Direction.Top]: {
    [Direction.Right]: [Rotation.Right],
    [Direction.Left]: [Rotation.Left]
  },
  [Direction.Right]: {
    [Direction.Bottom]: [Rotation.Right],
    [Direction.Top]: [Rotation.Left]
  },
  [Direction.Bottom]: {
    [Direction.Left]: [Rotation.Right],
    [Direction.Right]: [Rotation.Left]
  },
  [Direction.Left]: {
    [Direction.Top]: [Rotation.Right],
    [Direction.Bottom]: [Rotation.Left]
  }
};

function getRotationsBetweenDirections(initDir, nextDir) {
  if (initDir === nextDir) {
    return [];
  }
  const rotations = DirectionRotationMap[initDir][nextDir];
  return rotations || [Rotation.Right, Rotation.Right];
}

function getUnvisitedDirection(droid, visited, map) {
  let { x, y } = droid;
  const directions = Object.keys(Deltas);
  const deltas = Object.values(Deltas);
  const index = deltas.findIndex(([dx, dy]) => {
    const x2 = x + dx;
    const y2 = y + dy;
    if (getM(x2, y2, visited)) {
      return false;
    }
    return getM(x2, y2, map) === "#";
  });
  return directions[index];
}

function outputToMap(output) {
  const map = {};
  let x = 0;
  let y = 0;
  for (let val of output) {
    if (val === 10) {
      y++;
      x = 0;
    } else {
      setM(x, y, valToChar(val), map);
      x++;
    }
  }
  return map;
}

function isCrossRoad(x, y, map) {
  if (getM(x, y, map) !== "#") {
    return false;
  }

  let counter = 0;
  for (const [dx, dy] of Object.values(Deltas)) {
    if (getM(x + dx, y + dy, map) === "#") {
      counter++;
    }
  }

  return counter > 2;
}

function* traverseMap(map) {
  for (let y in map) {
    for (let x in map[y]) {
      yield { val: map[y][x], x: Number(x), y: Number(y) };
    }
  }
}

function getAllCrossroads(map) {
  const result = [];
  for (const { x, y } of traverseMap(map)) {
    if (isCrossRoad(x, y, map)) {
      result.push({ x: x, y: y });
    }
  }
  return result;
}

function setM(x, y, val, map) {
  map[y] = map[y] || {};
  map[y][x] = val;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

async function drawOutput(output, animated = false) {
  let result = "";
  for (let val of output) {
    if (val === 10) {
      result += "\n";
    } else {
      result += valToChar(val, true) + " ";
    }
  }

  if (animated) {
    await drawAnimated(result);
  } else {
    console.log(result);
  }
}

async function drawAnimated(result) {
  const slides = result.split("\n\n");
  for (const slide of slides) {
    console.clear();
    console.log(slide);
    await new Promise(r => setTimeout(r, 20));
  }
}

function valToChar(val, emojify = false) {
  const char = String.fromCharCode(val);
  if (emojify) {
    switch (char) {
      case ".":
        return ".";
      case "#":
        return "⛓";
      case " ":
        return " ";
      case "^":
      case ">":
      case "<":
      case "v":
        return "🤖";
    }
  }
  return char;
}
