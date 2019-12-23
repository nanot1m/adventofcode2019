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
      "Part 1": part1(regs),
      "Part 2": part2(regs)
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

function part2(regs) {
  const { nics, inputQueues } = bootNics(regs);

  let natPacket = null;
  let twiceInRow = 2;

  for (const { type, x, y, z, idle } of createNetwork(nics, inputQueues)) {
    if (type === "packet") {
      if (z === 255) {
        natPacket = { x, y };
      }
    }

    if (type === "status") {
      if (idle) {
        inputQueues.get(0).push(natPacket.x, natPacket.y);
        if (--twiceInRow === 0) {
          return natPacket.y;
        }
      } else {
        twiceInRow = 2;
      }
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

      yield { type: "packet", z, x, y };
    }

    yield { type: "status", idle: isIdle(inputQueues) };
  }
}

/**
 * @param {Map<number, number[]>} inputQueues
 */
function isIdle(inputQueues) {
  for (let input of inputQueues.values()) {
    if (input.length > 0) {
      return false;
    }
  }
  return true;
}
