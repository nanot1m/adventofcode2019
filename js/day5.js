require("./Problem")({
  input() {
    return require("./Input")
      .day(5)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    const last = xs => xs[xs.length - 1];
    const program = require("./IntcodeComputer").program(registries);
    const part1 = program.withInput([1]).run();
    const part2 = program.withInput([5]).run();
    return {
      part1: last(part1.output),
      part2: last(part2.output)
    };
  }
}).run();
