require("./Problem")({
  input() {
    return require("fs")
      .readFileSync("day2.input.txt", "utf8")
      .trim()
      .split(",")
      .map(Number);
  },
  solve(numbers) {
    for (let noun = 1; noun < 99; noun++) {
      for (let verb = 2; verb < 99; verb++) {
        try {
          const result = runProgram(numbers, noun, verb);
          if (result === 19690720) {
            return 100 * noun + verb;
          }
        } catch {}
      }
    }
  }
}).run();

function runProgram(_numbers, noun, verb) {
  let numbers = _numbers.slice();
  numbers[1] = noun;
  numbers[2] = verb;
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
