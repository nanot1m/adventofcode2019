require("./Problem")({
  input() {
    return require("./Input")
      .day(1)
      .split("\n")
      .map(Number);
  },
  solve(numbers) {
    function countFuel(acc, mass) {
      while (mass > 8) {
        acc += mass = Math.max(Math.floor(mass / 3) - 2, 0);
      }
      return acc;
    }
    return numbers.reduce(countFuel, 0);
  }
}).run();
