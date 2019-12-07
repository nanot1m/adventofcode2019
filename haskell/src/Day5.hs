module Day5
    ( part1
    , part2
    )
where

import           Lib
import           IntcodeComputer

prepareInput input = do
    registries <- map (read :: String -> Int) <$> readInputForDayAsCSV 5
    return Program { registries = registries
                   , input      = input
                   , output     = []
                   , position   = 0
                   , status     = Running
                   }

part1 = last . output . runProgramm <$> prepareInput [1]

part2 = last . output . runProgramm <$> prepareInput [5]
