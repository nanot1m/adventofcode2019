require("./Problem")({
  input() {
    return require("./Input")
      .day(19)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    return {
      "Part 1": part1(registries),
      "Part 2": part2(registries)
    };
  }
}).run();

function part1(registries) {
  const program = require("./IntcodeComputer").program(registries);

  let image = "";
  let count = 0;
  for (let y = 0; y < 50; y++) {
    for (let x = 0; x < 50; x++) {
      const pointIsTractor = isTractor(x, y, program);
      image += pointIsTractor ? "#" : ".";
      count += Number(pointIsTractor);
    }
    image += "\n";
  }
  console.clear();
  console.log(image);
  return count;
}

function isTractor(x, y, program) {
  const { output } = program.withInput([x, y]).run();
  const result = output[output.length - 1];
  return result === 1;
}

function part2(registries) {
  const program = require("./IntcodeComputer").program(registries);

  let beamPos;
  outer: while (true) {
    for (let y = 1; y < 50; y++) {
      for (let x = 1; x < 50; x++) {
        if (isTractor(x, y, program)) {
          beamPos = { x, y };
          break outer;
        }
      }
    }
  }

  while (true) {
    if (isTractor(beamPos.x, beamPos.y, program)) {
      if (isTractor(beamPos.x - 99, beamPos.y + 99, program)) {
        return 10000 * (beamPos.x - 99) + beamPos.y;
      }
      beamPos.x++;
    } else {
      beamPos.y++;
    }
  }
}
