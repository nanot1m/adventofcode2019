module Day2
    ( part1
    , part2
    )
where

import           Lib
import           Data.List

prepareInput = map (read :: String -> Int) . splitByComma <$> readInputForDay 2

part1 = runProgramm' 12 2 <$> prepareInput

part2 = do
    input <- prepareInput
    let result = find
            (\(x, _, _) -> x == 19690720)
            [ (runProgramm' x y input, x, y) | x <- [1 .. 99], y <- [2 .. 99] ]
    case result of
        Just (_, x, y) -> return (x * 100 + y)
        _              -> undefined

runProgramm' :: Int -> Int -> [Int] -> Int
runProgramm' noun verb commands =
    let input'  = replaceNth 1 noun commands
        input'' = replaceNth 2 verb input'
    in  head (runProgramm input'' 0)

runProgramm :: [Int] -> Int -> [Int]
runProgramm commands curPos =
    let leftOperand  = commands !! (commands !! (curPos + 1))
        rightOperand = commands !! (commands !! (curPos + 2))
        resultPos    = commands !! (curPos + 3)
        sum'         = replaceNth resultPos (leftOperand + rightOperand)
        prod'        = replaceNth resultPos (leftOperand * rightOperand)
    in  case commands !! curPos of
            99 -> commands
            1  -> runProgramm (sum' commands) (curPos + 4)
            2  -> runProgramm (prod' commands) (curPos + 4)
            _  -> undefined
