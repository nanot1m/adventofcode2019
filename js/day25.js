const readline = require("readline");
readline.emitKeypressEvents(process.stdin);
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

require("./Problem")({
  input() {
    return require("./Input")
      .day(25)
      .split(",")
      .map(Number);
  },
  solve(regs) {
    part1(regs);
    // return {
    //   "Part 1": part1(regs),
    //   "Part 2": part2(regs)
    // };
  }
}).run();

const init = [
  "west",
  "west",
  "west",
  "take coin",
  "east",
  "east",
  "east",
  "north",
  "east",
  "take cake",
  "east",
  "north",
  "take pointer",
  "south",
  "west",
  "west",
  "north",
  "take mutex",
  "east",
  "take antenna",
  "west",
  "south",
  "south",
  "east",
  "east",
  "take tambourine",
  "east",
  "take fuel cell",
  "east",
  "take boulder",
  "north",
  ""
];

function getWeight(loot, program) {
  loot = loot.slice();
  // drop all items
  const initDropCommands = loot.map(x => `drop ${x}`).concat("");
  program = program.withInput(toASCII(initDropCommands.join("\n")));
  program.run();
  program.output.length = 0;

  const bm = Math.pow(2, loot.length);
  for (let i = 1; i < bm; i++) {
    let took = [];
    for (let j = 0; j < loot.length; j++) {
      if (i & (1 << j)) {
        took.push(loot[j]);
      }
    }

    const takeCommands = took.map(x => `take ${x}`);

    const commands = [...takeCommands, "east", ""].join("\n");
    const { output } = program.withInput(toASCII(commands)).run();
    const result = String.fromCharCode(...output);
    if (result && !result.includes("ejected back to the checkpoint")) {
      console.log(result);
      break;
    }
  }
}

function part1(regs) {
  const program = require("./IntcodeComputer").program(regs);
  program.pushInput(toASCII(init.join("\n")));
  program.run();
  program.output.length = 0;
  const map = { 0: { 0: "." } };
  const pos = { x: 0, y: 0 };
  let availableCommands = [];
  let loot = init.filter(x => x.startsWith("take")).map(x => x.slice(5));
  getWeight(loot, program);
  let dy = 0;
  function run() {
    program.run();
    const result = parseOutput(program.output);

    if (result.error == null) {
      if (!result.doors) {
        console.log(result);
        process.exit(0);
      }
      availableCommands = result.doors.concat(
        result.items.map(item => "take " + item),
        loot.map(item => "drop " + item),
        "find weight"
      );
    } else {
      print(program.output);
      if (result.fatal) process.exit(1);
    }

    console.clear();
    print(program.output);
    program.output.length = 0;
    console.log("Available commands:");
    console.log(availableCommands.map(x => "- " + x).join("\n") + "\n");

    function prompt() {
      dy = 0;
      rl.question("", answer => {
        answer = availableCommands[dy];
        if (!availableCommands.includes(answer)) {
          console.log("Wrong command:\n'" + answer + "'\n");
          return prompt();
        }
        if (answer === "find weight") {
          getWeight(loot, program);
          return run();
        }
        program.pushInput(toASCII(answer + "\n"));
        if (answer.startsWith("take")) {
          availableCommands = availableCommands.filter(x => x !== answer);
          const item = answer
            .split(/\s/)
            .slice(1)
            .join(" ");
          loot.push(item);
        } else if (answer.startsWith("drop")) {
          availableCommands = availableCommands.filter(x => x !== answer);
          const item = answer
            .split(/\s/)
            .slice(1)
            .join(" ");
          availableCommands.push("take " + item);
          loot = loot.filter(x => x !== item);
        } else {
          markMoveOnMap(answer, pos, map);
        }
        run();
      });
    }
    prompt();
  }
  run();

  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (str, key) => {
    if (str) {
      str = str.toLowerCase();
      const idx = availableCommands.findIndex(c => c.startsWith(str));
      if (idx !== -1) {
        dy = idx;
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdin.write(availableCommands[dy]);
        return;
      }
    }

    if (!["up", "down"].includes(key.name)) {
      return;
    }

    const len = availableCommands.length;
    switch (key.name) {
      case "up":
        dy = (dy - 1 + len) % len;
        break;
      case "down":
        dy = (dy + 1) % len;
        break;
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdin.write(availableCommands[dy]);
  });

  return void 0;
}

function parseOutput(output) {
  const lines = String.fromCharCode(...output)
    .trim()
    .split("\n");
  let name = lines.shift();
  if (!name.startsWith("==")) {
    return {
      error: lines.join("\n"),
      fatal: !lines.some(x => x === "Command?")
    };
  }

  let description = lines.shift();

  let doors = [];
  let items = [];

  let collectingItems = false;
  while (true) {
    let lastLine = lines.shift();
    if (lastLine === "Command?") {
      break;
    }
    if (lastLine.includes("Doors")) {
      doors = [];
    }
    if (lastLine.includes("Items")) {
      items = [];
      collectingItems = true;
    }
    if (lastLine.startsWith("- ")) {
      if (collectingItems) {
        items.push(lastLine.slice(2));
      } else {
        doors.push(lastLine.slice(2));
      }
    }
  }

  return {
    name,
    description,
    doors,
    items
  };
}

function drawMap(pos, map) {
  let minX = Infinity;
  let maxX = 0;
  let minY = Infinity;
  let maxY = 0;
  for (let y in map) {
    for (let x in map[y]) {
      minX = Math.min(minX, Number(x));
      maxX = Math.max(maxX, Number(x));
      minY = Math.min(minY, Number(y));
      maxY = Math.max(maxY, Number(y));
    }
  }

  let result = "";
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x === pos.x && y === pos.y) {
        result += "@";
      } else {
        result += getM(x, y, map) || "#";
      }
      result += " ";
    }
    result += "\n";
  }

  console.log(result);
}

function setM(x, y, val, map) {
  map[y] = map[y] || {};
  map[y][x] = val;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

function markMoveOnMap(command, pos, map) {
  switch (command) {
    case "north":
      pos.y--;
      setM(pos.x, pos.y, ".", map);
      break;
    case "west":
      pos.x--;
      setM(pos.x, pos.y, ".", map);
      break;
    case "south":
      pos.y++;
      setM(pos.x, pos.y, ".", map);
      break;
    case "east":
      pos.x++;
      setM(pos.x, pos.y, ".", map);
      break;
  }
}

function part2(regs) {
  const program = require("./IntcodeComputer").program(regs);

  return void 0;
}

function print(output) {
  console.log(trim(String.fromCharCode(...output)));
}

function toASCII(str) {
  return [...str].map(x => x.charCodeAt(0));
}

function trim(str) {
  return str;
  // return str.replace(/[^A-Za-z\s\.\,\:\?\!\-\=]/g, "");
}
