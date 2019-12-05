module Day5
    ( part1
    , part2
    )
where

import           Lib
import           Debug.Trace

prepareInput = map (read :: String -> Int) <$> readInputForDayAsCSV 5

part1 = do
    commands <- prepareInput
    return $ last $ runProgramm commands [1] [] 0

part2 = print "Aloha"

data Command =
    SumC Int Int Int
    | ProdC Int Int Int
    | InputC Int
    | OutputC Int
    | Halt
    deriving Show

runProgramm :: [Int] -> [Int] -> [Int] -> Int -> [Int]
runProgramm commands input output curPos =
    let (command, shift)             = parseCommand commands curPos
        (commands', input', output') = runCommand commands input output command
    in  case command of
            Halt -> output'
            _    -> runProgramm commands' input' output' (curPos + shift)

runCommand :: [Int] -> [Int] -> [Int] -> Command -> ([Int], [Int], [Int])
runCommand commands input output command = case command of
    (SumC  l r p) -> (replaceNth p (l + r) commands, input, output)
    (ProdC l r p) -> (replaceNth p (l * r) commands, input, output)
    (InputC  p  ) -> (replaceNth p (head input) commands, tail input, output)
    (OutputC p  ) -> (commands, input, output ++ [commands !! p])
    Halt          -> (commands, input, output)

parseCommand :: [Int] -> Int -> (Command, Int)
parseCommand commands pos =
    let commandAndModes = commands !! pos
        command         = commandAndModes `mod` 100
        modes           = commandAndModes `div` 100
        mode1           = modes `mod` 10
        mode2           = (modes `div` 10) `mod` 10
        mode3           = (modes `div` 100) `mod` 10
        p' mode valPos = param commands mode (valPos + pos)
        p'' valPos = commands !! (pos + valPos)
    in  case command of
            1  -> (SumC (p' mode1 1) (p' mode2 2) (p'' 3), 4)
            2  -> (ProdC (p' mode1 1) (p' mode2 2) (p'' 3), 4)
            3  -> (InputC (p'' 1), 2)
            4  -> (OutputC (p'' 1), 2)
            99 -> (Halt, 0)
            _  -> undefined

param :: [Int] -> Int -> Int -> Int
param commands mode valPos = case mode of
    0 -> commands !! (commands !! valPos)
    1 -> commands !! valPos
