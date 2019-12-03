module Day1
    ( part1
    , part2
    )
where

import           Lib

prepareInput = map (read :: String -> Int) . lines <$> readInputForDay 1

calcFuel :: Int -> Int
calcFuel mass = mass `div` 3 - 2

part1 = sum . map calcFuel <$> prepareInput

part2 = sum . map calcFuel' <$> prepareInput
  where
    calcFuel' mass | mass < 9  = 0
                   | otherwise = let cur = calcFuel mass in cur + calcFuel' cur

