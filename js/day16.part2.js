require("./Problem")({
  input() {
    return require("./Input")
      .day(16)
      .split("")
      .map(Number);
  },
  solve(input) {
    const start = parseInt(input.slice(0, 7).join(""));
    const end = input.length * 10000 - 1;

    if (start < end / 2) {
      throw new Error("We are fucked!");
    }

    let numbers = [];
    for (let i = end; i >= start; i--) {
      numbers.push(input[i % input.length]);
    }

    for (let i = 0; i < 100; i++) {
      const result = [numbers[0]];
      for (let j = 1; j < numbers.length; j++) {
        result.push(Math.abs(result[j - 1] + numbers[j]) % 10);
      }
      numbers = result;
    }

    return numbers
      .slice(-8)
      .reverse()
      .join("");
  }
}).run();
