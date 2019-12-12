require("./Problem")({
  input() {
    return require("./Input").day(12);
  },
  solve(data) {
    return {
      "Part 1": part1(data),
      "Part 2": part2(data)
    };
  }
}).run();

function part1(data) {
  const moons = parseData(data);
  let i = 1000;
  while (i--) {
    step(moons);
  }
  return getTotalKineticEnergy(moons);
}

function part2(data) {
  const init = parseData(data);
  const periods = [
    findPeriod(parseData(data), init, isEqualByAxis("x")),
    findPeriod(parseData(data), init, isEqualByAxis("y")),
    findPeriod(parseData(data), init, isEqualByAxis("z"))
  ];
  return periods.reduce(lcd);
}

function gcd(a, b) {
  if (a < 1 || b < 1) throw new Error("a or b is less than 1");
  while (b != 0) {
    let tmp = a;
    a = b;
    b = tmp % b;
  }
  return a;
}

function lcd(a, b) {
  return (a * b) / gcd(a, b);
}

function isEqualByAxis(axis) {
  return (a, b) =>
    a.position[axis] === b.position[axis] &&
    a.velocity[axis] === b.velocity[axis];
}

function findPeriod(moons, init, check) {
  let i = 0;
  while (true) {
    i++;
    step(moons);
    if (isEqual(moons, init, check)) {
      break;
    }
  }
  return i;
}

function parseData(input) {
  return input
    .trim()
    .split("\n")
    .map(x => x.trim())
    .map(x => ({
      position: parseLine(x),
      velocity: { x: 0, y: 0, z: 0 }
    }));
}

function parseLine(line) {
  const [x, y, z] = line
    .slice(1, -1)
    .split(",")
    .map(x => x.split("=")[1])
    .map(Number);
  return { x, y, z };
}

function isEqual(moonsA, moonsB, check) {
  for (let i = 0; i < moonsA.length; i++) {
    if (!check(moonsA[i], moonsB[i])) {
      return false;
    }
  }
  return true;
}

function getTotalKineticEnergy(moons) {
  let result = 0;
  for (let i = 0; i < moons.length; i++) {
    result += getKineticEnergy(moons[i]);
  }
  return result;
}

function getKineticEnergy(moon) {
  return (
    (Math.abs(moon.position.x) +
      Math.abs(moon.position.y) +
      Math.abs(moon.position.z)) *
    (Math.abs(moon.velocity.x) +
      Math.abs(moon.velocity.y) +
      Math.abs(moon.velocity.z))
  );
}

function step(moons) {
  applyGravity(moons);
  appllyVelocity(moons);
}

function appllyVelocity(moons) {
  moons.forEach(applyVelocityForMoon);
}

function applyVelocityForMoon(moon) {
  applyVelocityForAxis(moon, "x");
  applyVelocityForAxis(moon, "y");
  applyVelocityForAxis(moon, "z");
}

function applyVelocityForAxis(moon, axis) {
  moon.position[axis] += moon.velocity[axis];
}

function applyGravity(moons) {
  for (let i = 0; i < moons.length - 1; i++) {
    for (let j = i + 1; j < moons.length; j++) {
      applyGravityForMoons(moons[i], moons[j]);
    }
  }
}

function applyGravityForMoons(moonA, moonB) {
  applyGravityForAxis(moonA, moonB, "x");
  applyGravityForAxis(moonA, moonB, "y");
  applyGravityForAxis(moonA, moonB, "z");
}

function toString({
  position: { x, y, z },
  velocity: { x: dx, y: dy, z: dz }
}) {
  return `<x=${x}, y=${y}, z=${z}>, <dx=${dx}, dy=${dy}, dz=${dz}>`;
}

function applyGravityForAxis(moonA, moonB, axis) {
  const delta = moonA.position[axis] - moonB.position[axis];
  if (delta === 0) {
    return;
  }
  moonA.velocity[axis] -= Math.sign(delta);
  moonB.velocity[axis] += Math.sign(delta);
}
