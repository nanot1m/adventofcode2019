module Day11
    ( part1
    , part2
    )
where

import           Lib
import           Data.List
import qualified Data.Map                      as M
import           IntcodeComputer
import           Data.Maybe

prepareInput :: IO Program
prepareInput =
    fromRegistries . map (read :: String -> Int) <$> readInputForDayAsCSV 11

part1 = do
    p <- prepareInput
    let (dir, grid, pos, colored) = buildHull p { input = [0] }
    putStr (drawMap pos dir grid)
    return $ M.size colored

part2 = do
    p <- prepareInput
    let (dir, grid, pos, _) = buildHull p { input = [1] }
    putStr (drawMap pos dir grid)
    return ()

type Grid = M.Map Pos Color

type Colored = M.Map Pos Int

type Pos = (Int, Int)

type Step = (Color, Rotation)

data Dir = TopD | RightD | BottomD | LeftD deriving (Show, Eq)

data Rotation = AntiClockwise | Clockwise deriving (Enum, Show, Eq)

data Color = Black | White deriving (Enum, Show, Eq)

type HullResult = (Dir, Grid, Pos, Colored)

rotate :: Rotation -> Dir -> Dir
rotate Clockwise dir = case dir of
    TopD    -> RightD
    RightD  -> BottomD
    BottomD -> LeftD
    LeftD   -> TopD
rotate AntiClockwise dir = case dir of
    TopD    -> LeftD
    LeftD   -> BottomD
    BottomD -> RightD
    RightD  -> TopD

toRotation :: Int -> Rotation
toRotation = toEnum

toColor :: Int -> Color
toColor = toEnum

getNextStep :: Program -> Step
getNextStep =
    (\(d : c : _) -> (toColor c, toRotation d)) . take 2 . reverse . output

moveTo :: Dir -> Pos -> Pos
moveTo TopD    (x, y) = (x, y - 1)
moveTo BottomD (x, y) = (x, y + 1)
moveTo LeftD   (x, y) = (x - 1, y)
moveTo RightD  (x, y) = (x + 1, y)

applyStep :: Step -> HullResult -> HullResult
applyStep (color, rotation) (dir, grid, pos, coloredCells) =
    (dir', grid', pos', coloredCells')
  where
    grid'         = M.insert pos color grid
    coloredCells' = M.insertWith (+) pos 1 coloredCells
    dir'          = rotate rotation dir
    pos'          = moveTo dir' pos

buildHull :: Program -> HullResult
buildHull = curry buildHull' (TopD, M.fromList [], (0, 0), M.fromList [])
  where
    buildHull' (result, p) | isHalted p = result
                           | otherwise  = buildHull' $ buildNextHull (result, p)

buildNextHull :: (HullResult, Program) -> (HullResult, Program)
buildNextHull (result, p) = (result', p'')
  where
    p'                        = runProgramm p
    step                      = getNextStep p'
    result'@(_, grid, pos, _) = applyStep step result
    curColor                  = fromMaybe Black (M.lookup pos grid)
    p''                       = p' { input = input p' ++ [fromEnum curColor] }

drawMap :: Pos -> Dir -> Grid -> String
drawMap pos dir grid = unlines image
  where
    allCoords = M.keys grid
    xs        = map fst allCoords
    ys        = map snd allCoords
    minX      = min (minimum xs - 2) (-5)
    maxX      = max (maximum xs + 2) 5
    minY      = min (minimum ys - 2) (-5)
    maxY      = max (maximum ys + 2) 5
    width     = maxX - minX
    height    = maxY - minY
    getChar' pos' = if pos == pos' then drawDir dir else getMapChar pos' grid
    drawLine y = [ getChar' (x, y) | x <- [minX .. maxX] ]
    image = [ drawLine y | y <- [minY .. maxY] ]

getMapChar :: Pos -> Grid -> Char
getMapChar pos grid = maybe ' ' colorToCh (M.lookup pos grid)
  where
    colorToCh White = 'O'
    colorToCh Black = ' '

drawDir :: Dir -> Char
drawDir dir = case dir of
    TopD    -> '˄'
    RightD  -> '˃'
    BottomD -> '˅'
    LeftD   -> '˂'

