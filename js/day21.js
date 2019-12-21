require("./Problem")({
  input() {
    return require("./Input")
      .day(21)
      .split(",")
      .map(Number);
  },
  async solve(registries) {
    return {
      "Part 1": await part1(registries),
      "Part 2": await part2(registries)
    };
  }
}).run();

const Distances = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  E: "E",
  F: "F",
  G: "G",
  H: "H"
};

const Regs = {
  Temp: "T",
  Jump: "J"
};

function part1(registries) {
  const program = require("./IntcodeComputer").program(registries);
  const commands = join(
    or(Distances.A, Regs.Jump),
    and(Distances.B, Regs.Jump),
    and(Distances.C, Regs.Jump),
    not(Regs.Jump, Regs.Jump),
    and(Distances.D, Regs.Jump),
    walk()
  );
  program.pushInput(toASCIICodes(commands)).run();
  return program.output[program.output.length - 1];
}

async function part2(registries) {
  const program = require("./IntcodeComputer").program(registries);
  const commands = join(
    or(Distances.A, Regs.Jump),
    and(Distances.B, Regs.Jump),
    and(Distances.C, Regs.Jump),
    not(Regs.Jump, Regs.Jump),
    and(Distances.D, Regs.Jump),
    or(Distances.E, Regs.Temp),
    or(Distances.H, Regs.Temp),
    and(Regs.Temp, Regs.Jump),
    run()
  );
  program.pushInput(toASCIICodes(commands)).run();
  return program.output[program.output.length - 1];
}

function join(...cmds) {
  return cmds.join("\n") + "\n";
}

function walk() {
  return "WALK";
}

function run() {
  return "RUN";
}

function and(a, b) {
  return `AND ${a} ${b}`;
}

function or(a, b) {
  return `OR ${a} ${b}`;
}

function not(a, b) {
  return `NOT ${a} ${b}`;
}

async function drawOutput(output, animated = false, speed = 100) {
  if (animated) {
    await drawAnimated(output, speed);
  } else {
    console.log(output.map(x => String.fromCharCode(x)).join(""));
  }
}

async function drawAnimated(output, speed = 100) {
  const slides = output
    .map(x => String.fromCharCode(x))
    .join("")
    .split("\n\n")
    .filter(Boolean);

  for (const slide of slides) {
    console.clear();
    console.log(slide);
    await new Promise(r => setTimeout(r, speed));
  }
}

function toASCIICodes(string) {
  return string.split("").map(x => x.charCodeAt(0));
}
