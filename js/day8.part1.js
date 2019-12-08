require("./Problem")({
  input() {
    return require("./Input").day(8);
  },
  solve(chars) {
    const layers = parseImage(chars, 25, 6);

    let minZeroes = countDigit(0, layers[0]);
    let ones = countDigit(1, layers[0]);
    let twos = countDigit(2, layers[0]);

    for (let i = 1; i < layers.length; i++) {
      let zeroes = countDigit(0, layers[i]);
      if (zeroes < minZeroes) {
        minZeroes = zeroes;
        ones = countDigit(1, layers[i]);
        twos = countDigit(2, layers[i]);
      }
    }

    return ones * twos;
  }
}).run();

function countDigit(digit, layer) {
  let result = 0;
  layer.forEach(row => {
    for (const d of row) {
      if (d == digit) result++;
    }
  });
  return result;
}

function parseImage(chars, width, height) {
  const rows = chunk(width, chars);
  const layers = chunk(height, rows);
  return layers;
}

function chunk(chunkSize, list) {
  const result = [];
  while (list.length) {
    const chunk = list.slice(0, chunkSize);
    result.push(chunk);
    list = list.slice(chunkSize);
  }
  return result;
}
