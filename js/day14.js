const FUEL = "FUEL";
const ORE = "ORE";

require("./Problem")({
  input() {
    function toReactionMap(result, reaction) {
      result[reaction.output.name] = reaction;
      return result;
    }

    function parseLine(line) {
      const [left, right] = line.trim().split(" => ");
      return {
        inputs: left.split(", ").map(parseChem),
        output: parseChem(right)
      };
    }

    function parseChem(chemStr) {
      const [left, right] = chemStr.split(" ");
      return {
        count: Number(left),
        name: right
      };
    }
    return require("./Input")
      .day(14)
      .split("\n")
      .map(parseLine)
      .reduce(toReactionMap, {});
  },
  solve(reactionMap) {
    return {
      "Part 1": countOreFor(FUEL, 1, reactionMap),
      "Part 2": countFuelForOre(1_000_000_000_000, reactionMap)
    };
  }
}).run();

function countFuelForOre(oreCount, reactionMap) {
  return binarySearch(1, oreCount, oreCount, value =>
    countOreFor(FUEL, value, reactionMap)
  );
}

function binarySearch(min, max, target, getValue) {
  if (min + 1 > max) {
    return min;
  }
  const middle = Math.floor((max + min) / 2);
  const result = getValue(middle);
  if (result === target) {
    return middle;
  }
  if (result > target) {
    return binarySearch(min, middle - 1, target, getValue);
  }
  return binarySearch(middle + 1, max, target, getValue);
}

function countOreFor(name, amount, map, acc = {}) {
  const { inputs, output } = map[name];

  let result = 0;
  const multiplier = Math.ceil(amount / output.count);

  for (let input of inputs) {
    // Totoal ammount of current chemical to produce
    const total = multiplier * input.count;

    if (input.name === ORE) {
      result += total;
      continue;
    }

    // All the produced chemicals would be saved in accumulator
    acc[input.name] = acc[input.name] || 0;

    // If there are enough chemicals just use them
    // instead of producing new chemicals
    if (acc[input.name] < total) {
      // Keeping in mind that we may already have some chemicals
      // in accumulator
      result += countOreFor(input.name, total - acc[input.name], map, acc);
    }

    // Take needed ammount of chemicals from the accumulator
    acc[input.name] -= total;
  }

  // Saving ammount of produced chemicals in accumulator
  acc[output.name] = acc[output.name] || 0;
  acc[output.name] += multiplier * output.count;

  return result;
}
