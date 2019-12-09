module Day9
    ( part1
    , part2
    )
where

import           Lib
import           IntcodeComputer
import           Data.List
import           Debug.Trace

prepareInput input =
    (\p -> p { input = input })
        .   fromRegistries
        .   map (read :: String -> Int)
        <$> readInputForDayAsCSV 9

part1 = last . output . runProgramm <$> prepareInput [1]

part2 = last . output . runProgramm <$> prepareInput [2]
