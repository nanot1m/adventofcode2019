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
function parseCommand(line, converter = Number) {
  if (line.startsWith(Techniques.DealIntoNewStack)) {
    return { type: Techniques.DealIntoNewStack };
  }
  if (line.startsWith(Techniques.CutNCards)) {
    const n = line.slice(Techniques.CutNCards.length + 1);
    return { type: Techniques.CutNCards, count: converter(n) };
  }
  if (line.startsWith(Techniques.DealWithIncrementN)) {
    const n = line.slice(Techniques.DealWithIncrementN.length + 1);
    return { type: Techniques.DealWithIncrementN, count: converter(n) };
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
  // from https://github.com/caderek/aoc2019/blob/master/src/day22/index.ts
  // explanations:
  // - https://www.reddit.com/r/adventofcode/comments/ee0rqi/2019_day_22_solutions/fbnkaju/
  // - https://przybyl.io/solution-explanation-to-day-22-of-advent-of-code-2019.html
  const techniques = toTechniques(lines, BigInt);
  const times = 101741582076661n;
  const deckSize = 119315717514047n;
  const cardPosition = 2020n;

  let incMultiplier = 1n;
  let offsetDiff = 0n;

  for (const technique of techniques) {
    switch (technique.type) {
      case Techniques.DealIntoNewStack: {
        incMultiplier = -incMultiplier % deckSize;
        offsetDiff = (offsetDiff + incMultiplier) % deckSize;
        break;
      }
      case Techniques.CutNCards: {
        offsetDiff = (offsetDiff + technique.count * incMultiplier) % deckSize;
        break;
      }
      case Techniques.DealWithIncrementN: {
        incMultiplier =
          (incMultiplier * modInv(technique.count, deckSize)) % deckSize;
        break;
      }
    }
  }

  const inc = modPow(incMultiplier, times, deckSize);
  const mi = modInv((1n - incMultiplier) % deckSize, deckSize);
  const offset = (offsetDiff * (1n - inc) * mi) % deckSize;
  return Number((offset + inc * cardPosition) % deckSize);
}

/**
 *
 * @param {string[]} lines
 */
function toTechniques(lines, converter = Number) {
  const result = [];
  for (const line of lines) {
    const technique = parseCommand(line, converter);
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

const _ZERO = BigInt(0);
const _ONE = BigInt(1);
const _TWO = BigInt(2);

/**
 * Finds the smallest positive element that is congruent to a in modulo n
 * @param {number|bigint} a An integer
 * @param {number|bigint} n The modulo
 *
 * @returns {bigint} The smallest positive representation of a in modulo n
 */
function toZn(a, n) {
  n = BigInt(n);
  if (n <= 0) return NaN;

  a = BigInt(a) % n;
  return a < 0 ? a + n : a;
}

/**
 * Modular inverse.
 *
 * @param {number|bigint} a The number to find an inverse for
 * @param {number|bigint} n The modulo
 *
 * @returns {bigint} the inverse modulo n or NaN if it does not exist
 */
function modInv(a, n) {
  if ((a == _ZERO) | (n <= _ZERO)) return NaN;

  let egcd = eGcd(toZn(a, n), n);
  if (egcd.b !== _ONE) {
    return NaN; // modular inverse does not exist
  } else {
    return toZn(egcd.x, n);
  }
}

/**
 * @typedef {Object} egcdReturn A triple (g, x, y), such that ax + by = g = gcd(a, b).
 * @property {bigint} g
 * @property {bigint} x
 * @property {bigint} y
 */
/**
 * An iterative implementation of the extended euclidean algorithm or extended greatest common divisor algorithm.
 * Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
 *
 * @param {number|bigint} a
 * @param {number|bigint} b
 *
 * @returns {egcdReturn} A triple (g, x, y), such that ax + by = g = gcd(a, b).
 */
function eGcd(a, b) {
  a = BigInt(a);
  b = BigInt(b);
  if ((a <= _ZERO) | (b <= _ZERO)) return NaN; // a and b MUST be positive

  let x = _ZERO;
  let y = _ONE;
  let u = _ONE;
  let v = _ZERO;

  while (a !== _ZERO) {
    let q = b / a;
    let r = b % a;
    let m = x - u * q;
    let n = y - v * q;
    b = a;
    a = r;
    x = u;
    y = v;
    u = m;
    v = n;
  }
  return {
    b: b,
    x: x,
    y: y
  };
}

/**
 * Modular exponentiation b**e mod n. Currently using the right-to-left binary method
 *
 * @param {number|bigint} b base
 * @param {number|bigint} e exponent
 * @param {number|bigint} n modulo
 *
 * @returns {bigint} b**e mod n
 */
function modPow(b, e, n) {
  n = BigInt(n);
  if (n === _ZERO) return NaN;
  else if (n === _ONE) return _ZERO;

  b = toZn(b, n);

  e = BigInt(e);
  if (e < _ZERO) {
    return modInv(modPow(b, abs(e), n), n);
  }

  let r = _ONE;
  while (e > 0) {
    if (e % _TWO === _ONE) {
      r = (r * b) % n;
    }
    e = e / _TWO;
    b = b ** _TWO % n;
  }
  return r;
}
