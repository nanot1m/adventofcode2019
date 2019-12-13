module Day13
    ( part1
    , part2
    )
where

import           Lib
import           IntcodeComputer
import qualified Data.Map                      as M
import           Data.Maybe
import           Data.List
import           Debug.Trace
import           Data.Bifunctor

prepareInput = fromRegistries . map read <$> readInputForDayAsCSV 13

part1 = countBlocks . output . runProgramm <$> prepareInput

part2 = do
    p <- prepareInput
    let p' = runProgramm p { registries = M.insert 0 2 (registries p) }
    let gs = getGameScreen . map toPixel . chunkBy 3 . output $ p'
    return . last . output . playGame $ (gs, p')

type Pos = (Int, Int)
type Pixel = (Pos, Int)
type GameScreen = M.Map Pos Int

playGame :: (GameScreen, Program) -> Program
playGame (gs, p) | isHalted p = p
                 | otherwise  = playGame (iterateGame gs p)

--  trace (unlines (gameScreenToImage gs'))
iterateGame :: GameScreen -> Program -> (GameScreen, Program)
iterateGame gs p = (gs', p')
  where
    resultOutput = output p
    ballPos      = getBallPos gs
    paddlePos    = getPaddlePos gs
    dx           = getPaddleDx paddlePos ballPos
    p'           = runProgramm p { input = [dx] }
    newChunkSize = length (output p') - length resultOutput
    newChunk     = lastN newChunkSize . output $ p'
    gs'          = updateGs gs $ map toPixel . chunkBy 3 $ newChunk

lastN :: Int -> [a] -> [a]
lastN n xs = foldl' (const . drop 1) xs (drop n xs)

updateGs :: GameScreen -> [Pixel] -> GameScreen
updateGs = foldl' (flip $ uncurry M.insert)

getPaddleDx :: Pos -> Pos -> Int
getPaddleDx (px, _) (bx, _) | px > bx  = -1
                            | px < bx  = 1
                            | px == bx = 0

getObjPos :: Int -> GameScreen -> Maybe Pos
getObjPos obj = fmap fst . find ((== obj) . snd) . M.toList

getPaddlePos :: GameScreen -> Pos
getPaddlePos = fromMaybe (0, 0) . getObjPos 3

getBallPos :: GameScreen -> Pos
getBallPos = fromMaybe (0, 0) . getObjPos 4

countBlocks :: [Int] -> Int
countBlocks = length . filter (\(_ : _ : v : _) -> v == 2) . chunkBy 3

drawScreen :: [Int] -> String
drawScreen =
    unlines . gameScreenToImage . getGameScreen . map toPixel . chunkBy 3

gameScreenToImage :: GameScreen -> [String]
gameScreenToImage gameScreen = image
  where
    poses  = M.keys gameScreen
    xs     = map fst poses
    ys     = map snd poses
    minX   = minimum xs
    maxX   = maximum xs + 1
    minY   = minimum ys
    maxY   = maximum ys
    toChar = toGameChar . fromMaybe 0
    drawLine y = [ toChar $ M.lookup (x, y) gameScreen | x <- [minX .. maxX] ]
    image = [ drawLine y | y <- [minY .. maxY] ]


getGameScreen :: [Pixel] -> GameScreen
getGameScreen = M.fromList

toPixel :: [Int] -> Pixel
toPixel (a : b : c : _) = ((a, b), c)

toGameChar :: Int -> Char
toGameChar value = case value of
    0 -> '.'
    1 -> '#'
    2 -> 'x'
    3 -> '='
    4 -> 'o'
    _ -> toGameChar 0
