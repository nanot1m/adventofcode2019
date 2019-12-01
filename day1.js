require("./Problem")({
  input() {
    return require("fs")
      .readFileSync("day1.input.txt", "utf8")
      .trim()
      .split("\n")
      .map(Number);
  },
  solve(numbers) {
    function countFuel(mass) {
      let acc = 0;
      while (mass > 0) {
        acc += mass = Math.max(Math.floor(mass / 3) - 2, 0);
      }
      return acc;
    }
    return numbers.reduce((acc, num) => acc + countFuel(num), 0);
  }
}).run();
