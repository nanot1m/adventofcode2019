require("./Problem")({
  input() {
    return require("./Input")
      .day(7)
      .split(",")
      .map(Number);
  },
  async solve(registries) {
    const program = require("./IntcodeComputer").program(registries);

    function runChain([a, b, c, d, e], init = 0) {
      let programA = program.withInput([a, init]);
      let programB = program.withInput([b]);
      let programC = program.withInput([c]);
      let programD = program.withInput([d]);
      let programE = program.withInput([e]);

      let pA;
      let pB;
      let pC;
      let pD;
      let pE;

      do {
        pA = programA.pushInput(pE ? pE.output.slice(-1) : []).run();
        pB = programB.pushInput(pA ? pA.output.slice(-1) : []).run();
        pC = programC.pushInput(pB ? pB.output.slice(-1) : []).run();
        pD = programD.pushInput(pC ? pC.output.slice(-1) : []).run();
        pE = programE.pushInput(pD ? pD.output.slice(-1) : []).run();
      } while (pE.status !== "HALTED");

      return pE.output.slice(-1)[0];
    }

    let max = 0;
    for (const phases of permutateWithoutRepetitions([9, 8, 7, 6, 5])) {
      max = Math.max(max, runChain(phases, 0));
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
