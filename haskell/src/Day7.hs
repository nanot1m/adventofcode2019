module Day7
    ( part1
    , part2
    )
where

import           Lib
import           IntcodeComputer
import           Data.List
import           Debug.Trace

prepareInput = do
    registries <- map (read :: String -> Int) <$> readInputForDayAsCSV 7
    return Program { registries = registries
                   , input      = []
                   , output     = []
                   , position   = 0
                   , status     = Running
                   }

part1 = findMaxOutput <$> prepareInput

part2 = findMaxOutput' <$> prepareInput

runAmplifiersWithInit :: Int -> Program -> [Int] -> Program
runAmplifiersWithInit init p (ph1 : phs) =
    let programA = runProgramm $ p { input = ph1 : [init] }
        reducer acc ph = runProgramm p { input = ph : [last (output acc)] }
    in  foldl reducer programA phs

runAmplifiers :: Program -> [Int] -> Int
runAmplifiers p phs = last . output $ runAmplifiersWithInit 0 p phs

findMaxOutput :: Program -> Int
findMaxOutput p =
    maximum [ runAmplifiers p phase | phase <- permutations [0, 1, 2, 3, 4] ]

newtype Amplifiers = Amps (Program, Program, Program, Program, Program) deriving Show

iterAmplifiersInFeedbackLoop :: Amplifiers -> Amplifiers
iterAmplifiersInFeedbackLoop amps@(Amps (p1, p2, p3, p4, p5)) =
    let inputFromOutput p = [ last . output $ p | (not . null . output) p ]
        p2' = runProgramm $ p2 { input = inputFromOutput p1 }
        p3' = runProgramm $ p3 { input = inputFromOutput p2' }
        p4' = runProgramm $ p4 { input = inputFromOutput p3' }
        p5' = runProgramm $ p5 { input = inputFromOutput p4' }
        p1' = runProgramm $ p1 { input = inputFromOutput p5' }
    in  Amps (p1', p2', p3', p4', p5')

runAmplifiersInFeedbackLoop :: [Int] -> Program -> Int
runAmplifiersInFeedbackLoop phases =
    last
        . output
        . lastAmp
        . head
        . dropWhile ((/= Halted) . status . lastAmp)
        . iterate iterAmplifiersInFeedbackLoop
        . initAmps phases

lastAmp :: Amplifiers -> Program
lastAmp (Amps (_, _, _, _, p)) = p

initAmps :: [Int] -> Program -> Amplifiers
initAmps (ph1 : ph2 : ph3 : ph4 : ph5 : _) p = Amps
    ( runProgramm $ p { input = [ph1, 0] }
    , runProgramm $ p { input = [ph2] }
    , runProgramm $ p { input = [ph3] }
    , runProgramm $ p { input = [ph4] }
    , runProgramm $ p { input = [ph5] }
    )

findMaxOutput' :: Program -> Int
findMaxOutput' p = maximum
    [ runAmplifiersInFeedbackLoop phase p
    | phase <- permutations [5, 6, 7, 8, 9]
    ]
