require("./Problem")({
  input() {
    return require("./Input")
      .day(4)
      .split("-")
      .map(Number);
  },
  solve([min, max]) {
    let count = 0;
    for (let i = min + 1; i < max; i++) {
      if (isValid(i)) {
        count++;
      }
    }
    return count;
  }
}).run();

function isValid(number) {
  let numbers = number
    .toString()
    .split("")
    .map(Number);
  let hasSameAdj = false;
  for (let i = 0; i < numbers.length; i++) {
    if (i > 0) {
      if (numbers[i] === numbers[i - 1]) hasSameAdj = true;
      if (numbers[i] < numbers[i - 1]) {
        return false;
      }
    }
  }
  return hasSameAdj;
}
