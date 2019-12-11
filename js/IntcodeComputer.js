module.exports = {
  program(registries) {
    return new Computer(program(registries, []));
  }
};

const RUNNING = "RUNNING";
const HALTED = "HALTED";
const WAITING_FOR_INPUT = "WAITING_FOR_INPUT";

class Computer {
  /** @param {ReturnType<typeof program>} program */
  constructor({ registries, input, output, ...rest }) {
    this._program = {
      registries: registries.slice(),
      input: input.slice(),
      output: output.slice(),
      ...rest
    };
  }
  isHalted() {
    return this._program.status === HALTED;
  }
  /** @param {number[]} input */
  withInput(input) {
    return new Computer({ ...this._program, input });
  }
  /** @param {number[]} input */
  pushInput(input) {
    this._program.input.push(...input);
    return this;
  }
  run() {
    return runProgram(this._program);
  }
}

/**
 * @param {number[]} registries
 * @param {number[]} input
 */
function program(registries, input) {
  return {
    registries,
    input,
    output: [],
    position: 0,
    status: RUNNING,
    relativeBase: 0
  };
}

const SUM = "SUM";
const MUL = "MUL";
const INPUT = "INPUT";
const OUTPUT = "OUTPUT";
const HALT = "HALT";
const JIT = "JIT";
const JIF = "JIF";
const LT = "LT";
const EQ = "EQ";
const ADJUST_RB = "ADJUST_RB";

const sum = (left, right, position) => ({ type: SUM, left, right, position });
const mul = (left, right, position) => ({ type: MUL, left, right, position });
const input = position => ({ type: INPUT, position });
const output = left => ({ type: OUTPUT, left });
const jit = (left, right) => ({ type: JIT, left, right });
const jif = (left, right) => ({ type: JIF, left, right });
const lt = (left, right, position) => ({ type: LT, left, right, position });
const eq = (left, right, position) => ({ type: EQ, left, right, position });
const adjustRb = left => ({ type: ADJUST_RB, left });
const halt = () => ({ type: HALT });

/** @returns {ReturnType<typeof program>} */
function runProgram(program) {
  if (program.status === WAITING_FOR_INPUT && program.input.length > 0) {
    program.status = RUNNING;
  }
  while (program.status === RUNNING) {
    runCommand(program, parseCommand(program));
  }
  return program;
}

function runCommand(program, { type, left, right, position }) {
  switch (type) {
    case SUM:
      program.registries[position] = left + right;
      program.position += 4;
      break;
    case MUL:
      program.registries[position] = left * right;
      program.position += 4;
      break;
    case INPUT:
      if (program.input.length === 0) {
        program.status = WAITING_FOR_INPUT;
      } else {
        program.registries[position] = program.input.shift();
        program.position += 2;
      }
      break;
    case OUTPUT:
      program.output.push(left);
      program.position += 2;
      break;
    case JIT:
      program.position = left ? right : program.position + 3;
      break;
    case JIF:
      program.position = left ? program.position + 3 : right;
      break;
    case LT:
      program.registries[position] = Number(left < right);
      program.position += 4;
      break;
    case EQ:
      program.registries[position] = Number(left === right);
      program.position += 4;
      break;
    case ADJUST_RB:
      program.relativeBase += left;
      program.position += 2;
      break;
    case HALT:
      program.status = HALTED;
      return;
  }
}

function parseCommand({ registries, position, relativeBase }) {
  const registry = registries[position];
  const command = registry % 100;
  const m1 = Math.floor(registry / 100) % 10;
  const m2 = Math.floor(registry / 1000) % 10;
  const m3 = Math.floor(registry / 10000) % 10;
  const p1 = () => param(registries, m1, position + 1, relativeBase);
  const p2 = () => param(registries, m2, position + 2, relativeBase);
  const p3 = () => param(registries, m3, position + 3, relativeBase);
  switch (command) {
    case 1:
      return sum(registries[p1()], registries[p2()], p3());
    case 2:
      return mul(registries[p1()], registries[p2()], p3());
    case 3:
      return input(p1());
    case 4:
      return output(registries[p1()]);
    case 5:
      return jit(registries[p1()], registries[p2()]);
    case 6:
      return jif(registries[p1()], registries[p2()]);
    case 7:
      return lt(registries[p1()], registries[p2()], p3());
    case 8:
      return eq(registries[p1()], registries[p2()], p3());
    case 9:
      return adjustRb(registries[p1()]);
    case 99:
      return halt();
    default:
      throw new TypeError("Unknown command: " + command);
  }
}

function param(registries, mode, position, relativeBase) {
  if (mode === 1) {
    return position;
  }
  if (mode === 2) {
    return relativeBase + registries[position];
  }
  return registries[position];
}
