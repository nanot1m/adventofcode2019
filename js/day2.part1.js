require("./Problem")({
  input() {
    return require("./Input")
      .day(2)
      .split(",")
      .map(Number);
  },
  solve(numbers) {
    return require("./IntcodeComputer")
      .program(numbers)
      .withInput([])
      .run().registries[0];
  }
}).run();
