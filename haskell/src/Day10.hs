module Day10
    ( part1
    )
where

import           Lib
import           Data.List
import qualified Data.Map                      as M
import           Data.Ord

data SpaceObject = Empty | Asteroid deriving (Eq, Show)

type Pos = (Int, Int)

type SpaceMap = M.Map (Int, Int) SpaceObject

prepareInput :: IO SpaceMap
prepareInput =
    M.fromList
        .   concatMap (\(y, line) -> zipWith (\x c -> ((x, y), c)) [0 ..] line)
        .   zip [0 ..]
        .   map (map toSpaceObject)
        .   lines
        <$> readInputForDay 10
  where
    toSpaceObject ch = case ch of
        '#' -> Asteroid
        _   -> Empty


part1 = M.size . getBestPosition <$> prepareInput

getBestPosition :: SpaceMap -> M.Map Double [Pos]
getBestPosition spaceMap =
    maximumBy (comparing M.size)
        . map (`collectPointsOnSightFromPoint` spaceMap)
        . getAllAsteroidPositions
        $ spaceMap


collectPointsOnSightFromPoint :: Pos -> SpaceMap -> M.Map Double [Pos]
collectPointsOnSightFromPoint pos =
    M.fromListWith (++)
        . map (\pos' -> (getAngle pos pos', [pos']))
        . filter (/= pos)
        . getAllAsteroidPositions

getAllAsteroidPositions :: SpaceMap -> [Pos]
getAllAsteroidPositions = M.keys . M.filter isAsteroid

isAsteroid :: SpaceObject -> Bool
isAsteroid Asteroid = True
isAsteroid _        = False

getAngle :: Pos -> Pos -> Double
getAngle (x1, y1) (x2, y2) =
    let dy    = fromIntegral (y2 - y1)
        dx    = fromIntegral (x2 - x1)
        angle = atan2 dy dx * 180.0 / pi + 90.0
    in  if angle < 0 then angle + 360.0 else angle
