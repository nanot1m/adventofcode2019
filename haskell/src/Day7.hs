module Day7
    ( part1
    , part2
    )
where

import           Lib
import           IntcodeComputer
import           Data.List

prepareInput = do
    registries <- map (read :: String -> Int) <$> readInputForDayAsCSV 7
    return Program { registries = registries
                   , input      = []
                   , output     = []
                   , position   = 0
                   , status     = Running
                   }

part1 = findMaxOutput <$> prepareInput

part2 = putStrLn "ALOHA"

runAmplifiers :: Program -> [Int] -> Program
runAmplifiers p (ph1 : phs) =
    let programA = runProgramm $ p { input = ph1 : [0] }
        reducer acc ph = runProgramm p { input = ph : [last (output acc)] }
    in  foldl reducer programA phs

findMaxOutput :: Program -> Int
findMaxOutput p = maximum
    [ (last . output) $ runAmplifiers p phase
    | phase <- permutations [0, 1, 2, 3, 4]
    ]
