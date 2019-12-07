require("./Problem")({
  input() {
    return require("./Input")
      .day(7)
      .split(",")
      .map(Number);
  },
  solve(registries) {
    const program = require("./IntcodeComputer").program(registries);

    function runChain(phases, init = 0) {
      const outputs = [];
      for (let i = 0; i < 5; i++) {
        const input = [phases[i], i === 0 ? init : outputs[i - 1]];
        const result = program.withInput(input).run();
        outputs.push(result.output[result.output.length - 1]);
      }

      return outputs[outputs.length - 1];
    }

    let max = 0;
    for (const phases of permutateWithoutRepetitions([0, 1, 2, 3, 4])) {
      const result = runChain(phases, 0);
      max = Math.max(max, result);
    }

    return max;
  }
}).run();

function permutateWithoutRepetitions(permutationOptions) {
  if (permutationOptions.length === 1) {
    return [permutationOptions];
  }

  // Init permutations array.
  const permutations = [];

  // Get all permutations for permutationOptions excluding the first element.
  const smallerPermutations = permutateWithoutRepetitions(
    permutationOptions.slice(1)
  );

  // Insert first option into every possible position of every smaller permutation.
  const firstOption = permutationOptions[0];

  for (
    let permIndex = 0;
    permIndex < smallerPermutations.length;
    permIndex += 1
  ) {
    const smallerPermutation = smallerPermutations[permIndex];

    // Insert first option into every possible position of smallerPermutation.
    for (
      let positionIndex = 0;
      positionIndex <= smallerPermutation.length;
      positionIndex += 1
    ) {
      const permutationPrefix = smallerPermutation.slice(0, positionIndex);
      const permutationSuffix = smallerPermutation.slice(positionIndex);
      permutations.push(
        permutationPrefix.concat([firstOption], permutationSuffix)
      );
    }
  }

  return permutations;
}
