module.exports = {
  program(regs) {
    return {
      withInput(_input) {
        return {
          run() {
            return runProgram(program(regs.slice(), _input.slice()));
          }
        };
      }
    };
  }
};

function program(registries, input) {
  return {
    registries,
    input,
    output: [],
    position: 0,
    status: "Running"
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

const sum = (left, right, position) => ({ type: SUM, left, right, position });
const mul = (left, right, position) => ({ type: MUL, left, right, position });
const input = position => ({ type: INPUT, position });
const output = position => ({ type: OUTPUT, position });
const jit = (left, position) => ({ type: JIT, left, position });
const jif = (left, position) => ({ type: JIF, left, position });
const lt = (left, right, position) => ({ type: LT, left, right, position });
const eq = (left, right, position) => ({ type: EQ, left, right, position });
const halt = () => ({ type: HALT });

function runProgram(program) {
  while (program.status === "Running") {
    runCommand(program, parseCommand(program));
  }
  return program;
}

function runCommand(program, command) {
  switch (command.type) {
    case SUM:
      program.registries[command.position] = command.left + command.right;
      program.position += 4;
      break;
    case MUL:
      program.registries[command.position] = command.left * command.right;
      program.position += 4;
      break;
    case INPUT:
      program.registries[command.position] = program.input.shift();
      program.position += 2;
      break;
    case OUTPUT:
      program.output.push(program.registries[command.position]);
      program.position += 2;
      break;
    case JIT:
      program.position = command.left ? command.position : program.position + 3;
      break;
    case JIF:
      program.position = command.left ? program.position + 3 : command.position;
      break;
    case LT:
      program.registries[command.position] = Number(
        command.left < command.right
      );
      program.position += 4;
      break;
    case EQ:
      program.registries[command.position] = Number(
        command.left === command.right
      );
      program.position += 4;
      break;
    case HALT:
      program.status = "Halted";
      break;
  }
}

function parseCommand({ registries, position }) {
  const registry = registries[position];
  const command = registry % 100;
  const modes = [
    Math.floor(registry / 100) % 10,
    Math.floor(registry / 1000) % 10,
    Math.floor(registry / 10000) % 10
  ];
  const p = i => param(registries, modes[i - 1], position + i);
  const pp = i => registries[position + i];
  switch (command) {
    case 1:
      return sum(p(1), p(2), pp(3));
    case 2:
      return mul(p(1), p(2), pp(3));
    case 3:
      return input(pp(1));
    case 4:
      return output(pp(1));
    case 5:
      return jit(p(1), p(2));
    case 6:
      return jif(p(1), p(2));
    case 7:
      return lt(p(1), p(2), pp(3));
    case 8:
      return eq(p(1), p(2), pp(3));
    case 99:
      return halt();
    default:
      throw new TypeError("Unknown command: " + command);
  }
}

function param(registries, mode, position) {
  if (mode === 1) {
    return registries[position];
  }
  return registries[registries[position]];
}
