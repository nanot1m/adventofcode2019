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
  let groupLength = 1;
  let i = 1;
  for (i; i < numbers.length; i++) {
    if (numbers[i] === numbers[i - 1]) {
      groupLength++;
    } else {
      if (groupLength === 2) {
        hasSameAdj = true;
      }
      groupLength = 1;
    }
    if (numbers[i] < numbers[i - 1]) {
      return false;
    }
  }
  if (groupLength === 2) {
    hasSameAdj = true;
  }
  return hasSameAdj;
}
