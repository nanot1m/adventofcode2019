{-# LANGUAGE TupleSections #-}
module Day16 where


import           Lib
import           Debug.Trace
import           Data.Char

prepareInput :: IO [Int]
prepareInput = map (read . (: "")) <$> readInputForDay 16

iteratePhaseForPos :: [Int] -> Int -> [Int] -> Int
iteratePhaseForPos phase idx = (`mod` 10) . abs . sum . zipWith (*) phase'
    where phase' = drop 1 . cycle . concatMap (replicate idx) $ phase


iteratePhase :: [Int] -> [Int] -> [Int]
iteratePhase phase input = map mapper [1 .. (length input)]
    where mapper idx = iteratePhaseForPos phase idx input

initPhase = [0, 1, 0, -1]

iteratePhaseTimes :: Int -> [Int] -> [Int]
iteratePhaseTimes times = (!! times) . iterate iteratePhase'
    where iteratePhase' = iteratePhase initPhase

part1 = do
    input <- prepareInput
    return . map intToDigit . take 8 . iteratePhaseTimes 100 $ input

part2 = print "Aloha"
