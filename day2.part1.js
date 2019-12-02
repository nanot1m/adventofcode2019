require("./Problem")({
  input() {
    return require("./Input")
      .day(2)
      .split(",")
      .map(Number);
  },
  solve(numbers) {
    numbers[1] = 12;
    numbers[2] = 2;
    for (let i = 0; i < numbers.length; i += 4) {
      const command = numbers[i];
      const leftOperand = numbers[numbers[i + 1]];
      const rightOperand = numbers[numbers[i + 2]];
      if (command === 99) {
        return numbers[0];
      } else if (command === 1) {
        numbers[numbers[i + 3]] = leftOperand + rightOperand;
      } else if (command === 2) {
        numbers[numbers[i + 3]] = leftOperand * rightOperand;
      } else {
        throw new Error("Unknown command: " + command);
      }
    }
    throw new Error("Unexpected end of input");
  }
}).run();
