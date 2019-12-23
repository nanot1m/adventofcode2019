const Computer = require("./IntcodeComputer");

require("./Problem")({
  input() {
    return require("./Input")
      .day(23)
      .split(",")
      .map(Number);
  },
  solve(regs) {
    return {
      "Part 1": part1(regs)
    };
  }
}).run();

function part1(regs) {
  const { nics, inputQueues } = bootNics(regs);

  for (const { y, z } of createNetwork(nics, inputQueues)) {
    if (z === 255) {
      return y;
    }
  }
}

function bootNics(regs) {
  const initProgram = Computer.program(regs);

  const nics = Array.from(Array(50), (_, i) => initProgram.withInput([i]));
  nics.forEach(nic => nic.run());
  let inputQueues = new Map();
  for (let i = 0; i < nics.length; i++) {
    inputQueues.set(i, []);
  }
  return { nics, inputQueues };
}

function* createNetwork(nics, inputQueues) {
  while (true) {
    for (let i = 0; i < nics.length; i++) {
      const inputQueue = inputQueues.get(i);
      const nextInput = inputQueue.length ? inputQueue.splice(0, 2) : [-1];

      nics[i].pushInput(nextInput);
      nics[i].run();
      if (nics[i].output.length === 0) {
        continue;
      }

      const [z, x, y] = nics[i].output.splice(-3, 3);

      const targetInputQueue = inputQueues.get(z);
      if (targetInputQueue) {
        targetInputQueue.push(x, y);
      }

      yield { z, x, y };
    }
  }
}
