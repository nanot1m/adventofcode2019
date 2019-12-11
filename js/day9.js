require("./Problem")({
  input() {
    return require("./Input")
      .day(9)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    const program = require("./IntcodeComputer").program(registries);
    const p1 = program.withInput([1]);
    const p2 = program.withInput([2]);

    return {
      "Part 1": p1.run().output.pop(),
      "Part 2": p2.run().output.pop()
    };
  }
}).run();
