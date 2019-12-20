const assert = require("assert");

require("./Problem")({
  input() {
    return require("./Input").day(20, false);
  },
  solve(input) {
    return {
      "Part 1": part1(input),
      "Part 2": part2(input)
    };
  }
}).run();

function setM(x, y, value, map) {
  map[y] = map[y] || {};
  map[y][x] = value;
}

function getM(x, y, map) {
  return map[y] && map[y][x];
}

const MapObjects = {
  Wall: "#",
  Passage: ".",
  Empty: " "
};

const isPortal = val => /[A-Z]/.test(val);

function* traverseMap(map) {
  for (let y in map) {
    for (let x in map[y]) {
      yield { val: map[y][x], x: Number(x), y: Number(y) };
    }
  }
}

function getCorners(map) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = 0;
  let maxY = 0;
  for (const { x, y, val } of traverseMap(map)) {
    if (val === MapObjects.Wall) {
      minX = Math.min(x, minX);
      maxX = Math.max(x, maxX);
      minY = Math.min(y, minY);
      maxY = Math.max(y, maxY);
    }
  }
  return {
    topLeft: { x: minX, y: minY },
    bottomRight: { x: maxX, y: maxY }
  };
}

function parseMap(str) {
  const portalPositions = [];

  let map = {};

  let x = 0;
  let y = 0;
  for (let char of str) {
    if (char === "\n") {
      y++;
      x = 0;
    } else {
      if (isPortal(char)) {
        portalPositions.push([x, y]);
      }
      setM(x, y, char, map);
      x++;
    }
  }

  const { bottomRight, topLeft } = getCorners(map);

  const portalList = [];
  let entrance;
  let target;

  const outerPortals = {};
  const innerPortals = {};

  for (let [x, y] of portalPositions) {
    const portal = tryCreatePortal(x, y, map);
    if (portal) {
      if (portal.name === "AA") {
        entrance = portal.exit;
      }
      if (portal.name === "ZZ") {
        target = portal.exit;
      }
      if (
        portal.exit.x === bottomRight.x ||
        portal.exit.y === bottomRight.y ||
        portal.exit.x === topLeft.x ||
        portal.exit.y === topLeft.y
      ) {
        setM(x, y, true, outerPortals);
      } else {
        setM(x, y, true, innerPortals);
      }
      portalList.push([portal, { x, y }]);
    }
  }

  const portals = {};
  portalList.forEach(pairA => {
    const [, posA] = pairA;
    const result = portalList.find(
      pairB => pairA !== pairB && pairA[0].name === pairB[0].name
    );
    if (result) {
      const [portalB] = result;
      setM(posA.x, posA.y, portalB.exit, portals);
    }
  });

  return { map, portals, entrance, target, outerPortals, innerPortals };
}

function tryCreatePortal(x, y, map) {
  const center = getM(x, y, map);
  const top = getM(x, y - 1, map);
  const right = getM(x + 1, y, map);
  const bottom = getM(x, y + 1, map);
  const left = getM(x - 1, y, map);

  if (!isPortal(center)) {
    return null;
  }

  if (isPortal(top) && bottom === MapObjects.Passage) {
    return {
      name: top + center,
      exit: { x, y: y + 1 }
    };
  }

  if (isPortal(left) && right === MapObjects.Passage) {
    return {
      name: left + center,
      exit: { x: x + 1, y }
    };
  }

  if (isPortal(right) && left === MapObjects.Passage) {
    return {
      name: center + right,
      exit: { x: x - 1, y }
    };
  }

  if (isPortal(bottom) && top === MapObjects.Passage) {
    return {
      name: center + bottom,
      exit: { x, y: y - 1 }
    };
  }

  return null;
}
const Deltas = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1]
];

function bfs(entrance, target, map, portals) {
  let result = Infinity;
  let resultPath = [];

  const queue = [[entrance, 0, [entrance]]];
  const visited = {};
  while (queue.length) {
    const [curPos, distance, path] = queue.shift();
    if (getM(curPos.x, curPos.y, visited)) {
      continue;
    }
    setM(curPos.x, curPos.y, true, visited);

    for (const [dx, dy] of Deltas) {
      const x = dx + curPos.x;
      const y = dy + curPos.y;

      const val = getM(x, y, map);

      if (x === target.x && y === target.y) {
        if (result > distance) {
          result = distance + 1;
          resultPath = path;
        }
        continue;
      }

      if (val === MapObjects.Passage) {
        queue.push([{ x, y }, distance + 1, path.concat({ x, y })]);
      }

      if (isPortal(val)) {
        const nextPos = getM(x, y, portals);
        if (nextPos) {
          queue.push([nextPos, distance + 1, path.concat(nextPos)]);
        }
      }
    }
  }

  return result;
}

function part1(input) {
  const { map, portals, entrance, target } = parseMap(input);
  return bfs(entrance, target, map, portals);
}

function bfs2({ map, portals, entrance, target, outerPortals, innerPortals }) {
  const queue = [[entrance, 0, 0, [{ ...entrance, level: 0 }]]];
  const visited = {};
  let result = Infinity;
  let resultPath = [];

  while (queue.length) {
    const [curPos, distance, level, path] = queue.shift();
    if (!visited[level]) {
      visited[level] = {};
    }
    if (getM(curPos.x, curPos.y, visited[level])) {
      continue;
    }
    setM(curPos.x, curPos.y, true, visited[level]);

    if (distance > result) {
      continue;
    }

    for (const [dx, dy] of Deltas) {
      const x = dx + curPos.x;
      const y = dy + curPos.y;

      const val = getM(x, y, map);

      if (level === 0 && x === target.x && y === target.y) {
        if (result > distance) {
          result = distance + 1;
          resultPath = path;
        }
        continue;
      }

      if (val === MapObjects.Passage) {
        queue.push([
          { x, y },
          distance + 1,
          level,
          path.concat({ x, y, level })
        ]);
      }

      if (isPortal(val)) {
        const nextPos = getM(x, y, portals);
        const nextLevel = getM(x, y, outerPortals) ? level - 1 : level + 1;
        if (nextPos && level >= 0) {
          queue.push([
            nextPos,
            distance + 1,
            nextLevel,
            path.concat({ ...nextPos, level: nextLevel })
          ]);
        }
      }
    }
  }

  //   console.log(
  //     resultPath.map(({ x, y, level }) => `${level}: ${x},${y}`).join("\n")
  //   );
  return result;
}

function part2(input) {
  return bfs2(parseMap(input));
}

const case1 = `
         A           
         A           
  #######.#########  
  #######.........#  
  #######.#######.#  
  #######.#######.#  
  #######.#######.#  
  #####  B    ###.#  
BC...##  C    ###.#  
  ##.##       ###.#  
  ##...DE  F  ###.#  
  #####    G  ###.#  
  #########.#####.#  
DE..#######...###.#  
  #.#########.###.#  
FG..#########.....#  
  ###########.#####  
             Z       
             Z       
`;

// assert.equal(part2(case1), 26);

const case2 = `
             Z L X W       C                 
             Z P Q B       K                 
  ###########.#.#.#.#######.###############  
  #...#.......#.#.......#.#.......#.#.#...#  
  ###.#.#.#.#.#.#.#.###.#.#.#######.#.#.###  
  #.#...#.#.#...#.#.#...#...#...#.#.......#  
  #.###.#######.###.###.#.###.###.#.#######  
  #...#.......#.#...#...#.............#...#  
  #.#########.#######.#.#######.#######.###  
  #...#.#    F       R I       Z    #.#.#.#  
  #.###.#    D       E C       H    #.#.#.#  
  #.#...#                           #...#.#  
  #.###.#                           #.###.#  
  #.#....OA                       WB..#.#..ZH
  #.###.#                           #.#.#.#  
CJ......#                           #.....#  
  #######                           #######  
  #.#....CK                         #......IC
  #.###.#                           #.###.#  
  #.....#                           #...#.#  
  ###.###                           #.#.#.#  
XF....#.#                         RF..#.#.#  
  #####.#                           #######  
  #......CJ                       NM..#...#  
  ###.#.#                           #.###.#  
RE....#.#                           #......RF
  ###.###        X   X       L      #.#.#.#  
  #.....#        F   Q       P      #.#.#.#  
  ###.###########.###.#######.#########.###  
  #.....#...#.....#.......#...#.....#.#...#  
  #####.#.###.#######.#######.###.###.#.#.#  
  #.......#.......#.#.#.#.#...#...#...#.#.#  
  #####.###.#####.#.#.#.#.###.###.#.###.###  
  #.......#.....#.#...#...............#...#  
  #############.#.#.###.###################  
               A O F   N                     
               A A D   M                     `;
// assert.equal(part2(case2), 396);
