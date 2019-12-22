require("./Problem")({
  input() {
    return require("./Input")
      .day(22)
      .split("\n");
  },
  solve(lines) {
    return {
      "Part 1": part1(lines),
      "Part 2": part2(lines)
    };
  }
}).run();

const Techniques = {
  DealIntoNewStack: "deal into new stack",
  CutNCards: "cut",
  DealWithIncrementN: "deal with increment"
};

/**
 *
 * @param {string} line
 */
function parseCommand(line) {
  if (line.startsWith(Techniques.DealIntoNewStack)) {
    return { type: Techniques.DealIntoNewStack };
  }
  if (line.startsWith(Techniques.CutNCards)) {
    const n = line.slice(Techniques.CutNCards.length + 1);
    return { type: Techniques.CutNCards, count: Number(n) };
  }
  if (line.startsWith(Techniques.DealWithIncrementN)) {
    const n = line.slice(Techniques.DealWithIncrementN.length + 1);
    return { type: Techniques.DealWithIncrementN, count: Number(n) };
  }
  return null;
}

function createDeck(count) {
  return Array.from(Array(count), (_, i) => i);
}

function part1(lines) {
  const deck = createDeck(10007);
  return toTechniques(lines)
    .reduce(applyTechnique, deck)
    .indexOf(2019);
}

function part2(lines) {
  // let deck = createDeck(119315717514047);
  // let order = 101741582076661;
  // const techs = toTechniques(lines);
  // while (order--) {
  //   deck = techs.reduce(applyTechnique, deck);
  // }

  return void 2020;
}

/**
 *
 * @param {string[]} lines
 */
function toTechniques(lines) {
  const result = [];
  for (const line of lines) {
    const technique = parseCommand(line);
    if (technique) {
      result.push(technique);
    }
  }
  return result;
}

function applyTechnique(deck, technique) {
  switch (technique.type) {
    case Techniques.CutNCards:
      return applyCutNCards(technique.count, deck);
    case Techniques.DealIntoNewStack:
      return applyDealWithNewStack(deck);
    case Techniques.DealWithIncrementN:
      return applyDealWithIncrement(technique.count, deck);
    default:
      return deck;
  }
}

function applyDealWithNewStack(deck) {
  return deck.reverse();
}

function applyCutNCards(n, deck) {
  if (n > 0) {
    const slice = deck.splice(0, n);
    deck.push(...slice);
  } else {
    const slice = deck.splice(n, -1 * n);
    deck.unshift(...slice);
  }
  return deck;
}

function applyDealWithIncrement(n, deck) {
  const result = [];
  const len = deck.length;
  for (let i = 0; i < len; i++) {
    result[(i * n) % len] = deck[i];
  }
  return result;
}

// const case1 = `
// deal into new stack
// cut -2
// deal with increment 7
// cut 8
// cut -4
// deal with increment 7
// cut 3
// deal with increment 9
// deal with increment 3
// cut -1
// `
//   .trim()
//   .split("\n")
//   .map(parseCommand)
//   .reduce(
//     applyTechnique,
//     Array.from(Array(10), (_, i) => i)
//   );

// console.log(case1);
