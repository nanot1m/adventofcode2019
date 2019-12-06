module Main where


import           System.Environment
import qualified Day1
import qualified Day2
import qualified Day4
import qualified Day5
import qualified Day6

main :: IO ()
main = do
    [dayN] <- getArgs
    case dayN of
        "1" -> printResults Day1.part1 Day1.part2
        "2" -> printResults Day2.part1 Day2.part2
        "4" -> printResults Day4.part1 Day4.part2
        "5" -> printResults Day5.part1 Day5.part2
        "6" -> printResults Day6.part1 Day6.part2
        _   -> putStrLn "Not implemented"


printResults a b = do
    part1 <- a
    part2 <- b
    putStrLn $ "Part 1: " ++ show part1
    putStrLn $ "Part 2: " ++ show part2
