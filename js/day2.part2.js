require("./Problem")({
  input() {
    return require("./Input")
      .day(2)
      .split(",")
      .map(Number);
  },
  solve(numbers) {
    const program = require("./IntcodeComputer")
      .program(numbers)
      .withInput([]);
    for (let noun = 1; noun < 99; noun++) {
      for (let verb = 2; verb < 99; verb++) {
        numbers[1] = noun;
        numbers[2] = verb;
        const result = program.run().registries[0];
        if (result === 19690720) {
          return 100 * noun + verb;
        }
      }
    }
  }
}).run();
