require("./Problem")({
  input() {
    return require("./Input")
      .day(3)
      .split("\n")
      .map(line => line.split(","));
  },
  solve(cabels) {
    const grid = { 0: { 0: 0 } };
    const crosses = [];
    cabels.forEach((cabel, idx) => {
      const currentPos = [0, 0];
      cabel.forEach(move => {
        markMove(move, grid, currentPos, crosses, 3 + idx);
      });
    });

    let min = crosses[0];
    for (let i = 1; i < crosses.length; i++) {
      if (distance(min) > distance(crosses[i])) {
        min = crosses[i];
      }
    }
    return distance(min);
  }
}).run();

function distance([x, y]) {
  return Math.abs(x) + Math.abs(y);
}

function markMove(move, grid, currentPos, crosses, id) {
  const dir = move[0];
  const len = Number(move.slice(1));

  for (let i = 0; i < len; i++) {
    switch (dir) {
      case "R": {
        currentPos[0]++;
        break;
      }
      case "U": {
        currentPos[1]++;
        break;
      }
      case "D": {
        currentPos[1]--;
        break;
      }
      case "L": {
        currentPos[0]--;
        break;
      }
    }

    const [x, y] = currentPos;
    grid[y] = grid[y] || {};
    if (grid[y][x] && grid[y][x] !== id) {
      crosses.push([x, y]);
      grid[y][x] = 2;
    } else {
      grid[y][x] = id;
    }
  }
}
