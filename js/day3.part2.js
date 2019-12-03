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
      const steps = { current: 0 };
      cabel.forEach(move => {
        markMove(move, grid, currentPos, crosses, 3 + idx, steps);
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

function distance([x, y, steps]) {
  return steps;
}

function markMove(move, grid, currentPos, crosses, id, steps) {
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

    steps.current++;
    const [x, y] = currentPos;
    grid[y] = grid[y] || {};
    if (grid[y][x] && grid[y][x][0] !== id) {
      crosses.push([x, y, steps.current + grid[y][x][1]]);
      grid[y][x] = 2;
    } else {
      grid[y][x] = [id, steps.current];
    }
  }
}
